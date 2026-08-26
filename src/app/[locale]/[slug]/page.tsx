import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { client, locales } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import { getLegal } from '@/i18n/legal'
import {
  defaultLocale,
  hrefFor,
  isLocale,
  pageKeyFromSlug,
  pageKeys,
  routeSlugs,
  type Locale,
  type PageKey,
} from '@/i18n/routes'
import { SectionHeader } from '@/components/SectionHeader'
import { PackagePanels } from '@/components/packages/PackagePanels'
import { GalleryGrid } from '@/components/gallery/GalleryGrid'
import { ProcessSteps, VendorCategories } from '@/components/process/ProcessSteps'
import { ConsultationForm } from '@/components/form/ConsultationForm'
import { ContactDetails } from '@/components/ContactDetails'
import { breadcrumbJsonLd } from '@/lib/jsonld'

/** Every non-home page, in both languages, prerendered. */
export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of locales) {
    for (const key of pageKeys) {
      const slug = routeSlugs[key][locale]
      if (slug) params.push({ locale, slug })
    }
  }
  return params
}

function resolve(rawLocale: string, slug: string): { locale: Locale; pageKey: PageKey } | null {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const pageKey = pageKeyFromSlug(slug, locale)
  if (!pageKey || pageKey === 'home') return null
  return { locale, pageKey }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const resolved = resolve(raw, slug)
  if (!resolved) return {}
  const { locale, pageKey } = resolved
  const meta = getDictionary(locale).pages[pageKey as keyof ReturnType<typeof getDictionary>['pages']].meta

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${client.origin}${hrefFor(pageKey, locale)}`,
      languages: Object.fromEntries(
        locales.map((l) => [getDictionary(l).htmlLang, `${client.origin}${hrefFor(pageKey, l)}`]),
      ),
    },
    openGraph: {
      type: 'website',
      siteName: client.name,
      url: `${client.origin}${hrefFor(pageKey, locale)}`,
      title: meta.title,
      description: meta.description,
    },
  }
}

export default async function SlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const resolved = resolve(raw, slug)
  if (!resolved) notFound()
  const { locale, pageKey } = resolved
  const t = getDictionary(locale)

  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: t.nav.home, href: hrefFor('home', locale) },
    { name: t.nav[pageKey], href: hrefFor(pageKey, locale) },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {pageKey === 'packages' && <PackagesPage locale={locale} />}
      {pageKey === 'gallery' && <GalleryPage locale={locale} />}
      {pageKey === 'process' && <ProcessPage locale={locale} />}
      {pageKey === 'contact' && <ContactPage locale={locale} />}
      {(pageKey === 'privacy' || pageKey === 'terms') && (
        <LegalPage locale={locale} pageKey={pageKey} />
      )}
    </>
  )
}

/* ------------------------------------------------------------------------ */

function PackagesPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const h = t.pages.packages.header
  return (
    <section className="section-block" aria-labelledby="packages-title">
      <div className="shell">
        <SectionHeader
          id="packages-title"
          level="h1"
          eyebrow={h.eyebrow}
          headline={h.headline}
          description={h.description}
          cta={{ kind: 'whatsapp', label: h.cta, track: 'packages-header-whatsapp' }}
        />
        <div className="mt-14">
          <PackagePanels />
        </div>
      </div>
    </section>
  )
}

function GalleryPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const h = t.pages.gallery.header
  return (
    <section className="section-block" aria-labelledby="gallery-title">
      <div className="shell">
        <SectionHeader
          id="gallery-title"
          level="h1"
          eyebrow={h.eyebrow}
          headline={h.headline}
          description={h.description}
          cta={{ kind: 'whatsapp', label: h.cta, track: 'gallery-header-whatsapp' }}
        />
        <GalleryGrid />
      </div>
    </section>
  )
}

function ProcessPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const h = t.pages.process.header
  const v = t.pages.process.vendors
  return (
    <>
      <section className="section-block" aria-labelledby="process-title">
        <div className="shell">
          <SectionHeader
            id="process-title"
            level="h1"
            eyebrow={h.eyebrow}
            headline={h.headline}
            description={h.description}
            cta={{ kind: 'link', href: hrefFor('contact', locale), label: h.cta }}
          />
          <ProcessSteps />
        </div>
      </section>

      <section className="section-block surface-2" aria-labelledby="vendor-title">
        <div className="shell">
          <SectionHeader
            id="vendor-title"
            size="md"
            eyebrow={v.eyebrow}
            headline={v.headline}
            description={v.description}
            cta={{ kind: 'whatsapp', label: v.cta, track: 'process-vendors-whatsapp' }}
          />
          <VendorCategories />
        </div>
      </section>
    </>
  )
}

function ContactPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const h = t.pages.contact.header
  const d = t.pages.contact.details
  return (
    <>
      <section className="section-block" aria-labelledby="contact-title">
        <div className="shell">
          <SectionHeader
            id="contact-title"
            level="h1"
            eyebrow={h.eyebrow}
            headline={h.headline}
            description={h.description}
            cta={{ kind: 'whatsapp', label: h.cta, track: 'contact-header-whatsapp' }}
          />
          <ConsultationForm />
        </div>
      </section>

      <section className="section-block-tight surface-2" aria-labelledby="contact-details-title">
        <div className="shell">
          <SectionHeader
            id="contact-details-title"
            size="md"
            eyebrow={d.eyebrow}
            headline={d.headline}
            description={d.description}
            cta={{ kind: 'none' }}
          />
          <ContactDetails locale={locale} />
        </div>
      </section>
    </>
  )
}

function LegalPage({ locale, pageKey }: { locale: Locale; pageKey: 'privacy' | 'terms' }) {
  const t = getDictionary(locale)
  const h = t.pages[pageKey].header
  const sections = getLegal(locale, pageKey)

  return (
    <section className="section-block" aria-labelledby="legal-title">
      <div className="shell">
        <SectionHeader
          id="legal-title"
          level="h1"
          eyebrow={h.eyebrow}
          headline={h.headline}
          description={h.description}
          cta={{ kind: 'whatsapp', label: h.cta, track: `${pageKey}-header-whatsapp` }}
        />
        <div className="legal-body">
          {sections.map((section) => (
            <div key={section.heading} className="legal-section">
              <h2>{section.heading}</h2>
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {section.list && (
                <ul>
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
