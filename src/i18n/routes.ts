import { defaultLocale, locales, type Locale } from '@/config/client.config'

export { locales, defaultLocale }
export type { Locale }

/** Every page in the site, keyed by a stable technical id. */
export const pageKeys = [
  'home',
  'packages',
  'gallery',
  'process',
  'contact',
  'privacy',
  'terms',
] as const

export type PageKey = (typeof pageKeys)[number]

/**
 * Per-locale URL segment for each page. Home is the empty segment.
 * Slugs differ per language on purpose: people search in their own language.
 */
export const routeSlugs: Record<PageKey, Record<Locale, string>> = {
  home: { id: '', en: '' },
  packages: { id: 'paket', en: 'packages' },
  gallery: { id: 'galeri', en: 'gallery' },
  process: { id: 'cara-kerja', en: 'how-we-work' },
  contact: { id: 'kontak', en: 'contact' },
  privacy: { id: 'kebijakan-privasi', en: 'privacy-policy' },
  terms: { id: 'syarat-dan-ketentuan', en: 'terms-of-service' },
}

/** Pages that appear in the main navigation, in order. */
export const navPageKeys: PageKey[] = ['home', 'packages', 'gallery', 'process', 'contact']

/** Pages listed in the footer legal row. */
export const legalPageKeys: PageKey[] = ['privacy', 'terms']

/** Build an in-app href, e.g. hrefFor('gallery', 'en') === '/en/gallery'. */
export function hrefFor(page: PageKey, locale: Locale): string {
  const slug = routeSlugs[page][locale]
  return slug ? `/${locale}/${slug}` : `/${locale}`
}

/** Resolve a URL segment back to a page key for a given locale. */
export function pageKeyFromSlug(slug: string, locale: Locale): PageKey | null {
  for (const key of pageKeys) {
    if (routeSlugs[key][locale] === slug) return key
  }
  return null
}

/** Every non-home slug for a locale. Used by generateStaticParams. */
export function slugsForLocale(locale: Locale): string[] {
  return pageKeys.map((k) => routeSlugs[k][locale]).filter(Boolean)
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/** The cookie the language switcher writes so the choice survives navigation. */
export const LOCALE_COOKIE = 'bwo_locale'
