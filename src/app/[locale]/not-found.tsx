import type { Metadata } from 'next'
import { getDictionary } from '@/i18n/dictionaries'
import { defaultLocale, hrefFor } from '@/i18n/routes'
import { SectionHeader } from '@/components/SectionHeader'

/**
 * The 404 lives inside the locale segment so it keeps the header, the footer
 * and the language switcher. A bare framework 404 on a five-page site is a
 * dead end, and this one is at least a route back.
 *
 * `not-found.tsx` cannot read params, so it renders in the default language.
 * Every link on it is locale-correct once the visitor navigates on.
 */
export const metadata: Metadata = {
  title: getDictionary(defaultLocale).notFound.metaTitle,
  robots: { index: false, follow: true },
}

export default function NotFound() {
  const t = getDictionary(defaultLocale)
  return (
    <section className="section-block" aria-labelledby="notfound-title">
      <div className="shell">
        <SectionHeader
          id="notfound-title"
          level="h1"
          eyebrow={t.notFound.eyebrow}
          headline={t.notFound.headline}
          description={t.notFound.description}
          cta={{ kind: 'link', href: hrefFor('home', defaultLocale), label: t.notFound.cta, isHome: true }}
        />
      </div>
    </section>
  )
}
