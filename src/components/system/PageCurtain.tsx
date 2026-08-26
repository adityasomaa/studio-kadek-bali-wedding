'use client'

import { useSite } from '@/components/system/SiteProvider'
import { SplitText } from '@/components/system/SplitText'
import { getDictionary } from '@/i18n/dictionaries'
import { client } from '@/config/client.config'
import { wordmarkParts } from '@/lib/displayName'

/**
 * Both loaders live here.
 *
 *   variant "intro"   — first visit and any navigation to the home route
 *   variant "curtain" — every other navigation
 *
 * The sequence is driven from SiteProvider: closes, swaps the content while
 * covered, scrolls to top, then opens. Nothing in the sequence depends on
 * requestAnimationFrame alone (see src/lib/wait.ts).
 */
export function PageCurtain() {
  const { phase, variant, locale } = useSite()
  const t = getDictionary(locale)
  const showIntroContent = variant === 'intro'

  return (
    <div
      className="curtain z-curtain"
      data-phase={phase}
      data-variant={variant}
      aria-hidden={phase === 'idle' ? 'true' : undefined}
      role={phase === 'idle' ? undefined : 'status'}
      aria-live="polite"
    >
      <div className="curtain-inner">
        {showIntroContent ? (
          <div className="curtain-intro">
            <SplitText
              text={client.name}
              parts={wordmarkParts()}
              className="curtain-wordmark"
              partClassName="curtain-line"
              charClassName="curtain-char"
              delayStep={38}
              startDelay={80}
            />
            <span className="curtain-place">
              {client.city}, {client.region}
            </span>
            <span className="curtain-rule" />
            <span className="visually-hidden">{t.common.loading}</span>
          </div>
        ) : (
          <div className="curtain-mark" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="44" height="44" focusable="false">
              <g fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round">
                <path d="M 24 10 A 22 22 0 0 0 24 54" />
                <path d="M 40 10 A 22 22 0 0 1 40 54" />
              </g>
              <circle cx="32" cy="32" r="5" fill="var(--accent-ink)" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
