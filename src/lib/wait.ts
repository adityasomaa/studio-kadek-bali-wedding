/**
 * Waits `ms`, racing requestAnimationFrame against setTimeout.
 *
 * Why both: rAF stops firing when the tab is backgrounded. A transition
 * sequence chained on rAF alone leaves the curtain stuck over the page
 * forever if someone switches tabs mid-navigation. setTimeout keeps firing
 * (throttled, but it fires), so whichever gets there first resolves and the
 * sequence always finishes.
 */
export function wait(ms: number): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  return new Promise((resolve) => {
    let settled = false
    const start = performance.now()

    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      cancelAnimationFrame(frame)
      resolve()
    }

    // The +50ms means rAF normally wins while the tab is visible, and the
    // timer only takes over when frames have stopped.
    const timer = setTimeout(finish, ms + 50)

    let frame = requestAnimationFrame(function step(now) {
      if (now - start >= ms) finish()
      else frame = requestAnimationFrame(step)
    })
  })
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
