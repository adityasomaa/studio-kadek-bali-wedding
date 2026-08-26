'use client'

import { client } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor } from '@/i18n/routes'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { SmartLink } from '@/components/system/SmartLink'
import { WhatsAppLink } from '@/components/WhatsAppLink'

/**
 * Exactly one screen tall, and it holds three things: who this is, where they
 * are, and how to start a conversation.
 *
 * Height uses 100svh rather than 100vh. On a phone, 100vh is the height with
 * the browser chrome hidden, so the hero is taller than the visible area on
 * arrival and then reflows the moment the address bar collapses. svh is the
 * small viewport height, which does not move.
 *
 * The graphic does not scale, translate, or parallax on scroll. Wedding sites
 * reach for a zooming hero by reflex; it fights the reading of the page and
 * costs a scroll listener for nothing.
 */
export function Hero() {
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)
  const hero = t.pages.home.hero

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-inner shell">
        <div className="hero-copy">
          <p className="eyebrow hero-fade" style={{ animationDelay: '80ms' }}>
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="headline-xl hero-fade mt-5" style={{ animationDelay: '160ms' }}>
            {client.name}
          </h1>

          <p className="hero-place hero-fade mt-6" style={{ animationDelay: '250ms' }}>
            {client.city}, {client.region}
          </p>

          <p className="lede hero-fade mt-4" style={{ animationDelay: '320ms' }}>
            {hero.lead}
          </p>

          <div className="hero-fade mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: '400ms' }}>
            <SmartLink href={hrefFor('contact', locale)} className="btn btn-primary">
              {hero.cta}
            </SmartLink>
            <SmartLink href={hrefFor('packages', locale)} className="btn btn-secondary">
              {hero.ctaSecondary}
            </SmartLink>
          </div>

          <div className="hero-fade mt-6 md:hidden" style={{ animationDelay: '470ms' }}>
            <WhatsAppLink label="hero-whatsapp-mobile" variant="quiet">
              {t.common.whatsapp}
            </WhatsAppLink>
          </div>
        </div>

        <div className="hero-art hero-fade" style={{ animationDelay: '220ms' }} aria-hidden="true">
          <img
            src="/graphics/hero.svg"
            alt=""
            width={900}
            height={1200}
            decoding="async"
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  )
}
