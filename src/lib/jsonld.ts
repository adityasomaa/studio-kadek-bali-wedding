import { client } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor, locales, type Locale } from '@/i18n/routes'
import { packages } from '@/config/site.data'

/**
 * LocalBusiness structured data.
 *
 * These businesses have no web presence beyond one Google Maps pin, so this is
 * the piece that tells a search engine what the site is and where it operates.
 *
 * Nothing unconfirmed goes in. No aggregateRating (we do not republish review
 * counts), no priceRange (packages are quoted per event), no openingHours and
 * no streetAddress until the client fills them into client.config.ts. Emitting
 * a placeholder here would be worse than emitting nothing.
 */
export function localBusinessJsonLd(locale: Locale) {
  const t = getDictionary(locale)
  const { unconfirmed } = client

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: client.city,
    addressRegion: client.region,
    addressCountry: 'ID',
  }
  if (unconfirmed.streetAddress) address.streetAddress = unconfirmed.streetAddress
  if (unconfirmed.postalCode) address.postalCode = unconfirmed.postalCode

  const business: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    additionalType: 'https://en.wikipedia.org/wiki/Wedding_planner',
    '@id': `${client.origin}/#business`,
    name: client.name,
    url: `${client.origin}${hrefFor('home', locale)}`,
    description: t.pages.home.meta.description,
    image: `${client.origin}/icon.svg`,
    logo: `${client.origin}/icon.svg`,
    telephone: `+${client.whatsapp}`,
    address,
    areaServed: [
      { '@type': 'AdministrativeArea', name: client.region },
      { '@type': 'City', name: client.city },
    ],
    knowsLanguage: locales.map((l) => getDictionary(l).htmlLang),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.pages.packages.header.eyebrow,
      itemListElement: packages.map((pkg) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: pkg.name[locale],
          description: pkg.tagline[locale],
          serviceType: 'Wedding planning',
          areaServed: { '@type': 'AdministrativeArea', name: client.region },
        },
      })),
    },
  }

  if (unconfirmed.email) business.email = unconfirmed.email
  if (unconfirmed.openingHours.length > 0) business.openingHours = unconfirmed.openingHours

  return business
}

/** Breadcrumbs for the non-home pages. */
export function breadcrumbJsonLd(locale: Locale, trail: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${client.origin}${item.href}`,
    })),
  }
}
