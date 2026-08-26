/**
 * End-to-end behaviour checks for the things that actually break in this kind
 * of site, run against a real browser.
 *
 *   npm run verify                       # http://localhost:3000
 *   BASE=https://your-domain npm run verify
 *
 * Covers:
 *   1. language switch replaces the content and survives navigation
 *   2. gallery lightbox: opens above everything, locks the body, Escape closes
 *      it and gives the scroll position back
 *   3. phone: hamburger opens, cookie banner steps out of its way
 *   4. phone: the calendar opens from anywhere on the field, refuses past
 *      dates, stays inside a 375px viewport, and the undecided option works
 *   5. the WhatsApp message carries every answer plus the originating page URL
 *   6. the server rejects a past date even when the client is bypassed
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:3000'
const results = []
const fail = (name, detail) => results.push({ ok: false, name, detail })
const pass = (name, detail = '') => results.push({ ok: true, name, detail })

/** The curtain covers the page for ~1.5s on first load; wait it out. */
async function settle(page) {
  await page.waitForFunction(
    () => document.querySelector('.curtain')?.getAttribute('data-phase') === 'idle',
    null,
    { timeout: 15000 },
  )
}

async function dismissCookies(page) {
  const accept = page.locator('.cookie-card .btn-primary')
  if (await accept.count()) await accept.first().click()
}

/** Waits until smooth scrolling has actually come to rest. */
async function scrollSettled(page) {
  let last = -1
  for (let i = 0; i < 40; i++) {
    const y = await page.evaluate(() => Math.round(window.scrollY))
    if (y === last) return y
    last = y
    await page.waitForTimeout(120)
  }
  return last
}

/** Centres an element so a raw coordinate click cannot land on chrome that
 *  overlays the corners (the Next dev indicator lives bottom-left). */
async function centre(locator, page) {
  await locator.scrollIntoViewIfNeeded()
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(250)
  return locator.boundingBox()
}

const browser = await chromium.launch()

/* ---------------------------------------------------------------- 1. i18n */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/id`, { waitUntil: 'networkidle' })
  await settle(page)
  await dismissCookies(page)

  const idHeadline = await page.locator('h1').first().innerText()
  const idNav = await page.locator('header nav a').first().innerText()

  await page.locator('.locale-option', { hasText: 'EN' }).click()
  await page.waitForURL('**/en', { timeout: 15000 })
  await settle(page)

  const enNav = await page.locator('header nav a').first().innerText()
  const enLede = await page.locator('.lede').first().innerText()

  if (idNav === 'Beranda' && enNav === 'Home') pass('language switch replaces navigation copy', `${idNav} -> ${enNav}`)
  else fail('language switch replaces navigation copy', `${idNav} -> ${enNav}`)

  if (/planning and running/i.test(enLede)) pass('language switch replaces body copy')
  else fail('language switch replaces body copy', enLede.slice(0, 80))

  if (idHeadline) pass('home h1 present', idHeadline)

  // Navigate on, then hard-load the bare root: the remembered locale decides.
  await page.locator('header nav a', { hasText: 'Gallery' }).click()
  await page.waitForURL('**/en/gallery', { timeout: 15000 })
  await settle(page)
  const stillEnglish = await page.locator('h1').first().innerText()
  if (/gallery/i.test(stillEnglish)) pass('locale persists across in-app navigation', stillEnglish)
  else fail('locale persists across in-app navigation', stillEnglish)

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  const landed = new URL(page.url()).pathname
  if (landed.startsWith('/en')) pass('remembered locale wins on a bare / request', landed)
  else fail('remembered locale wins on a bare / request', landed)

  await ctx.close()
}

/* ----------------------------------------------------------- 2. lightbox */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/id/galeri`, { waitUntil: 'networkidle' })
  await settle(page)
  await dismissCookies(page)

  await page.mouse.wheel(0, 900)
  const scrollBefore = await scrollSettled(page)
  if (scrollBefore > 100) pass('page scrolled before the lock was taken', String(scrollBefore))
  else fail('page scrolled before the lock was taken', String(scrollBefore))

  // Click a tile that is already fully on screen. Clicking one that is not
  // makes the driver scroll it into view first, which changes the scroll
  // position before the lock is taken and would test nothing.
  const tileIndex = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll('.gallery-tile')]
    const headerH = document.querySelector('.site-header').getBoundingClientRect().height
    return tiles.findIndex((t) => {
      const r = t.getBoundingClientRect()
      return r.top >= headerH + 4 && r.bottom <= window.innerHeight - 4
    })
  })
  if (tileIndex < 0) fail('a gallery tile is fully visible after scrolling')
  await page.locator('.gallery-tile').nth(Math.max(0, tileIndex)).click()
  await page.waitForSelector('.lightbox', { timeout: 5000 })
  // The portal paints before the scroll-lock effect commits. Read state only
  // once the lock is actually on, otherwise the assertions race the commit.
  await page.waitForFunction(() => document.body.dataset.scrollLocked === 'true', null, {
    timeout: 5000,
  })

  const state = await page.evaluate(() => {
    const lb = document.querySelector('.lightbox')
    const scrim = document.querySelector('.lightbox-scrim')
    return {
      parent: lb.parentElement.tagName,
      z: Number(getComputedStyle(lb).zIndex),
      headerZ: Number(getComputedStyle(document.querySelector('.site-header')).zIndex),
      locked: document.body.dataset.scrollLocked === 'true',
      /* The Y the provider actually captured when it took the lock. Comparing
         the restore against this, rather than against a reading taken before
         the click, is immune to smooth scrolling still easing when the tile
         was clicked. */
      lockedAt: Math.round(
        parseFloat(getComputedStyle(document.body).getPropertyValue('--locked-scroll')) || 0,
      ),
      scrimCovers:
        scrim.getBoundingClientRect().width >= window.innerWidth - 1 &&
        scrim.getBoundingClientRect().height >= window.innerHeight - 1,
      /* Ancestors between the lightbox and <body>. <body> itself is excluded:
         it is deliberately clipped while the scroll lock is active. */
      clipped: (() => {
        let el = lb.parentElement
        while (el && el !== document.body) {
          if (getComputedStyle(el).overflow.includes('hidden')) return true
          el = el.parentElement
        }
        return false
      })(),
    }
  })

  if (state.parent === 'BODY') pass('lightbox is portalled to <body>')
  else fail('lightbox is portalled to <body>', state.parent)
  if (state.z > state.headerZ) pass('lightbox sits above the header', `${state.z} > ${state.headerZ}`)
  else fail('lightbox sits above the header', `${state.z} vs ${state.headerZ}`)
  if (state.locked) pass('lightbox locks body scroll')
  else fail('lightbox locks body scroll')
  if (state.scrimCovers) pass('lightbox scrim covers the viewport')
  else fail('lightbox scrim covers the viewport')
  if (!state.clipped) pass('no clipping ancestor above the lightbox')
  else fail('no clipping ancestor above the lightbox')

  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(200)
  const counter = await page.locator('.lightbox-bar p').innerText()

  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  const after = await page.evaluate(() => ({
    open: !!document.querySelector('.lightbox'),
    locked: document.body.dataset.scrollLocked === 'true',
    scrollY: window.scrollY,
  }))

  if (!after.open) pass('Escape closes the lightbox')
  else fail('Escape closes the lightbox')
  if (!after.locked) pass('body scroll is released on close')
  else fail('body scroll is released on close')
  if (Math.abs(after.scrollY - state.lockedAt) < 4)
    pass('scroll position is restored', `locked at ${state.lockedAt} -> ${after.scrollY}`)
  else fail('scroll position is restored', `locked at ${state.lockedAt} -> ${after.scrollY}`)
  if (/\d+ \/ 24/.test(counter)) pass('arrow keys move through the gallery', counter.replace(/\s+/g, ' '))
  else fail('arrow keys move through the gallery', counter)

  await ctx.close()
}

/* ------------------------------------------------- 3. phone: menu + cookie */
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/id`, { waitUntil: 'networkidle' })
  await settle(page)

  const bannerBefore = await page.locator('.cookie-card').count()
  await page.locator('.menu-trigger').click()
  await page.waitForTimeout(500)

  const menu = await page.evaluate(() => {
    const m = document.querySelector('.mobile-menu')
    const cs = getComputedStyle(m)
    return {
      open: m.getAttribute('data-open') === 'true',
      visible: cs.visibility === 'visible' && Number(cs.opacity) > 0.5,
      z: Number(cs.zIndex),
      cookieVisible: !!document.querySelector('.cookie-card'),
      locked: document.body.dataset.scrollLocked === 'true',
    }
  })

  if (menu.open && menu.visible) pass('hamburger opens the mobile menu')
  else fail('hamburger opens the mobile menu', JSON.stringify(menu))
  if (bannerBefore > 0 && !menu.cookieVisible) pass('cookie banner steps aside while the menu is open')
  else fail('cookie banner steps aside while the menu is open', `before=${bannerBefore} during=${menu.cookieVisible}`)
  if (menu.locked) pass('mobile menu locks body scroll')
  else fail('mobile menu locks body scroll')

  await page.locator('.mobile-link', { hasText: 'Galeri' }).click()
  await page.waitForURL('**/id/galeri', { timeout: 15000 })
  await settle(page)
  const closedAfterNav = await page.evaluate(
    () => document.querySelector('.mobile-menu')?.getAttribute('data-open') !== 'true' && window.scrollY === 0,
  )
  if (closedAfterNav) pass('menu closes and the new page starts at the top')
  else fail('menu closes and the new page starts at the top')

  await ctx.close()
}

/* -------------------------------------------------- 4. phone: date picker */
{
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await ctx.newPage()
  await page.goto(`${BASE}/id/kontak`, { waitUntil: 'networkidle' })
  await settle(page)
  await dismissCookies(page)

  const trigger = page.locator('.date-trigger')
  const box = await centre(trigger, page)

  // Click the text end of the field, not the calendar icon: the requirement is
  // that the whole field opens the calendar, not just the glyph.
  await page.mouse.click(box.x + 28, box.y + box.height / 2)
  await page.waitForSelector('.calendar', { timeout: 5000 })
  await page.waitForFunction(() => document.body.dataset.scrollLocked === 'true', null, {
    timeout: 5000,
  })
  pass('calendar opens from a click on the field text, not just the icon')

  const cal = await page.evaluate(() => {
    const layer = document.querySelector('.floating')
    const r = layer.getBoundingClientRect()
    const disabled = [...document.querySelectorAll('.calendar-cell[role="gridcell"]')].filter((c) => c.disabled)
    const enabled = [...document.querySelectorAll('.calendar-cell[role="gridcell"]')].filter((c) => !c.disabled)
    return {
      parent: layer.parentElement.tagName,
      left: Math.round(r.left),
      right: Math.round(r.right),
      viewport: window.innerWidth,
      z: Number(getComputedStyle(layer).zIndex),
      disabledCount: disabled.length,
      firstEnabled: enabled[0]?.textContent,
      prevDisabled: document.querySelector('.calendar-nav')?.disabled,
      locked: document.body.dataset.scrollLocked === 'true',
    }
  })

  if (cal.parent === 'BODY') pass('calendar is portalled to <body>')
  else fail('calendar is portalled to <body>', cal.parent)
  if (cal.left >= 0 && cal.right <= cal.viewport) pass('calendar fits inside a 375px viewport', `${cal.left}..${cal.right} of ${cal.viewport}`)
  else fail('calendar fits inside a 375px viewport', `${cal.left}..${cal.right} of ${cal.viewport}`)
  if (cal.disabledCount > 0 && cal.prevDisabled) pass('past dates and the previous month are disabled', `${cal.disabledCount} disabled cells`)
  else fail('past dates and the previous month are disabled', JSON.stringify(cal))
  if (cal.locked) pass('calendar locks body scroll')
  else fail('calendar locks body scroll')

  // Pick a date a fortnight out.
  await page.locator('.calendar-nav').last().click()
  await page.waitForTimeout(250)
  await page.locator('.calendar-cell[role="gridcell"]:not([disabled])').nth(14).click()
  await page.waitForTimeout(250)
  const picked = await page.locator('input[name="date"]').inputValue()
  if (/^\d{4}-\d{2}-\d{2}$/.test(picked)) pass('picking a date fills the hidden input', picked)
  else fail('picking a date fills the hidden input', picked)

  // The undecided path must disable the trigger and clear the value.
  await page.locator('.checkbox-row input').check()
  await page.waitForTimeout(200)
  const undecided = await page.evaluate(() => ({
    date: document.querySelector('input[name="date"]').value,
    flag: document.querySelector('input[name="dateUndecided"]').value,
    triggerDisabled: document.querySelector('.date-trigger').disabled,
    calendarOpen: !!document.querySelector('.calendar'),
  }))
  if (undecided.date === '' && undecided.flag === 'yes' && undecided.triggerDisabled && !undecided.calendarOpen)
    pass('"date not decided" clears and disables the field')
  else fail('"date not decided" clears and disables the field', JSON.stringify(undecided))

  await ctx.close()
}

/* --------------------------------------------- 5. WhatsApp message content */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    window.__waOpened = null
    window.open = (url) => {
      window.__waOpened = url
      return { focus() {} }
    }
  })
  await page.goto(`${BASE}/id/kontak`, { waitUntil: 'networkidle' })
  await settle(page)
  await dismissCookies(page)

  await page.fill('#cf-name', 'Ratih Prameswari')
  await page.fill('#cf-phone', '+62 812 7788 4410')

  const trigger = page.locator('.date-trigger')
  await centre(trigger, page)
  await trigger.click()
  await page.waitForSelector('.calendar')
  await page.locator('.calendar-nav').last().click()
  await page.waitForTimeout(200)
  await page.locator('.calendar-cell[role="gridcell"]:not([disabled])').nth(9).click()

  async function chooseSelect(labelText, optionIndex) {
    const field = page.locator('.field', { has: page.locator('.field-label', { hasText: labelText }) })
    await field.locator('.select-trigger').click()
    await page.waitForSelector('.listbox')
    await page.locator('.listbox-option').nth(optionIndex).click()
    await page.waitForTimeout(150)
  }
  await chooseSelect('Perkiraan jumlah tamu', 2)
  await chooseSelect('Area atau jenis lokasi', 1)
  await chooseSelect('Paket yang diminati', 0)

  await page.fill('#cf-notes', 'Rencana upacara pagi lalu resepsi malam.')
  await page.locator('button[type="submit"]').click()
  await page.waitForFunction(() => window.__waOpened !== null, null, { timeout: 15000 })

  const url = await page.evaluate(() => window.__waOpened)
  const text = decodeURIComponent(new URL(url).searchParams.get('text') || '')

  const expectations = [
    ['name', 'Ratih Prameswari'],
    ['phone', '812 7788 4410'],
    ['guest bracket', 'tamu'],
    ['venue type', 'Jenis lokasi:'],
    ['package', 'Full Wedding Organizer'],
    ['notes', 'Rencana upacara pagi'],
    ['event date', 'Tanggal acara:'],
    ['source page URL', '/id/kontak'],
    ['button label', 'consultation-form-submit'],
  ]
  const missing = expectations.filter(([, needle]) => !text.includes(needle)).map(([label]) => label)
  if (missing.length === 0) pass('WhatsApp message carries every field and the page URL')
  else fail('WhatsApp message carries every field and the page URL', `missing: ${missing.join(', ')}\n---\n${text}`)

  if (url.startsWith('https://wa.me/')) pass('WhatsApp link points at wa.me', url.slice(0, 40))
  else fail('WhatsApp link points at wa.me', url)

  await ctx.close()
}

/* ------------------------------------------ 6. server rejects a past date */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  await page.addInitScript(() => {
    window.__waOpened = null
    window.open = (url) => {
      window.__waOpened = url
      return { focus() {} }
    }
  })
  await page.goto(`${BASE}/id/kontak`, { waitUntil: 'networkidle' })
  await settle(page)
  await dismissCookies(page)

  await page.fill('#cf-name', 'Uji Server')
  await page.fill('#cf-phone', '081277884410')

  // Fill the selects legitimately, then rewrite the date on the wire the way a
  // tampered client would. The client check is skipped; the server must not be.
  async function chooseSelect(labelText, optionIndex) {
    const field = page.locator('.field', { has: page.locator('.field-label', { hasText: labelText }) })
    await field.locator('.select-trigger').click()
    await page.waitForSelector('.listbox')
    await page.locator('.listbox-option').nth(optionIndex).click()
    await page.waitForTimeout(150)
  }
  await chooseSelect('Perkiraan jumlah tamu', 1)
  await chooseSelect('Area atau jenis lokasi', 0)
  await chooseSelect('Paket yang diminati', 1)

  await page.locator('.checkbox-row input').check()
  await page.evaluate(() => {
    document.querySelector('input[name="dateUndecided"]').value = 'no'
    document.querySelector('input[name="date"]').value = '2019-04-04'
  })

  await page.locator('button[type="submit"]').click()
  await page.waitForTimeout(2500)

  const outcome = await page.evaluate(() => ({
    opened: window.__waOpened,
    summary: document.querySelector('.form-summary')?.getAttribute('data-state'),
    text: document.querySelector('.form-summary')?.innerText || '',
  }))

  if (!outcome.opened && outcome.summary === 'error' && /masa lalu/i.test(outcome.text))
    pass('server rejects a past event date submitted past the client check')
  else fail('server rejects a past event date submitted past the client check', JSON.stringify(outcome))

  await ctx.close()
}

await browser.close()

console.log(`\nInteraction checks against ${BASE}\n`)
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`)
}
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} passed.`)
process.exit(failed ? 1 : 0)
