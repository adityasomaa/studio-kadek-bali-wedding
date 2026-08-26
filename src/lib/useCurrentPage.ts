'use client'

import { usePathname } from 'next/navigation'
import { defaultLocale, isLocale, pageKeyFromSlug, type Locale, type PageKey } from '@/i18n/routes'

/** Reads the active locale and page key straight off the URL. */
export function useCurrentPage(): { locale: Locale; pageKey: PageKey } {
  const pathname = usePathname() || '/'
  const [, maybeLocale = '', slug = ''] = pathname.split('/')
  const locale: Locale = isLocale(maybeLocale) ? maybeLocale : defaultLocale
  const pageKey = slug ? (pageKeyFromSlug(slug, locale) ?? 'home') : 'home'
  return { locale, pageKey }
}
