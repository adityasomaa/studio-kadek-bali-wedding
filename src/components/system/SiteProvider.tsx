'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/i18n/routes'
import { wait, prefersReducedMotion } from '@/lib/wait'

/* ============================================================================
 * One provider for the four pieces of cross-cutting client state:
 *   locale       — which dictionary client components should read
 *   overlays     — how many blocking layers are open (lightbox, calendar, menu)
 *   transition   — the page-transition curtain phase and the navigate() entry
 *   consent      — the cookie choice, and whether it actually drives anything
 * ==========================================================================*/

export type CurtainPhase = 'idle' | 'closing' | 'covered' | 'opening'
export type CurtainVariant = 'intro' | 'curtain'
export type Consent = 'unset' | 'granted' | 'denied'

export const TIMING = {
  close: 620,
  hold: 140,
  open: 760,
  introHold: 1550,
} as const

const CONSENT_KEY = 'bwo_consent'

/** Fired after an overlay releases the scroll lock, carrying the restored Y. */
export const RESTORE_SCROLL_EVENT = 'bwo:restore-scroll'

type SiteContextValue = {
  locale: Locale
  /* overlays */
  overlayCount: number
  pushOverlay: (id: string) => void
  popOverlay: (id: string) => void
  /* transition */
  phase: CurtainPhase
  variant: CurtainVariant
  navigate: (href: string, opts?: { isHome?: boolean }) => void
  /* consent */
  consent: Consent
  setConsent: (value: Exclude<Consent, 'unset'>) => void
  reopenConsent: () => void
  consentPromptOpen: boolean
  /* mobile menu */
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

const SiteContext = createContext<SiteContextValue | null>(null)

export function useSite() {
  const ctx = useContext(SiteContext)
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>')
  return ctx
}

/** Registers a blocking overlay for as long as `open` is true. */
export function useOverlayLock(id: string, open: boolean) {
  const { pushOverlay, popOverlay } = useSite()
  useEffect(() => {
    if (!open) return
    pushOverlay(id)
    return () => popOverlay(id)
  }, [id, open, pushOverlay, popOverlay])
}

export function SiteProvider({
  locale,
  children,
  playIntro,
}: {
  locale: Locale
  children: ReactNode
  /** True on the home route: the intro loader plays there as well as on first load. */
  playIntro: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()

  /* ---------------- overlays + body scroll lock ---------------- */
  const [overlays, setOverlays] = useState<string[]>([])
  const pushOverlay = useCallback((id: string) => {
    setOverlays((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])
  const popOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((x) => x !== id))
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)
  const overlayCount = overlays.length + (menuOpen ? 1 : 0)

  useEffect(() => {
    const body = document.body
    if (overlayCount > 0) {
      const y = window.scrollY
      body.dataset.scrollLocked = 'true'
      body.style.setProperty('--locked-scroll', `${y}px`)
      return () => {
        delete body.dataset.scrollLocked
        body.style.removeProperty('--locked-scroll')
        // Read a layout property first so the document has its full height back
        // before we scroll; otherwise the restore clamps to the locked height.
        void document.documentElement.scrollHeight
        window.scrollTo(0, y)
        // Lenis keeps its own scroll position and will drive the window back to
        // it on the next frame, undoing the line above. Tell it where we
        // actually are. The event is a no-op when Lenis is not mounted.
        window.dispatchEvent(new CustomEvent(RESTORE_SCROLL_EVENT, { detail: y }))
      }
    }
    delete body.dataset.scrollLocked
  }, [overlayCount])

  /* ---------------- page transition ---------------- */
  const [phase, setPhase] = useState<CurtainPhase>(() => (playIntro ? 'covered' : 'idle'))
  const [variant, setVariant] = useState<CurtainVariant>('intro')
  const pendingRef = useRef<string | null>(null)

  // First paint: if the intro is showing, run it out.
  // No "has already started" ref here on purpose. React runs effects twice in
  // development; a ref guard would let the first run be cancelled by its own
  // cleanup and then make the second run bail out, leaving the curtain down
  // until the backstop timer fires. Letting the effect re-run is correct.
  useEffect(() => {
    if (!playIntro) return

    let cancelled = false
    ;(async () => {
      await wait(prefersReducedMotion() ? 0 : TIMING.introHold)
      if (cancelled) return
      setPhase('opening')
      await wait(prefersReducedMotion() ? 0 : TIMING.open)
      if (cancelled) return
      setPhase('idle')
    })()
    return () => {
      cancelled = true
    }
  }, [playIntro])

  const navigate = useCallback(
    (href: string, opts?: { isHome?: boolean }) => {
      if (href === pathname) return
      if (prefersReducedMotion()) {
        router.push(href)
        window.scrollTo(0, 0)
        return
      }
      if (pendingRef.current) return

      pendingRef.current = href
      setVariant(opts?.isHome ? 'intro' : 'curtain')
      setMenuOpen(false)
      ;(async () => {
        setPhase('closing')
        await wait(TIMING.close)
        setPhase('covered')
        // Everything that changes the page happens while the curtain is down.
        router.push(href)
        await wait(TIMING.hold)
      })()
    },
    [pathname, router],
  )

  // The curtain is down and the route has actually changed: scroll, then open.
  const lastPathRef = useRef(pathname)
  useEffect(() => {
    if (lastPathRef.current === pathname) return
    lastPathRef.current = pathname
    if (!pendingRef.current) return

    pendingRef.current = null
    let cancelled = false
    ;(async () => {
      window.scrollTo(0, 0)
      const hold = variant === 'intro' ? TIMING.introHold : TIMING.hold
      await wait(hold)
      if (cancelled) return
      setPhase('opening')
      await wait(TIMING.open)
      if (cancelled) return
      setPhase('idle')
    })()
    return () => {
      cancelled = true
    }
  }, [pathname, variant])

  // Backstop. If a navigation never lands, never leave the page covered.
  useEffect(() => {
    if (phase === 'idle') return
    const t = setTimeout(() => {
      pendingRef.current = null
      setPhase('idle')
    }, 6000)
    return () => clearTimeout(t)
  }, [phase])

  /* ---------------- cookie consent ---------------- */
  const [consent, setConsentState] = useState<Consent>('unset')
  const [consentPromptOpen, setConsentPromptOpen] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {
      stored = window.localStorage.getItem(CONSENT_KEY)
    } catch {
      /* storage blocked: treat as unset, ask again */
    }
    if (stored === 'granted' || stored === 'denied') {
      setConsentState(stored)
      applyConsent(stored)
    } else {
      setConsentPromptOpen(true)
    }
  }, [])

  const setConsent = useCallback((value: Exclude<Consent, 'unset'>) => {
    setConsentState(value)
    setConsentPromptOpen(false)
    try {
      window.localStorage.setItem(CONSENT_KEY, value)
    } catch {
      /* nothing to persist to; the choice still applies for this visit */
    }
    applyConsent(value)
  }, [])

  const reopenConsent = useCallback(() => setConsentPromptOpen(true), [])

  const value = useMemo<SiteContextValue>(
    () => ({
      locale,
      overlayCount,
      pushOverlay,
      popOverlay,
      phase,
      variant,
      navigate,
      consent,
      setConsent,
      reopenConsent,
      consentPromptOpen,
      menuOpen,
      setMenuOpen,
    }),
    [
      locale,
      overlayCount,
      pushOverlay,
      popOverlay,
      phase,
      variant,
      navigate,
      consent,
      setConsent,
      reopenConsent,
      consentPromptOpen,
      menuOpen,
    ],
  )

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>
}

/**
 * The consent choice has to move something, otherwise the banner is theatre.
 *
 * Granted: a first-party, same-site session marker is written, and any
 * measurement added later can read `document.documentElement.dataset.consent`
 * before it initialises.
 * Denied: that marker is removed and the cookie is expired immediately.
 */
function applyConsent(value: 'granted' | 'denied') {
  const root = document.documentElement
  root.dataset.consent = value

  if (value === 'granted') {
    document.cookie = `bwo_analytics=1; Path=/; Max-Age=15552000; SameSite=Lax`
  } else {
    document.cookie = `bwo_analytics=; Path=/; Max-Age=0; SameSite=Lax`
    try {
      window.sessionStorage.removeItem('bwo_analytics_session')
    } catch {
      /* nothing stored */
    }
  }
  window.dispatchEvent(new CustomEvent('bwo:consent', { detail: value }))
}
