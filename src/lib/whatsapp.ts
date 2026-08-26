import { client } from '@/config/client.config'

/** Digits only, as wa.me requires. */
export function waNumber(): string {
  return client.whatsapp.replace(/\D/g, '')
}

export function waUrl(message: string): string {
  return `https://wa.me/${waNumber()}?text=${encodeURIComponent(message)}`
}

/**
 * Every WhatsApp message the site can produce ends with the same two lines, so
 * an enquiry can be traced back to the page and the button it came from.
 */
export function withSource(
  body: string,
  source: { pageUrl: string; buttonLabel: string },
  labels: { source: string; button: string },
): string {
  return [body, '', `${labels.source}: ${source.pageUrl}`, `${labels.button}: ${source.buttonLabel}`].join('\n')
}
