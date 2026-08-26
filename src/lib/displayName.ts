import { client } from '@/config/client.config'

/**
 * Where the loader wordmark is allowed to break.
 *
 * The break point is a config decision, not a guess: if `shortName` is a
 * proper prefix of `name`, the wordmark breaks right after it. That gives
 * "Pratiwi Bali" / "Wedding Organizer" rather than letting the browser strand
 * "Wedding" on the first line and split the phrase in half.
 *
 * When `shortName` is the whole name (as it is for a name short enough not to
 * need a break) the wordmark stays a single part and never wraps.
 *
 * Only the loader uses this. Whether the parts render on one line or two is a
 * CSS decision per breakpoint: one line on desktop, two below it.
 */
export function wordmarkParts(
  name: string = client.name,
  shortName: string = client.shortName,
): string[] {
  const full = name.trim()
  const head = shortName.trim()
  if (!head || head === full) return [full]
  if (!full.startsWith(`${head} `)) return [full]
  const tail = full.slice(head.length + 1).trim()
  return tail ? [head, tail] : [full]
}
