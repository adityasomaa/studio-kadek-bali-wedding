'use client'

import { useEffect, useRef } from 'react'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor } from '@/i18n/routes'
import { useSite } from '@/components/system/SiteProvider'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { SmartLink } from '@/components/system/SmartLink'

/**
 * The banner sits above page content but is suppressed whenever the mobile
 * menu is open, so it can never cover the navigation on a small screen. The
 * wrapper itself is click-through; only the card takes pointer events, so
 * nothing underneath it becomes unreachable.
 */
export function CookieBanner() {
  const { consent, consentPromptOpen, setConsent, menuOpen } = useSite()
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!consentPromptOpen || menuOpen) return
    const first = ref.current?.querySelector<HTMLElement>('button')
    // Do not steal focus on first paint; only announce.
    if (document.activeElement === document.body) first?.focus({ preventScroll: true })
  }, [consentPromptOpen, menuOpen])

  if (!consentPromptOpen || menuOpen) return null

  return (
    <div className="cookie-wrap z-cookie" role="region" aria-label={t.cookie.label}>
      <div className="cookie-card" ref={ref}>
        <div className="cookie-copy">
          <p className="text-[0.95rem] font-medium">{t.cookie.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t.cookie.body}</p>
          <SmartLink href={hrefFor('privacy', locale)} className="btn-quiet mt-2 inline-block text-sm">
            {t.cookie.more}
          </SmartLink>
        </div>
        <div className="cookie-actions">
          <button type="button" className="btn btn-primary" onClick={() => setConsent('granted')}>
            {t.cookie.accept}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setConsent('denied')}>
            {t.cookie.reject}
          </button>
        </div>
        {consent !== 'unset' && (
          <p className="visually-hidden" role="status">
            {consent === 'granted' ? t.cookie.statusAccepted : t.cookie.statusRejected}
          </p>
        )}
      </div>
    </div>
  )
}
