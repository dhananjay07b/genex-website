import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { cn, isExternalHref } from '@/lib/utils'

export interface BandTab {
  key: string
  label: string
  content: ReactNode
}

interface TabbedBandProps {
  heading: string
  body?: string
  ctaLabel?: string
  ctaUrl?: string
  tabs: BandTab[]
  /** Background: pale blue-grey or pale blue. */
  tone?: 'slate' | 'sky'
}

/**
 * A coloured band: intro text and a button on the left, tabs with a card grid
 * on the right ("Skills for the role…", "More than courses"). Arrow keys move
 * between tabs. With a single tab the tab row is hidden: a plain band.
 */
export function TabbedBand({ heading, body, ctaLabel, ctaUrl, tabs, tone = 'slate' }: TabbedBandProps) {
  const [active, setActive] = useState(0)
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const current = tabs[Math.min(active, tabs.length - 1)]

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const next = (active + delta + tabs.length) % tabs.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      className={cn(
        'relative grid gap-5 overflow-hidden rounded-2xl border p-5 lg:grid-cols-4 lg:items-center lg:gap-7 lg:p-7',
        tone === 'slate' ? 'border-slate-200 bg-slate-100' : 'border-sky-100 bg-surface',
      )}
    >
      <span className="absolute inset-x-0 top-0 h-1 gradient-brand" aria-hidden="true" />
      <div className="flex flex-col items-start gap-3">
        <h2 className="text-balance text-2xl font-extrabold text-text-primary">{heading}</h2>
        {body && <p className="text-sm text-slate-700">{body}</p>}
        {ctaLabel && ctaUrl && <BandLink href={ctaUrl}>{ctaLabel}</BandLink>}
      </div>
      <div className="min-w-0 lg:col-span-3">
        {tabs.length > 1 && (
        <div role="tablist" aria-label={heading} onKeyDown={onKeyDown} className="mb-4 flex flex-wrap gap-2">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              ref={el => { tabRefs.current[i] = el }}
              id={`${baseId}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${baseId}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                i === active
                  ? 'border-text-primary bg-text-primary text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-text-primary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )}
        {current && (
          <div id={`${baseId}-panel`} role={tabs.length > 1 ? 'tabpanel' : undefined} aria-labelledby={tabs.length > 1 ? `${baseId}-tab-${active}` : undefined}>
            {current.content}
          </div>
        )}
      </div>
    </div>
  )
}

function BandLink({ href, children }: { href: string; children: ReactNode }) {
  const classes = 'inline-flex items-center gap-1.5 rounded-lg gradient-brand px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90'
  const content = <>{children} <ArrowForwardIcon sx={{ fontSize: 16 }} /></>
  return isExternalHref(href)
    ? <a href={href} className={classes}>{content}</a>
    : <Link to={href} className={classes}>{content}</Link>
}
