'use client'

import type { ReactNode } from 'react'
import { SmartLink } from '@/components/system/SmartLink'
import { WhatsAppLink } from '@/components/WhatsAppLink'
import { Reveal } from '@/components/system/Reveal'

export type SectionCta =
  /** `label` is the visible text. */
  | { kind: 'link'; href: string; label: string; isHome?: boolean }
  /** `label` is the visible text; `track` is the analytics label carried into
   *  the WhatsApp message so the enquiry can be traced to this button. */
  | { kind: 'whatsapp'; label: string; track: string; message?: string }
  | { kind: 'none' }

/**
 * Every section on the site is introduced the same way and in the same order:
 * section label, headline, short description, then one call to action. Having
 * a single component for it is what keeps that promise true as pages get added.
 */
export function SectionHeader({
  eyebrow,
  headline,
  description,
  cta,
  level = 'h2',
  size = 'lg',
  align = 'start',
  id,
  aside,
}: {
  eyebrow: string
  headline: string
  description: string
  cta: SectionCta
  level?: 'h1' | 'h2'
  size?: 'lg' | 'md'
  align?: 'start' | 'center'
  id?: string
  /** Optional extra element rendered next to the CTA. */
  aside?: ReactNode
}) {
  const Heading = level

  return (
    <header
      className={[
        'flex flex-col gap-5',
        align === 'center' ? 'items-center text-center' : 'items-start',
      ].join(' ')}
      id={id}
    >
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
      </Reveal>

      <Reveal delay={80}>
        <Heading className={size === 'lg' ? 'headline-lg' : 'headline-md'}>{headline}</Heading>
      </Reveal>

      <Reveal delay={150}>
        <p className={align === 'center' ? 'lede mx-auto' : 'lede'}>{description}</p>
      </Reveal>

      {cta.kind !== 'none' && (
        <Reveal delay={220}>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {cta.kind === 'link' ? (
              <SmartLink href={cta.href} className="btn btn-secondary" isHome={cta.isHome}>
                {cta.label}
              </SmartLink>
            ) : (
              <WhatsAppLink label={cta.track} variant="secondary" message={cta.message}>
                {cta.label}
              </WhatsAppLink>
            )}
            {aside}
          </div>
        </Reveal>
      )}
    </header>
  )
}
