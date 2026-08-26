'use client'

import { useMemo, useState } from 'react'
import { galleryCategories } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { Reveal } from '@/components/system/Reveal'
import { Lightbox, type LightboxItem } from '@/components/gallery/Lightbox'

type Item = LightboxItem & { category: string }

/**
 * The gallery is the page people actually judge a wedding organizer on, so it
 * gets room: a wide gutter, a portrait tile, and a hard cap on how many rows
 * appear before you ask for more. A grid that runs for three screens reads as
 * a dump, not a selection.
 */
export function GalleryGrid({
  initialCategory = 'all',
  limit,
  compact = false,
}: {
  initialCategory?: string
  /** Fixed number of tiles, used for the home-page excerpt. */
  limit?: number
  compact?: boolean
}) {
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)
  const [category, setCategory] = useState(initialCategory)
  const [page, setPage] = useState(1)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const PER_PAGE = 6

  /**
   * Interleaved across categories rather than grouped by them. Grouped, the
   * first screen of the unfiltered view is six tiles of the same category,
   * which reads as "this is all they do". Round-robin shows the range
   * immediately and the filter is still there for anyone who wants one type.
   */
  const all = useMemo<Item[]>(() => {
    const columns = galleryCategories.map((cat) =>
      Array.from({ length: cat.count }, (_, i) => ({
        category: cat.key,
        src: `/graphics/${cat.key}-${i + 1}.svg`,
        alt: t.common.graphicAlt(cat.label[locale], i + 1),
        caption: cat.label[locale],
      })),
    )
    const out: Item[] = []
    const deepest = Math.max(...columns.map((c) => c.length))
    for (let row = 0; row < deepest; row++) {
      for (const column of columns) {
        if (column[row]) out.push(column[row])
      }
    }
    return out
  }, [locale, t.common])

  const filtered = useMemo(
    () => (category === 'all' ? all : all.filter((item) => item.category === category)),
    [all, category],
  )

  const shown = limit ? filtered.slice(0, limit) : filtered.slice(0, page * PER_PAGE)
  const hasMore = !limit && shown.length < filtered.length

  function changeCategory(next: string) {
    setCategory(next)
    setPage(1)
  }

  return (
    <div className="gallery">
      {!limit && (
        <div className="gallery-filters" role="group" aria-label={t.common.galleryFilterLabel}>
          <button
            type="button"
            className="filter-pill"
            data-active={category === 'all'}
            aria-pressed={category === 'all'}
            onClick={() => changeCategory('all')}
          >
            {t.common.allCategories}
          </button>
          {galleryCategories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className="filter-pill"
              data-active={category === cat.key}
              aria-pressed={category === cat.key}
              onClick={() => changeCategory(cat.key)}
            >
              {cat.label[locale]}
            </button>
          ))}
        </div>
      )}

      {!limit && (
        <p className="mt-5 text-sm text-ink-faint" role="status">
          {t.pages.gallery.countLabel(filtered.length)}
          {category !== 'all' && (
            <span className="ml-2">
              {galleryCategories.find((c) => c.key === category)?.blurb[locale]}
            </span>
          )}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="mt-10 text-ink-muted">{t.pages.gallery.empty}</p>
      ) : (
        <ul className={compact ? 'gallery-grid gallery-grid-compact' : 'gallery-grid'}>
          {shown.map((item, i) => (
            <li key={item.src}>
              <Reveal delay={Math.min(i, 5) * 60}>
                <button
                  type="button"
                  className="gallery-tile"
                  onClick={() => setOpenIndex(filtered.indexOf(item))}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={800}
                    height={1000}
                    loading={i < 4 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  <span className="gallery-caption">{item.caption}</span>
                </button>
              </Reveal>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button type="button" className="btn btn-secondary" onClick={() => setPage((p) => p + 1)}>
            {t.common.showMore}
          </button>
        </div>
      )}

      <Lightbox
        items={filtered}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  )
}
