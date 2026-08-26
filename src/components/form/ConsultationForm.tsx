'use client'

import { useRef, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { guestBrackets, packages, venueTypes } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { useOrigin } from '@/lib/useOrigin'
import { CustomSelect } from '@/components/form/CustomSelect'
import { DateField } from '@/components/form/DateField'
import { submitConsultation } from '@/app/actions/consult'

/**
 * The consultation form.
 *
 * It asks the things a wedding organizer actually needs to answer a first
 * message: who you are, how to reach you, when, how many people, what kind of
 * place, and which level of help. Everything is optional to *know* — the date
 * has an explicit "not decided yet", because a lot of people write in while
 * they are still weighing it up, and a form that refuses to accept that turns
 * them away.
 *
 * The answers become one WhatsApp message. Nothing is stored on a server here.
 */
export function ConsultationForm() {
  const { locale } = useCurrentPage()
  const pathname = usePathname()
  const t = getDictionary(locale)
  const origin = useOrigin()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [undecided, setUndecided] = useState(false)
  const [guests, setGuests] = useState('')
  const [venue, setVenue] = useState('')
  const [packageKey, setPackageKey] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ url: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const summaryRef = useRef<HTMLDivElement | null>(null)

  const packageOptions = [
    ...packages.map((p) => ({ value: p.key, label: p.name[locale] })),
    { value: 'undecided', label: t.form.packageUndecided },
  ]

  /** Mirrors the server rules so the answer is instant. The server still decides. */
  function validateLocally(): Record<string, string> {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = t.form.errors.name
    else if (name.trim().length > 120) next.name = t.form.errors.nameLong

    const digits = phone.replace(/\D/g, '')
    if (!phone.trim()) next.phone = t.form.errors.phone
    else if (!/^[0-9+\-\s()]+$/.test(phone.trim())) next.phone = t.form.errors.phoneFormat
    else if (digits.length < 8) next.phone = t.form.errors.phone

    if (!undecided) {
      if (!date) next.date = t.form.errors.date
      else {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const [y, m, d] = date.split('-').map(Number)
        if (new Date(y, m - 1, d) < today) next.date = t.form.errors.datePast
      }
    }

    if (!guests) next.guests = t.form.errors.guests
    if (!venue) next.venue = t.form.errors.venue
    if (!packageKey) next.package = t.form.errors.package
    if (notes.length > 1000) next.notes = t.form.errors.notesLong
    return next
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setResult(null)

    const local = validateLocally()
    setErrors(local)
    if (Object.keys(local).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }

    const form = event.currentTarget
    const data = new FormData(form)
    data.set('locale', locale)
    data.set('pageUrl', `${origin}${pathname}`)
    data.set('buttonLabel', 'consultation-form-submit')

    startTransition(async () => {
      const response = await submitConsultation(data)
      if (response.ok) {
        setErrors({})
        setResult({ url: response.url })
        // Try to hand over to WhatsApp straight away. If the browser blocks the
        // programmatic open, the panel below still carries the link.
        const opened = window.open(response.url, '_blank', 'noopener,noreferrer')
        if (!opened) requestAnimationFrame(() => summaryRef.current?.focus())
      } else {
        setResult(null)
        setErrors(response.errors)
        requestAnimationFrame(() => summaryRef.current?.focus())
      }
    })
  }

  const errorList = Object.entries(errors)

  return (
    <form className="consult-form" onSubmit={onSubmit} noValidate>
      <p className="text-ink-muted">{t.form.intro}</p>

      <div
        ref={summaryRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="form-summary"
        data-state={result ? 'success' : errorList.length ? 'error' : 'idle'}
      >
        {result && (
          <>
            <p className="form-summary-title">{t.form.successTitle}</p>
            <p className="mt-1.5 text-sm text-ink-muted">{t.form.successBody}</p>
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
              {t.form.successLink}
            </a>
          </>
        )}
        {!result && errorList.length > 0 && (
          <>
            <p className="form-summary-title">{t.form.errorTitle}</p>
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {errorList.map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="form-grid">
        <div className="field">
          <label className="field-label" htmlFor="cf-name">
            {t.form.name}
          </label>
          <input
            id="cf-name"
            name="name"
            className="control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.form.namePlaceholder}
            autoComplete="name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'cf-name-error' : undefined}
            data-invalid={errors.name ? 'true' : undefined}
            required
          />
          {errors.name && (
            <p className="field-error" id="cf-name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field-label" htmlFor="cf-phone">
            {t.form.phone}
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            className="control"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t.form.phonePlaceholder}
            autoComplete="tel"
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'cf-phone-error' : undefined}
            data-invalid={errors.phone ? 'true' : undefined}
            required
          />
          {errors.phone && (
            <p className="field-error" id="cf-phone-error">
              {errors.phone}
            </p>
          )}
        </div>

        <DateField
          t={t}
          value={date}
          onChange={setDate}
          undecided={undecided}
          onUndecidedChange={setUndecided}
          error={errors.date}
          errorId="cf-date-error"
        />

        <CustomSelect
          label={t.form.guests}
          placeholder={t.form.guestsPlaceholder}
          name="guests"
          value={guests}
          onChange={setGuests}
          options={guestBrackets.map((g) => ({ value: g.key, label: g.label[locale] }))}
          error={errors.guests}
          errorId="cf-guests-error"
          required
        />

        <CustomSelect
          label={t.form.venue}
          placeholder={t.form.venuePlaceholder}
          name="venue"
          value={venue}
          onChange={setVenue}
          options={venueTypes.map((v) => ({ value: v.key, label: v.label[locale] }))}
          error={errors.venue}
          errorId="cf-venue-error"
          required
        />

        <CustomSelect
          label={t.form.packageField}
          placeholder={t.form.packagePlaceholder}
          name="packageKey"
          value={packageKey}
          onChange={setPackageKey}
          options={packageOptions}
          error={errors.package}
          errorId="cf-package-error"
          required
        />

        <div className="field field-wide">
          <label className="field-label" htmlFor="cf-notes">
            {t.form.notes} <span className="field-optional">({t.form.optional})</span>
          </label>
          <textarea
            id="cf-notes"
            name="notes"
            className="control control-area"
            rows={5}
            maxLength={1000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.form.notesPlaceholder}
            aria-invalid={errors.notes ? true : undefined}
            aria-describedby={errors.notes ? 'cf-notes-error' : undefined}
            data-invalid={errors.notes ? 'true' : undefined}
          />
          {errors.notes && (
            <p className="field-error" id="cf-notes-error">
              {errors.notes}
            </p>
          )}
        </div>
      </div>

      {/*
        Honeypot. Hidden with clip-path and not with a large negative offset:
        `left: -9999px` on an element whose ancestors are all static positions
        it against the initial containing block and creates a real horizontal
        overflow at every breakpoint.
      */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? t.form.submitting : t.form.submit}
        </button>
      </div>
    </form>
  )
}
