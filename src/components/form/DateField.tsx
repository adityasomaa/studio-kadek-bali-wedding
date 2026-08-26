'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Floating } from '@/components/form/Floating'
import { useOverlayLock } from '@/components/system/SiteProvider'
import type { Dictionary } from '@/i18n/dictionaries'

/* ---------- date helpers, all in local time ---------- */
const pad = (n: number) => String(n).padStart(2, '0')
export const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}
const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Monday-first offset, matching how calendars are printed in Indonesia. */
const mondayIndex = (d: Date) => (d.getDay() + 6) % 7

/**
 * The event date.
 *
 * Deliberately not `<input type="date">`: the native control renders as a
 * different thing on every platform, cannot be styled to match the rest of the
 * form, and on some Android browsers opens a dialog that ignores min.
 *
 * The whole field is the trigger, not just a small icon. People tap the text,
 * so the text has to open the calendar.
 *
 * Past dates are refused here and again on the server. Client-side validation
 * is a convenience, never the guarantee.
 */
export function DateField({
  t,
  value,
  onChange,
  undecided,
  onUndecidedChange,
  error,
  errorId,
}: {
  t: Dictionary
  value: string
  onChange: (iso: string) => void
  undecided: boolean
  onUndecidedChange: (next: boolean) => void
  error?: string
  errorId?: string
}) {
  const [open, setOpen] = useState(false)
  const today = startOfToday()
  const [cursor, setCursor] = useState<Date>(() => (value ? fromISO(value) : today))
  const [focusDay, setFocusDay] = useState<Date>(() => (value ? fromISO(value) : today))
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const baseId = useId()

  useOverlayLock(`calendar-${baseId}`, open)

  const close = useCallback((restore = true) => {
    setOpen(false)
    if (restore) triggerRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (gridRef.current?.closest('.floating')?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const node = gridRef.current?.querySelector<HTMLElement>('[data-focus="true"]')
    node?.focus({ preventScroll: true })
  }, [open, focusDay, cursor])

  function openCalendar() {
    if (undecided) return
    const start = value ? fromISO(value) : today
    setCursor(new Date(start.getFullYear(), start.getMonth(), 1))
    setFocusDay(start)
    setOpen(true)
  }

  function pick(day: Date) {
    if (day < today) return
    onChange(toISO(day))
    close()
  }

  function onGridKeyDown(event: React.KeyboardEvent) {
    let next: Date | null = null
    switch (event.key) {
      case 'ArrowRight': next = addDays(focusDay, 1); break
      case 'ArrowLeft': next = addDays(focusDay, -1); break
      case 'ArrowDown': next = addDays(focusDay, 7); break
      case 'ArrowUp': next = addDays(focusDay, -7); break
      case 'Home': next = addDays(focusDay, -mondayIndex(focusDay)); break
      case 'End': next = addDays(focusDay, 6 - mondayIndex(focusDay)); break
      case 'PageUp': next = addMonths(focusDay, -1); break
      case 'PageDown': next = addMonths(focusDay, 1); break
      case 'Enter':
      case ' ':
        event.preventDefault()
        pick(focusDay)
        return
      case 'Escape':
        event.preventDefault()
        close()
        return
      default:
        return
    }
    event.preventDefault()
    if (next < today) next = today
    setFocusDay(next)
    setCursor(new Date(next.getFullYear(), next.getMonth(), 1))
  }

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const leading = mondayIndex(monthStart)
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const prevDisabled =
    cursor.getFullYear() === today.getFullYear() && cursor.getMonth() === today.getMonth()

  const display = value ? formatDate(fromISO(value), t) : ''

  return (
    <div className="field">
      <span className="field-label" id={`${baseId}-label`}>
        {t.form.date}
      </span>

      <button
        ref={triggerRef}
        type="button"
        className="control date-trigger"
        onClick={openCalendar}
        disabled={undecided}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${baseId}-label ${baseId}-value`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        data-placeholder={display ? undefined : 'true'}
        data-invalid={error ? 'true' : undefined}
      >
        <span id={`${baseId}-value`}>{undecided ? t.form.dateUndecided : display || t.form.datePlaceholder}</span>
        <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" focusable="false">
          <rect x="3" y="4.5" width="14" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 8.5 H17 M7 2.8 V6 M13 2.8 V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </svg>
      </button>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={undecided}
          onChange={(e) => {
            onUndecidedChange(e.target.checked)
            if (e.target.checked) {
              onChange('')
              setOpen(false)
            }
          }}
        />
        <span>{t.form.dateUndecided}</span>
      </label>

      <input type="hidden" name="date" value={undecided ? '' : value} />
      <input type="hidden" name="dateUndecided" value={undecided ? 'yes' : 'no'} />

      <Floating
        anchorRef={triggerRef}
        open={open}
        minWidth={296}
        role="dialog"
        labelledBy={`${baseId}-cal-title`}
        className="calendar-layer"
      >
        <div className="calendar">
          <div className="calendar-head">
            <button
              type="button"
              className="calendar-nav"
              onClick={() => setCursor(addMonths(cursor, -1))}
              disabled={prevDisabled}
            >
              <span className="visually-hidden">{t.form.monthPrevious}</span>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M12 4 L6 10 L12 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
            <p id={`${baseId}-cal-title`} className="calendar-title" aria-live="polite">
              {t.form.months[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <button type="button" className="calendar-nav" onClick={() => setCursor(addMonths(cursor, 1))}>
              <span className="visually-hidden">{t.form.monthNext}</span>
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M8 4 L14 10 L8 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>

          <div className="calendar-weekdays" aria-hidden="true">
            {t.form.weekdays.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div
            ref={gridRef}
            className="calendar-grid"
            role="grid"
            aria-label={t.form.calendarLabel}
            onKeyDown={onGridKeyDown}
          >
            {cells.map((day, i) => {
              if (!day) return <span key={`pad-${i}`} className="calendar-cell calendar-pad" role="presentation" />
              const past = day < today
              const isSelected = value === toISO(day)
              const isFocus = toISO(day) === toISO(focusDay)
              return (
                <button
                  key={toISO(day)}
                  type="button"
                  role="gridcell"
                  className="calendar-cell"
                  tabIndex={isFocus ? 0 : -1}
                  data-focus={isFocus ? 'true' : undefined}
                  data-selected={isSelected ? 'true' : undefined}
                  data-today={toISO(day) === toISO(today) ? 'true' : undefined}
                  disabled={past}
                  aria-disabled={past}
                  aria-selected={isSelected}
                  aria-label={`${day.getDate()} ${t.form.months[day.getMonth()]} ${day.getFullYear()}, ${t.form.weekdaysLong[mondayIndex(day)]}`}
                  onClick={() => pick(day)}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      </Floating>

      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export function formatDate(d: Date, t: Dictionary): string {
  return `${d.getDate()} ${t.form.months[d.getMonth()]} ${d.getFullYear()}`
}
