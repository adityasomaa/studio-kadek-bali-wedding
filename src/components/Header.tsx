'use client'

import { useEffect, useId, useRef } from 'react'
import { client } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor, locales, navPageKeys, LOCALE_COOKIE, type Locale } from '@/i18n/routes'
import { useSite } from '@/components/system/SiteProvider'
import { SmartLink } from '@/components/system/SmartLink'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { WhatsAppLink } from '@/components/WhatsAppLink'

export function Header() {
  const { locale, pageKey } = useCurrentPage()
  const { menuOpen, setMenuOpen, navigate } = useSite()
  const t = getDictionary(locale)
  const menuId = useId()
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    // Move focus into the panel so keyboard users are not left behind the sheet.
    const first = panelRef.current?.querySelector<HTMLElement>('a, button')
    first?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen, setMenuOpen])

  function switchLocale(next: Locale) {
    if (next === locale) return
    try {
      document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`
    } catch {
      /* the URL still carries the locale, so the switch works either way */
    }
    navigate(hrefFor(pageKey, next), { isHome: pageKey === 'home' })
  }

  return (
    <>
      <header className="site-header z-header">
        <div className="shell flex h-[var(--header-h)] items-center justify-between gap-4">
          <SmartLink href={hrefFor('home', locale)} className="wordmark" isHome>
            <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden="true" focusable="false">
              <g fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round">
                <path d="M 24 10 A 22 22 0 0 0 24 54" />
                <path d="M 40 10 A 22 22 0 0 1 40 54" />
              </g>
              <circle cx="32" cy="32" r="6" fill="var(--accent-ink)" />
            </svg>
            <span className="wordmark-text">{client.name}</span>
          </SmartLink>

          <nav className="hidden lg:block" aria-label={t.nav.menuLabel}>
            <ul className="flex items-center gap-7">
              {navPageKeys.map((key) => (
                <li key={key}>
                  <SmartLink
                    href={hrefFor(key, locale)}
                    className="nav-link"
                    data-active={key === pageKey ? 'true' : undefined}
                    isHome={key === 'home'}
                  >
                    {t.nav[key]}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions flex items-center gap-2 md:gap-3">
            <LocaleSwitch locale={locale} onSwitch={switchLocale} label={t.nav.languageLabel} />

            <div className="hidden md:block">
              <WhatsAppLink label="header-whatsapp" variant="primary">
                {t.common.consultShort}
              </WhatsAppLink>
            </div>

            <button
              ref={triggerRef}
              type="button"
              className="menu-trigger lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span className="visually-hidden">{menuOpen ? t.nav.menuClose : t.nav.menuOpen}</span>
              <span className="menu-bars" data-open={menuOpen} aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id={menuId}
        ref={panelRef}
        className="mobile-menu z-menu"
        data-open={menuOpen}
        inert={!menuOpen}
      >
        <div className="shell flex h-full flex-col justify-between py-8">
          <nav aria-label={t.nav.menuLabel}>
            <ul className="flex flex-col gap-1">
              {navPageKeys.map((key, i) => (
                <li key={key}>
                  <SmartLink
                    href={hrefFor(key, locale)}
                    className="mobile-link"
                    data-active={key === pageKey ? 'true' : undefined}
                    style={{ transitionDelay: `${menuOpen ? 90 + i * 45 : 0}ms` }}
                    isHome={key === 'home'}
                  >
                    <span className="mobile-link-index" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {t.nav[key]}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4">
            <WhatsAppLink label="mobile-menu-whatsapp" variant="primary">
              {t.common.whatsapp}
            </WhatsAppLink>
            <p className="text-sm text-ink-faint">{t.footer.based}</p>
          </div>
        </div>
      </div>
    </>
  )
}

function LocaleSwitch({
  locale,
  onSwitch,
  label,
}: {
  locale: Locale
  onSwitch: (next: Locale) => void
  label: string
}) {
  return (
    <div className="locale-switch" role="group" aria-label={label}>
      {locales.map((code) => {
        const active = code === locale
        return (
          <button
            key={code}
            type="button"
            className="locale-option"
            data-active={active}
            aria-pressed={active}
            onClick={() => onSwitch(code)}
          >
            {getDictionary(code).localeShort}
            <span className="visually-hidden"> — {getDictionary(code).localeName}</span>
          </button>
        )
      })}
    </div>
  )
}
