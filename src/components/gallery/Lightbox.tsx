'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useOverlayLock, useSite } from '@/components/system/SiteProvider'
import { getDictionary } from '@/i18n/dictionaries'

export type LightboxItem = { src: string; alt: string; caption: string }

/**
 * Rendered through a portal on document.body.
 *
 * That is not decoration: the gallery grid lives inside sections that clip
 * their own overflow, and a lightbox mounted in place would be cropped by the
 * first such ancestor. Going to the body also keeps it out of any stacking
 * context a parent transform would create, so the z token actually decides
 * what is on top.
 */
export function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[]
  index: number | null
  onClose: () => void
  onNavigate: (next: number) => void
}) {
  const { locale } = useSite()
  const t = getDictionary(locale)
  const open = index !== null
  const [mounted, setMounted] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => setMounted(true), [])
  useOverlayLock('lightbox', open)

  const step = useCallback(
    (delta: number) => {
      if (index === null) return
      onNavigate((index + delta + items.length) % items.length)
    },
    [index, items.length, onNavigate],
  )

  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        step(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        step(-1)
      } else if (e.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      restoreRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose, step])

  if (!mounted || index === null) return null
  const item = items[index]

  return createPortal(
    <div className="lightbox z-overlay" data-open="true">
      <button
        type="button"
        className="lightbox-scrim"
        aria-label={t.common.close}
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="lightbox-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={t.common.lightboxLabel}
      >
        <div className="lightbox-bar">
          <p className="text-sm text-ink-muted">
            {item.caption}
            <span className="ml-2 text-ink-faint">
              {index + 1} / {items.length}
            </span>
          </p>
          <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose}>
            <span className="visually-hidden">{t.common.close}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
              <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </button>
        </div>

        <figure className="lightbox-figure">
          <img src={item.src} alt={item.alt} width={800} height={1000} decoding="async" />
        </figure>

        <div className="lightbox-nav">
          <button type="button" className="btn btn-secondary" onClick={() => step(-1)}>
            {t.common.previous}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => step(1)}>
            {t.common.next}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
