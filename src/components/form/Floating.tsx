'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type Placement = { top: number; left: number; width: number; flipped: boolean }

/**
 * A layer anchored to a trigger and rendered on document.body.
 *
 * The portal is the whole point. Form fields sit inside sections that clip
 * their overflow, and on a phone the panel is taller than the field's parent.
 * Rendered in place, a calendar gets cut in half at 375px wide. Rendered on
 * the body with fixed coordinates, it cannot be cropped by anything.
 *
 * It flips above the trigger when there is not enough room below, and clamps
 * itself inside the viewport so it never introduces horizontal overflow.
 */
export function Floating({
  anchorRef,
  open,
  children,
  minWidth = 0,
  className,
  labelledBy,
  id,
  role,
}: {
  anchorRef: RefObject<HTMLElement | null>
  open: boolean
  children: ReactNode
  minWidth?: number
  className?: string
  labelledBy?: string
  id?: string
  role?: string
}) {
  const [mounted, setMounted] = useState(false)
  const [place, setPlace] = useState<Placement | null>(null)
  const layerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setMounted(true), [])

  useLayoutEffect(() => {
    if (!open) return
    const measure = () => {
      const anchor = anchorRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const layerH = layerRef.current?.offsetHeight ?? 320
      const width = Math.max(rect.width, minWidth)
      const spaceBelow = window.innerHeight - rect.bottom
      const flipped = spaceBelow < layerH + 16 && rect.top > layerH + 16

      const maxLeft = window.innerWidth - width - 12
      const left = Math.min(Math.max(12, rect.left), Math.max(12, maxLeft))
      const top = flipped ? rect.top - layerH - 8 : rect.bottom + 8

      setPlace({ top, left, width, flipped })
    }

    measure()
    // Two frames: the first measures with an estimate, the second with the
    // real height once the layer has actually rendered.
    const raf = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, anchorRef, minWidth])

  if (!mounted || !open) return null

  return createPortal(
    <div
      ref={layerRef}
      id={id}
      role={role}
      aria-labelledby={labelledBy}
      className={['floating z-overlay', className].filter(Boolean).join(' ')}
      style={{
        top: place ? `${place.top}px` : '-9999px',
        left: place ? `${place.left}px` : '0px',
        width: place ? `${place.width}px` : undefined,
        visibility: place ? 'visible' : 'hidden',
      }}
      data-flipped={place?.flipped ? 'true' : 'false'}
    >
      {children}
    </div>,
    document.body,
  )
}
