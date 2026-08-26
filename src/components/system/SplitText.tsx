'use client'

/**
 * Per-character text animation.
 *
 * Accessibility contract: the whole string is announced once from the parent's
 * aria-label, and every individual character is hidden from assistive tech.
 * Without this a screen reader spells the word out letter by letter.
 *
 * `parts` splits the string into groups that CSS can put on separate lines
 * (see .curtain-line). The stagger keeps running across the parts, so the
 * cascade reads as one movement rather than restarting on the second line.
 */
export function SplitText({
  text,
  parts,
  className,
  charClassName,
  partClassName,
  delayStep = 34,
  startDelay = 0,
  as: Tag = 'span',
}: {
  text: string
  /** Optional line groups. Defaults to the whole string as one group. */
  parts?: string[]
  className?: string
  charClassName?: string
  partClassName?: string
  delayStep?: number
  startDelay?: number
  as?: 'span' | 'h1' | 'h2' | 'p'
}) {
  const groups = parts && parts.length > 0 ? parts : [text]
  let index = 0

  return (
    <Tag className={className} aria-label={text}>
      {groups.map((group, groupIndex) => (
        <span key={`${group}-${groupIndex}`} className={partClassName} aria-hidden="true">
          {Array.from(group).map((ch, i) => {
            const delay = startDelay + index * delayStep
            index++
            return (
              <span
                key={`${ch}-${i}`}
                className={charClassName}
                style={{ animationDelay: `${delay}ms` }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}
