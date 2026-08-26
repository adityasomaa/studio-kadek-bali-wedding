'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useSite } from '@/components/system/SiteProvider'
import { getDictionary } from '@/i18n/dictionaries'
import { waUrl, withSource } from '@/lib/whatsapp'
import { useOrigin } from '@/lib/useOrigin'

/**
 * The single WhatsApp entry point for the whole site.
 *
 * Every button that opens WhatsApp goes through here, and every message it
 * produces carries the page it was sent from and the label of the button that
 * was pressed. That is the only way to tell a "Packages page, hero button"
 * enquiry from a "Gallery page, footer button" one once they all land in the
 * same inbox.
 */
export function WhatsAppLink({
  label,
  children,
  message,
  className,
  variant = 'primary',
}: {
  /** Tracking label. Also the visible text when no children are given. */
  label: string
  children?: ReactNode
  /** Overrides the default opening line. */
  message?: string
  className?: string
  variant?: 'primary' | 'secondary' | 'quiet' | 'bare'
}) {
  const { locale } = useSite()
  const pathname = usePathname()
  const t = getDictionary(locale)

  const origin = useOrigin()
  const pageUrl = `${origin}${pathname}`

  const href = waUrl(
    withSource(message ?? t.wa.intro, { pageUrl, buttonLabel: label }, { source: t.wa.source, button: t.wa.button }),
  )

  const classes = [
    variant === 'bare' ? '' : 'btn',
    variant === 'primary' ? 'btn-primary' : '',
    variant === 'secondary' ? 'btn-secondary' : '',
    variant === 'quiet' ? 'btn-quiet' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
      data-wa-label={label}
    >
      {children ?? label}
    </a>
  )
}
