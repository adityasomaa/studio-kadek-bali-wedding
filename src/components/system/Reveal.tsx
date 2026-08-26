'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'

/**
 * Scroll reveal.
 *
 * Two guards, both there for the same reason: an IntersectionObserver attached
 * inside an `overflow: hidden` ancestor can report a ratio of 0 forever, and
 * then the content simply never appears.
 *
 *  1. A fallback timer re-checks with getBoundingClientRect and reveals
 *     anything already on screen, so nothing can stay invisible.
 *  2. In development it walks the ancestor chain and names any clipping
 *     parent in the console, so the layout gets fixed rather than papered over.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className,
}: {
  children: ReactNode
  delay?: number
  as?: ElementType
  className?: string
}) {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      let parent = node.parentElement
      while (parent && parent !== document.body) {
        const overflow = getComputedStyle(parent).overflow
        if (overflow === 'hidden') {
          console.warn(
            '[Reveal] clipping ancestor found; IntersectionObserver may never fire here:',
            parent,
          )
          break
        }
        parent = parent.parentElement
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true)
            observer.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
    )
    observer.observe(node)

    const fallback = window.setTimeout(() => {
      const box = node.getBoundingClientRect()
      if (box.top < window.innerHeight && box.bottom > 0) setRevealed(true)
    }, 1400)

    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return (
    <Tag
      ref={ref as never}
      className={['reveal', className].filter(Boolean).join(' ')}
      data-revealed={revealed ? 'true' : 'false'}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  )
}
