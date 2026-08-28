import type { Metadata } from 'next'
import { client, locales } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { notFound } from 'next/navigation'
import { defaultLocale, hrefFor, isLocale, type Locale } from '@/i18n/routes'
import { Hero } from '@/components/Hero'
import { SectionHeader } from '@/components/SectionHeader'
import { PackageRows } from '@/components/packages/PackageRows'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { ProcessSteps } from '@/components/process/ProcessSteps'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
    title: t.pages.home.meta.title,
    description: t.pages.home.meta.description,
    alternates: {
      canonical: `${client.origin}${hrefFor('home', locale)}`,
      languages: Object.fromEntries(
        locales.map((l) => [getDictionary(l).htmlLang, `${client.origin}${hrefFor('home', l)}`]),
      ),
    },
  }
}

/**
 * Home is deliberately short: the hero, a summary of the three packages, a
 * slice of the gallery, and the first three steps of the process. No founder
 * story and no manifesto — someone deciding who to trust with a wedding wants
 * to see what is on offer and how it works, not a paragraph about passion.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  // Anything with a file extension skips the proxy matcher, so an unknown path
  // like /foo.txt arrives here as the [locale] segment. Falling back to the
  // default locale would serve the home page at an unbounded set of URLs with
  // a 200; the segment has to 404 instead.
  if (!isLocale(raw)) notFound()
  const locale: Locale = raw
  const t = getDictionary(locale)

  return (
    <>
      <Hero />

      <section className="section-block" aria-labelledby="home-packages">
        <div className="shell">
          <SectionHeader
            id="home-packages"
            eyebrow={t.pages.home.packages.eyebrow}
            headline={t.pages.home.packages.headline}
            description={t.pages.home.packages.description}
            cta={{ kind: 'link', href: hrefFor('packages', locale), label: t.pages.home.packages.cta }}
          />
          <PackageRows />
        </div>
      </section>

      <section className="section-block surface-2" aria-labelledby="home-gallery">
        <div className="shell">
          <SectionHeader
            id="home-gallery"
            eyebrow={t.pages.home.gallery.eyebrow}
            headline={t.pages.home.gallery.headline}
            description={t.pages.home.gallery.description}
            cta={{ kind: 'link', href: hrefFor('gallery', locale), label: t.pages.home.gallery.cta }}
          />
          <GalleryGrid limit={4} compact />
        </div>
      </section>

      <section className="section-block" aria-labelledby="home-process">
        <div className="shell">
          <SectionHeader
            id="home-process"
            eyebrow={t.pages.home.process.eyebrow}
            headline={t.pages.home.process.headline}
            description={t.pages.home.process.description}
            cta={{ kind: 'link', href: hrefFor('process', locale), label: t.pages.home.process.cta }}
          />
          <ProcessSteps compact />
        </div>
      </section>
    </>
  )
}
