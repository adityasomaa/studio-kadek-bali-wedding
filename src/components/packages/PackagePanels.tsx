'use client'

import { packages } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor } from '@/i18n/routes'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { Reveal } from '@/components/system/Reveal'
import { SmartLink } from '@/components/system/SmartLink'
import { WhatsAppLink } from '@/components/WhatsAppLink'

/**
 * One panel per package, all of them in the document.
 *
 * Two lists per panel, deliberately equal in weight: what the package covers,
 * and where the responsibility stops. The second list is the one that answers
 * the question people are actually asking, and burying it would be the easiest
 * way to make this site untrustworthy.
 *
 * No prices anywhere. Wedding work is quoted per event.
 */
export function PackagePanels() {
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)

  return (
    <div className="package-panels">
      <nav className="package-jump" aria-label={t.pages.packages.panelHint}>
        <ul>
          {packages.map((pkg) => (
            <li key={pkg.key}>
              <a href={`#${pkg.key}`} className="filter-pill">
                {pkg.name[locale]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {packages.map((pkg, i) => (
        <section key={pkg.key} id={pkg.key} className="package-panel" aria-labelledby={`${pkg.key}-title`}>
          <div className="package-panel-head">
            <Reveal>
              <p className="eyebrow">
                {t.common.stepLabel} {String(i + 1).padStart(2, '0')}
              </p>
            </Reveal>
            <Reveal delay={70}>
              <h2 id={`${pkg.key}-title`} className="headline-md mt-4">
                {pkg.name[locale]}
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-3 text-lg text-accent-ink">{pkg.tagline[locale]}</p>
            </Reveal>
            <Reveal delay={190}>
              <p className="prose-body mt-5">
                <span className="block">{pkg.summary[locale]}</span>
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p className="mt-5 text-sm text-ink-faint">
                {t.common.bestForLabel}: {pkg.bestFor[locale]}
              </p>
            </Reveal>
          </div>

          <div className="package-panel-art" aria-hidden="true">
            <img src={`/graphics/package-${pkg.key}.svg`} alt="" width={600} height={300} loading="lazy" decoding="async" />
          </div>

          <div className="package-lists">
            <div>
              <h3 className="package-list-title">{t.common.scopeLabel}</h3>
              <ul className="package-list">
                {pkg.scope[locale].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="package-list-title">{t.common.boundaryLabel}</h3>
              <ul className="package-list package-list-boundary">
                {pkg.boundary[locale].map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="package-panel-cta">
            <SmartLink href={hrefFor('contact', locale)} className="btn btn-primary">
              {t.common.consult}
            </SmartLink>
            <WhatsAppLink
              label={`package-${pkg.key}-whatsapp`}
              variant="secondary"
              message={`${t.wa.intro}\n${t.wa.fieldPackage}: ${pkg.name[locale]}`}
            >
              {t.common.whatsapp}
            </WhatsAppLink>
          </div>
        </section>
      ))}
    </div>
  )
}
