/**
 * Layout audit. Runs every route, in both languages, at three widths.
 *
 *   npm run audit:layout                     # against http://localhost:3000
 *   BASE=https://your-domain npm run audit:layout
 *
 * Checks, in order of how often they actually bite:
 *
 *  1. Horizontal overflow. Reports the specific offending elements, not just
 *     "the page is wider than the viewport". Must be zero.
 *  2. Heading line counts, per viewport rather than one global rule:
 *     phone up to 3 lines, tablet up to 2, desktop 1 (2 is reported as a
 *     warning, 3+ fails). Nothing may reach 4 lines at any width.
 *  3. Broken images and failed network requests.
 *  4. Raw z-index values outside the token scale.
 *
 * Exits non-zero on any failure so it can gate a deploy.
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE || 'http://localhost:3000'

const ROUTES = [
  '/id', '/id/paket', '/id/galeri', '/id/cara-kerja', '/id/kontak',
  '/id/kebijakan-privasi', '/id/syarat-dan-ketentuan',
  '/en', '/en/packages', '/en/gallery', '/en/how-we-work', '/en/contact',
  '/en/privacy-policy', '/en/terms-of-service',
]

const VIEWPORTS = [
  { name: 'phone', width: 375, height: 812, maxLines: 3 },
  { name: 'tablet', width: 768, height: 1024, maxLines: 2 },
  { name: 'desktop', width: 1440, height: 900, maxLines: 1 },
]

/** The z tokens declared in globals.css. Anything else is an escape hatch. */
const ALLOWED_Z = new Set(['auto', '0', '-1', '10', '100', '200', '300', '400', '450', '500'])

const inPage = () => {
  const docWidth = document.documentElement.clientWidth

  const overflow = []
  for (const el of document.querySelectorAll('body *')) {
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    if (style.position === 'fixed') continue
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) continue
    const overhang = Math.max(rect.right - docWidth, -rect.left)
    if (overhang > 1) {
      overflow.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 70),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        overhang: Math.round(overhang),
      })
    }
  }

  /* Line count from the actual line boxes rather than height / line-height.
     Dividing by line-height counts padding and margins as extra lines, and
     screen-reader-only spans (which are clipped, not removed) would otherwise
     register as a second line. So: walk the visible text nodes only and count
     distinct line-box tops. */
  const countLines = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT
        if (node.parentElement?.closest('.visually-hidden')) return NodeFilter.FILTER_REJECT
        return NodeFilter.FILTER_ACCEPT
      },
    })
    const tops = new Set()
    const range = document.createRange()
    let node = walker.nextNode()
    while (node) {
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 1 || rect.height < 1) continue
        tops.add(Math.round(rect.top))
      }
      node = walker.nextNode()
    }
    return Math.max(1, tops.size)
  }

  const headings = []
  for (const el of document.querySelectorAll('h1, h2, h3')) {
    const style = getComputedStyle(el)
    if (style.display === 'none' || el.closest('.visually-hidden')) continue
    const visible = [...el.childNodes]
      .filter((node) => !(node.nodeType === 1 && node.classList?.contains('visually-hidden')))
      .map((node) => node.textContent || '')
      .join('')
      .trim()
    if (!visible) continue
    headings.push({ tag: el.tagName.toLowerCase(), lines: countLines(el), text: visible.slice(0, 64) })
  }

  const brokenImages = [...document.querySelectorAll('img')]
    .filter((img) => img.complete && img.naturalWidth === 0)
    .map((img) => img.getAttribute('src'))

  const rawZ = []
  for (const el of document.querySelectorAll('body *')) {
    const z = getComputedStyle(el).zIndex
    if (z !== 'auto' && z !== '0') {
      rawZ.push({ z, cls: (el.getAttribute('class') || '').slice(0, 60) })
    }
  }

  return { overflow, headings, brokenImages, rawZ, docWidth }
}

const browser = await chromium.launch()
let failures = 0
let warnings = 0
const summary = []

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  })

  for (const route of ROUTES) {
    const page = await context.newPage()
    const failedRequests = []
    page.on('requestfailed', (req) => failedRequests.push(`${req.url()} (${req.failure()?.errorText})`))
    page.on('response', (res) => {
      if (res.status() >= 400) failedRequests.push(`${res.url()} -> ${res.status()}`)
    })

    const response = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
    const status = response?.status() ?? 0
    if (status !== 200) {
      failures++
      summary.push(`FAIL  ${vp.name} ${route}  HTTP ${status}`)
    }

    const result = await page.evaluate(inPage)

    if (result.overflow.length) {
      failures++
      summary.push(`FAIL  ${vp.name} ${route}  ${result.overflow.length} horizontal overflow offender(s)`)
      for (const o of result.overflow.slice(0, 6)) {
        summary.push(`        <${o.tag} class="${o.cls}"> overhangs by ${o.overhang}px`)
      }
    }

    for (const h of result.headings) {
      if (h.lines > vp.maxLines) {
        const hardFail = h.lines >= 4 || h.lines > vp.maxLines + 1
        if (hardFail) {
          failures++
          summary.push(`FAIL  ${vp.name} ${route}  <${h.tag}> is ${h.lines} lines (max ${vp.maxLines}): "${h.text}"`)
        } else {
          warnings++
          summary.push(`WARN  ${vp.name} ${route}  <${h.tag}> is ${h.lines} lines (ideal ${vp.maxLines}): "${h.text}"`)
        }
      }
    }

    if (result.brokenImages.length) {
      failures++
      summary.push(`FAIL  ${vp.name} ${route}  broken images: ${result.brokenImages.join(', ')}`)
    }

    const strayZ = result.rawZ.filter((r) => !ALLOWED_Z.has(r.z))
    if (strayZ.length) {
      failures++
      summary.push(`FAIL  ${vp.name} ${route}  z-index outside the token scale: ${strayZ.map((r) => `${r.z} (${r.cls})`).join(', ')}`)
    }

    const realFailures = failedRequests.filter((u) => !u.includes('__nextjs') && !u.includes('/_next/static/development'))
    if (realFailures.length) {
      failures++
      summary.push(`FAIL  ${vp.name} ${route}  failed requests: ${realFailures.slice(0, 4).join(' | ')}`)
    }

    await page.close()
  }

  await context.close()
}

await browser.close()

console.log(`\nLayout audit against ${BASE}`)
console.log(`${ROUTES.length} routes x ${VIEWPORTS.length} viewports = ${ROUTES.length * VIEWPORTS.length} checks\n`)
if (summary.length === 0) console.log('No findings.')
else summary.forEach((line) => console.log(line))

console.log(`\n${failures} failure(s), ${warnings} warning(s).`)
process.exit(failures > 0 ? 1 : 0)
