import { client } from '@/config/client.config'
import { getDictionary } from '@/i18n/dictionaries'
import type { Locale } from '@/i18n/routes'

/**
 * Only what is confirmed appears as a fact.
 *
 * The city is known. The street address and the opening hours are not, so
 * rather than inventing them the row states plainly that they are not
 * published yet and points at WhatsApp. Filling them in later is a two-line
 * edit in src/config/client.config.ts.
 */
export function ContactDetails({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const d = t.pages.contact.details
  const { unconfirmed } = client

  const rows: { label: string; value: string; pending?: boolean }[] = [
    { label: d.cityLabel, value: `${client.city}, ${client.region}` },
    {
      label: d.addressLabel,
      value: unconfirmed.streetAddress || d.addressPending,
      pending: !unconfirmed.streetAddress,
    },
    {
      label: d.hoursLabel,
      value: unconfirmed.openingHours.length ? unconfirmed.openingHours.join(', ') : d.hoursPending,
      pending: unconfirmed.openingHours.length === 0,
    },
    { label: d.whatsappLabel, value: `+${client.whatsapp}` },
  ]

  if (unconfirmed.email) rows.push({ label: d.emailLabel, value: unconfirmed.email })

  return (
    <ul className="detail-list">
      {rows.map((row) => (
        <li key={row.label} className="detail-row">
          <span className="detail-label">{row.label}</span>
          <span className={row.pending ? 'detail-value detail-value-pending' : 'detail-value'}>
            {row.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
