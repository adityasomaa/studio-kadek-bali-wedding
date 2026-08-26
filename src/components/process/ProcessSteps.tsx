'use client'

import { processSteps, vendorCategories } from '@/config/site.data'
import { getDictionary } from '@/i18n/dictionaries'
import { useCurrentPage } from '@/lib/useCurrentPage'
import { Reveal } from '@/components/system/Reveal'

/**
 * The numbered process.
 *
 * This is the page that does the most work on a first-time couple: it removes
 * the "I do not even know what happens next" problem. Each step says what
 * happens and what you are holding by the end of it, so the sequence is
 * checkable rather than reassuring noise.
 */
export function ProcessSteps({ compact = false }: { compact?: boolean }) {
  const { locale } = useCurrentPage()
  const t = getDictionary(locale)
  const steps = compact ? processSteps.slice(0, 3) : processSteps

  return (
    <ol className={compact ? 'process-list process-list-compact' : 'process-list'}>
      {steps.map((step, i) => (
        <li key={step.key}>
          <Reveal delay={i * 70}>
            <article className="process-step">
              <p className="process-number" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </p>
              <div className="process-body">
                <h3 className="headline-sm">
                  <span className="visually-hidden">
                    {t.common.stepLabel} {i + 1}:{' '}
                  </span>
                  {step.title[locale]}
                </h3>
                <p className="prose-body mt-3">
                  <span className="block">{step.body[locale]}</span>
                </p>
              </div>
              {/* A sibling of .process-body, not a child: on desktop it is the
                  third column of the step grid, and a nested element could not
                  be placed there. */}
              {!compact && (
                <p className="process-output">
                  <span className="process-output-label">{t.common.outputLabel}</span>
                  {step.output[locale]}
                </p>
              )}
            </article>
          </Reveal>
        </li>
      ))}
    </ol>
  )
}

/** Vendor categories only. No company names are published anywhere on this site. */
export function VendorCategories() {
  const { locale } = useCurrentPage()
  return (
    <ul className="vendor-grid">
      {vendorCategories.map((cat, i) => (
        <li key={cat.en}>
          <Reveal delay={i * 55}>
            <span className="vendor-chip">{cat[locale]}</span>
          </Reveal>
        </li>
      ))}
    </ul>
  )
}
