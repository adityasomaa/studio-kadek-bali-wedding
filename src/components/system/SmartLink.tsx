'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { useSite } from '@/components/system/SiteProvider'
import { hrefFor } from '@/i18n/routes'

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  children: ReactNode
  /** Set when the destination is the home route so the intro loader plays. */
  isHome?: boolean
}

/**
 * Internal link that hands navigation to the transition sequence instead of
 * letting the router swap content underneath the user. Falls back to a normal
 * navigation for modified clicks and middle-clicks, which people expect to
 * open a new tab.
 */
export function SmartLink({ href, children, isHome, onClick, ...rest }: Props) {
  const { navigate, locale } = useSite()
  const pathname = usePathname()
  const isCurrent = pathname === href
  const homeHref = hrefFor('home', locale)

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    navigate(href, { isHome: isHome ?? href === homeHref })
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-current={isCurrent ? 'page' : undefined}
      {...rest}
    >
      {children}
    </Link>
  )
}
