'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { RESTORE_SCROLL_EVENT, useSite } from '@/components/system/SiteProvider'

/**
 * Lenis, on desktop pointers only.
 *
 * It is deliberately not mounted on tablet or phone widths: touch scrolling is
 * already smooth there, hijacking it fights momentum, and it makes the address
 * bar behave badly. It also stops entirely while a lightbox, the date
 * calendar, or the mobile menu is open, so those can lock the body properly.
 */
export function SmoothScroll() {
  const { overlayCount } = useSite()
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let raf = 0

    function start() {
      if (lenisRef.current || reduce.matches || !query.matches) return
      const lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1,
      })
      lenisRef.current = lenis
      const loop = (time: number) => {
        lenis.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    function stop() {
      cancelAnimationFrame(raf)
      lenisRef.current?.destroy()
      lenisRef.current = null
    }

    function sync() {
      if (query.matches && !reduce.matches) start()
      else stop()
    }

    sync()
    query.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      query.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
      stop()
    }
  }, [])

  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return
    if (overlayCount > 0) {
      lenis.stop()
    } else {
      lenis.resize()
      lenis.start()
    }
  }, [overlayCount])

  // The scroll lock pins the body, which collapses the document height and
  // leaves Lenis holding a stale position. When the lock is released the
  // provider says where the page should be; adopt it immediately rather than
  // animating back to the stale value.
  useEffect(() => {
    function onRestore(event: Event) {
      const lenis = lenisRef.current
      if (!lenis) return
      const y = (event as CustomEvent<number>).detail
      lenis.resize()
      lenis.scrollTo(y, { immediate: true, force: true })
    }
    window.addEventListener(RESTORE_SCROLL_EVENT, onRestore)
    return () => window.removeEventListener(RESTORE_SCROLL_EVENT, onRestore)
  }, [])

  return null
}
