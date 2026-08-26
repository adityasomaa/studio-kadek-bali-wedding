'use client'

import { client } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor, legalPageKeys, navPageKeys } from '@/i18n/routes'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { SmartLink } from '@/components/system/SmartLink'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { Reveal } from '@/components/system/Reveal'
import { useSite } from '@/components/system/SiteProvider'

/**
 * Every page ends on the same call to action.
 *
 * The target swaps by itself: normally it points at the consultation form, but
 * on the contact page the form is already on screen, so pointing at it again
 * would be a dead end. There it becomes the WhatsApp route instead.
 */
export function Footer() {
  const { locale, pageKey } = useCurrentPage()
  const { reopenConsent } = useSite()
  const t = getDictionary(locale)
  const onContactPage = pageKey === 'contact'
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-cta">
          <Reveal>
            <p className="eyebrow">{t.footer.eyebrow}</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="headline-lg mt-4">{t.footer.headline}</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="lede mt-5">{t.footer.description}</p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {onContactPage ? (
                <>
                  <WhatsAppLink label="footer-whatsapp-on-contact" variant="primary">
                    {t.footer.ctaWhatsapp}
                  </WhatsAppLink>
                  <SmartLink href={hrefFor('packages', locale)} className="btn btn-secondary">
                    {t.common.viewPackages}
                  </SmartLink>
                </>
              ) : (
                <>
                  <SmartLink href={hrefFor('contact', locale)} className="btn btn-primary">
                    {t.footer.ctaForm}
                  </SmartLink>
                  <WhatsAppLink label={`footer-whatsapp-${pageKey}`} variant="secondary">
                    {t.footer.ctaWhatsapp}
                  </WhatsAppLink>
                </>
              )}
            </div>
          </Reveal>
        </div>

        <hr className="rule" />

        <div className="footer-grid">
          <div className="flex flex-col gap-3">
            <span className="wordmark-text text-lg">{client.name}</span>
            <p className="text-sm text-ink-muted">{t.footer.based}</p>
            <p className="max-w-[38ch] text-sm text-ink-faint">{t.footer.builtNote}</p>
          </div>

          <nav aria-label={t.footer.navLabel}>
            <ul className="flex flex-col gap-2.5">
              {navPageKeys.map((key) => (
                <li key={key}>
                  <SmartLink href={hrefFor(key, locale)} className="footer-link" isHome={key === 'home'}>
                    {t.nav[key]}
                  </SmartLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t.footer.legalLabel}>
            <ul className="flex flex-col gap-2.5">
              {legalPageKeys.map((key) => (
                <li key={key}>
                  <SmartLink href={hrefFor(key, locale)} className="footer-link">
                    {t.nav[key]}
                  </SmartLink>
                </li>
              ))}
              <li>
                <button type="button" className="footer-link text-left" onClick={reopenConsent}>
                  {t.cookie.manage}
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="footer-base">
          <p className="text-sm text-ink-faint">{t.footer.rights(year)}</p>
        </div>
      </div>
    </footer>
  )
}
