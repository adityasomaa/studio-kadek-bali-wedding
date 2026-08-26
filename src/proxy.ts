import { NextResponse, type NextRequest } from 'next/server'
import { defaultLocale, isLocale, locales, LOCALE_COOKIE } from '@/i18n/routes'

/**
 * Sends bare paths to a locale. The remembered choice wins over the
 * Accept-Language header, which in turn wins over the default.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const first = pathname.split('/')[1]
  if (isLocale(first)) return NextResponse.next()

  const remembered = request.cookies.get(LOCALE_COOKIE)?.value
  let locale: string = defaultLocale

  if (remembered && isLocale(remembered)) {
    locale = remembered
  } else {
    const header = request.headers.get('accept-language') ?? ''
    const preferred = header
      .split(',')
      .map((part) => part.split(';')[0].trim().toLowerCase())
      .find((tag) => locales.some((l) => tag === l || tag.startsWith(`${l}-`)))
    if (preferred) {
      locale = locales.find((l) => preferred === l || preferred.startsWith(`${l}-`)) ?? defaultLocale
    }
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === '/' ? `/${locale}` : `/${locale}${pathname}`
  url.search = search
  return NextResponse.redirect(url)
}

export const config = {
  // Everything except Next internals, the metadata files, and anything with a
  // file extension (the generated SVGs, the fonts, robots.txt, sitemap.xml).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
