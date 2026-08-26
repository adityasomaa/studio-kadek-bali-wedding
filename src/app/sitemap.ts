import type { MetadataRoute } from 'next'
import { client, locales } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor, pageKeys } from '@/i18n/routes'

/**
 * Every page in every language, each entry carrying the alternate-language
 * links for the same page. The site is bilingual by design, so a sitemap that
 * only listed one language would leave half of it undiscovered.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return locales.flatMap((locale) =>
    pageKeys.map((key) => {
      const priority = key === 'home' ? 1 : key === 'privacy' || key === 'terms' ? 0.3 : 0.8
      return {
        url: `${client.origin}${hrefFor(key, locale)}`,
        lastModified: now,
        changeFrequency: key === 'privacy' || key === 'terms' ? ('yearly' as const) : ('monthly' as const),
        priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [getDictionary(l).htmlLang, `${client.origin}${hrefFor(key, l)}`]),
          ),
        },
      }
    }),
  )
}
