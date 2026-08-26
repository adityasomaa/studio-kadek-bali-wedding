'use client'

import { useEffect, useState } from 'react'
import { client } from '@/config/client.config'

/**
 * The page origin, safe to use during SSR.
 *
 * Reading window.location.origin directly while rendering produces a different
 * string on the server than in the browser, and React reports a hydration
 * mismatch on every WhatsApp link. Start from the configured origin, which is
 * what the server renders, then adopt the real one after mount so preview
 * deployments and localhost report themselves accurately.
 */
export function useOrigin(): string {
  const [origin, setOrigin] = useState(client.origin)
  useEffect(() => {
    if (window.location.origin) setOrigin(window.location.origin)
  }, [])
  return origin
}
