'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Floating } from '@/components/form/Floating'
import { useOverlayLock } from '@/components/system/SiteProvider'

export type SelectOption = { value: string; label: string }

/**
 * A real ARIA listbox, not a styled native <select>.
 *
 * Implemented behaviour: Arrow keys move the active option, Home and End jump
 * to the ends, printable characters do type-ahead with a 600ms buffer, Enter
 * and Space commit, Escape closes without committing, Tab closes, and focus
 * always returns to the trigger. The panel is portalled so it cannot be
 * clipped by a parent.
 */
export function CustomSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
  name,
  error,
  errorId,
  required,
}: {
  label: string
  placeholder: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  name: string
  error?: string
  errorId?: string
  required?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLUListElement | null>(null)
  const typeaheadRef = useRef({ buffer: '', at: 0 })
  const baseId = useId()
  const listId = `${baseId}-list`
  const labelId = `${baseId}-label`

  useOverlayLock(`select-${baseId}`, open)

  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false)
      setActiveIndex(-1)
      if (restoreFocus) triggerRef.current?.focus({ preventScroll: true })
    },
    [],
  )

  const openList = useCallback(
    (startAt?: number) => {
      setOpen(true)
      setActiveIndex(startAt ?? (selectedIndex >= 0 ? selectedIndex : 0))
    },
    [selectedIndex],
  )

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
      if (!option) return
      onChange(option.value)
      close()
    },
    [options, onChange, close],
  )

  // Close on an outside pointer press.
  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (listRef.current?.closest('.floating')?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, close])

  // Keep the active option in view inside the scrolling list.
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  function typeahead(char: string) {
    const now = Date.now()
    const state = typeaheadRef.current
    state.buffer = now - state.at > 600 ? char : state.buffer + char
    state.at = now
    const query = state.buffer.toLowerCase()
    const from = open ? activeIndex : selectedIndex
    const ordered = [...options.slice(from + 1), ...options.slice(0, from + 1)]
    const hit = ordered.find((o) => o.label.toLowerCase().startsWith(query))
    if (!hit) return
    const index = options.indexOf(hit)
    if (open) setActiveIndex(index)
    else onChange(hit.value)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const { key } = event

    if (!open) {
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        event.preventDefault()
        openList(key === 'ArrowUp' ? Math.max(0, options.length - 1) : undefined)
        return
      }
      if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        typeahead(key)
      }
      return
    }

    switch (key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => (i + 1) % options.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => (i - 1 + options.length) % options.length)
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        close(false)
        break
      default:
        if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault()
          typeahead(key)
        }
    }
  }

  return (
    <div className="field">
      <span className="field-label" id={labelId}>
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className="control select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${baseId}-value`}
        aria-required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? `${baseId}-opt-${activeIndex}` : undefined}
        data-placeholder={selected ? undefined : 'true'}
        data-invalid={error ? 'true' : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <span id={`${baseId}-value`}>{selected ? selected.label : placeholder}</span>
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false" data-open={open}>
          <path d="M5 8 L10 13 L15 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <input type="hidden" name={name} value={value} />

      <Floating anchorRef={triggerRef} open={open} minWidth={200}>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${baseId}-opt-${index}`}
              role="option"
              aria-selected={option.value === value}
              className="listbox-option"
              data-active={index === activeIndex}
              onPointerDown={(e) => {
                e.preventDefault()
                commit(index)
              }}
              onPointerEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Floating>

      {error && (
        <p className="field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
