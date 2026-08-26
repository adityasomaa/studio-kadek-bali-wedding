import type { Metadata } from 'next'
import '../globals.css'
import { client, locales } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { hrefFor, isLocale, defaultLocale, type Locale } from '@/i18n/routes'
import { SiteProvider } from '@/components/system/SiteProvider'
import { PageCurtain } from '@/components/system/PageCurtain'
import { SmoothScroll } from '@/components/system/SmoothScroll'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { localBusinessJsonLd } from '@/lib/jsonld'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Ceiling for the hero display size, chosen from how long the client's name is.
 *
 * The hero headline is the one string the template cannot control: business
 * names run from 12 characters to 30-plus. A single fixed size either wastes
 * the screen on a short name or pushes a long one to three lines. Banding it
 * keeps every client to one or two balanced lines on desktop without anyone
 * hand-tuning CSS per client.
 */
function displayCap(name: string): string {
  const n = name.length
  if (n <= 20) return '6.25rem'
  if (n <= 32) return '5rem'
  if (n <= 44) return '4rem'
  return '3.25rem'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const t = getDictionary(locale)

  return {
    metadataBase: new URL(client.origin),
    title: {
      default: t.pages.home.meta.title,
      template: `%s`,
    },
    description: t.pages.home.meta.description,
    applicationName: client.name,
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: '/icon.svg',
      apple: '/icon.svg',
    },
    alternates: {
      canonical: `${client.origin}${hrefFor('home', locale)}`,
      languages: Object.fromEntries(
        locales.map((l) => [getDictionary(l).htmlLang, `${client.origin}${hrefFor('home', l)}`]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: client.name,
      locale: getDictionary(locale).htmlLang.replace('-', '_'),
      url: `${client.origin}${hrefFor('home', locale)}`,
      title: t.pages.home.meta.title,
      description: t.pages.home.meta.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: t.pages.home.meta.title,
      description: t.pages.home.meta.description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : defaultLocale
  const t = getDictionary(locale)

  return (
    <html
      lang={t.htmlLang}
      /* The accent is the one visual knob per client. It is written here from
         src/config/client.config.ts, and the entire palette in globals.css is
         derived from these two custom properties. */
      style={
        {
          '--accent-c': String(client.accent.chroma),
          '--accent-h': String(client.accent.hue),
          '--display-cap': displayCap(client.name),
        } as React.CSSProperties
      }
    >
      <head>
        {/* Self-hosted, so preloading the two faces used above the fold is
            worth it: no third-party connection, no layout shift. */}
        <link
          rel="preload"
          href="/fonts/NeueMontreal-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/NeueMontreal-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          // Structured data is generated from the config; nothing unconfirmed
          // is emitted. See src/lib/jsonld.ts.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd(locale)) }}
        />
      </head>
      <body>
        <SiteProvider locale={locale} playIntro>
          <a href="#main" className="skip-link z-skip">
            {t.nav.skipToContent}
          </a>
          <PageCurtain />
          <SmoothScroll />
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieBanner />
        </SiteProvider>
      </body>
    </html>
  )
}
