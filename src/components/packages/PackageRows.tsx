'use client'

import { packages } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor } from '@/i18n/routes'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { SmartLink } from '@/components/system/SmartLink'
import { Reveal } from '@/components/system/Reveal'

/**
 * The home-page summary of the three packages.
 *
 * Rows rather than three matching cards: the packages are not peers on a
 * shelf, they are three depths of the same service, and a row reads as a
 * sequence. The arc mark on the right is the same diagram used on the packages
 * page, filled in proportion to how much of the work each level covers.
 */
export function PackageRows() {
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)

  return (
    <ul className="package-rows">
      {packages.map((pkg, i) => (
        <li key={pkg.key}>
          <Reveal delay={i * 90}>
            <SmartLink href={`${hrefFor('packages', locale)}#${pkg.key}`} className="package-row">
              <span className="package-row-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="package-row-body">
                <span className="headline-sm block">{pkg.name[locale]}</span>
                <span className="mt-2 block text-ink-muted">{pkg.tagline[locale]}</span>
                <span className="mt-3 block text-sm text-ink-faint">
                  {t.common.bestForLabel}: {pkg.bestFor[locale]}
                </span>
              </span>
              <span className="package-row-mark" aria-hidden="true">
                <img src={`/graphics/package-${pkg.key}.svg`} alt="" width={600} height={300} loading="lazy" decoding="async" />
              </span>
            </SmartLink>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
