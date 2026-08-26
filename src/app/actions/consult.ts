'use server'

import { z } from 'zod'
import { guestBrackets, packages, venueTypes } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { isLocale, defaultLocale, type Locale } from '@/i18n/routes'
import { waUrl, withSource } from '@/lib/whatsapp'

/* ============================================================================
 * Server-side validation of the consultation form.
 *
 * The client validates too, but only so the person gets an answer without a
 * round trip. This function is the one that decides. It re-checks every field,
 * including the event date being in the future and the guest bracket being one
 * we actually offer, because anything sent from a browser can be edited.
 *
 * Errors come back as codes, not sentences: the copy lives in the dictionary
 * so both languages stay in one place.
 * ==========================================================================*/

export type ConsultResult =
  | { ok: true; url: string }
  | { ok: false; errors: Record<string, string> }

const PHONE_ALLOWED = /^[0-9+\-\s()]+$/
const FIVE_YEARS_MS = 5 * 365.25 * 24 * 60 * 60 * 1000

const schema = z.object({
  name: z.string().trim().min(1, 'name').max(120, 'nameLong'),
  phone: z
    .string()
    .trim()
    .min(6, 'phone')
    .max(32, 'phone')
    .refine((v) => PHONE_ALLOWED.test(v), 'phoneFormat')
    .refine((v) => v.replace(/\D/g, '').length >= 8, 'phone'),
  dateUndecided: z.enum(['yes', 'no']),
  date: z.string().trim(),
  guests: z.string().trim().min(1, 'guests'),
  venue: z.string().trim().min(1, 'venue'),
  packageKey: z.string().trim().min(1, 'package'),
  notes: z.string().trim().max(1000, 'notesLong'),
  // Honeypot. A real person never fills this in; it is hidden with clip-path.
  company: z.string().max(0),
})

function startOfTodayUtcOffset(): Date {
  // The audience is in Indonesia and abroad. Comparing against local-midnight
  // in UTC+8 (WITA, the client's own time zone) keeps "today" valid for anyone
  // filling the form from a time zone behind Bali.
  const now = new Date()
  const wita = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return new Date(Date.UTC(wita.getUTCFullYear(), wita.getUTCMonth(), wita.getUTCDate()))
}

export async function submitConsultation(formData: FormData): Promise<ConsultResult> {
  const rawLocale = String(formData.get('locale') ?? '')
  const locale: Locale = isLocale(rawLocale) ? rawLocale : defaultLocale
  const t = getDictionary(locale)

  const parsed = schema.safeParse({
    name: String(formData.get('name') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    dateUndecided: String(formData.get('dateUndecided') ?? 'no'),
    date: String(formData.get('date') ?? ''),
    guests: String(formData.get('guests') ?? ''),
    venue: String(formData.get('venue') ?? ''),
    packageKey: String(formData.get('packageKey') ?? ''),
    notes: String(formData.get('notes') ?? ''),
    company: String(formData.get('company') ?? ''),
  })

  const errors: Record<string, string> = {}

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? 'generic')
      if (field === 'company') return { ok: false, errors: { generic: t.form.errors.generic } }
      const code = issue.message as keyof typeof t.form.errors
      const key = field === 'packageKey' ? 'package' : field
      if (!errors[key]) errors[key] = t.form.errors[code] ?? t.form.errors.generic
    }
    return { ok: false, errors }
  }

  const data = parsed.data
  const undecided = data.dateUndecided === 'yes'

  /* ---- event date ---- */
  let dateLabel = t.wa.fieldDateUndecided
  if (!undecided) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      errors.date = t.form.errors.date
    } else {
      const [y, m, d] = data.date.split('-').map(Number)
      const picked = new Date(Date.UTC(y, m - 1, d))
      const today = startOfTodayUtcOffset()
      if (Number.isNaN(picked.getTime()) || picked.getUTCMonth() !== m - 1) {
        errors.date = t.form.errors.date
      } else if (picked.getTime() < today.getTime()) {
        errors.date = t.form.errors.datePast
      } else if (picked.getTime() - today.getTime() > FIVE_YEARS_MS) {
        errors.date = t.form.errors.dateFar
      } else {
        dateLabel = `${d} ${t.form.months[m - 1]} ${y}`
      }
    }
  }

  /* ---- values must be ones we actually offer ---- */
  const guest = guestBrackets.find((g) => g.key === data.guests)
  if (!guest) errors.guests = t.form.errors.guests

  const venue = venueTypes.find((v) => v.key === data.venue)
  if (!venue) errors.venue = t.form.errors.venue

  const pkg =
    data.packageKey === 'undecided'
      ? { name: { id: t.form.packageUndecided, en: t.form.packageUndecided } }
      : packages.find((p) => p.key === data.packageKey)
  if (!pkg) errors.package = t.form.errors.package

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  /* ---- build the WhatsApp message ---- */
  const pageUrl = String(formData.get('pageUrl') ?? '')
  const buttonLabel = String(formData.get('buttonLabel') ?? 'consultation-form')

  const lines = [
    t.wa.formIntro,
    '',
    `${t.wa.fieldName}: ${data.name}`,
    `${t.wa.fieldPhone}: ${data.phone}`,
    `${t.wa.fieldDate}: ${dateLabel}`,
    `${t.wa.fieldGuests}: ${guest!.label[locale]}`,
    `${t.wa.fieldVenue}: ${venue!.label[locale]}`,
    `${t.wa.fieldPackage}: ${pkg!.name[locale]}`,
  ]
  if (data.notes) lines.push(`${t.wa.fieldNotes}: ${data.notes}`)

  const message = withSource(lines.join('\n'), { pageUrl, buttonLabel }, { source: t.wa.source, button: t.wa.button })

  return { ok: true, url: waUrl(message) }
}
