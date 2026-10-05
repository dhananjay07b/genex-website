import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  to?: string
}

export interface Fact {
  label: string
  value: ReactNode
}

interface BrowseHeroProps {
  crumbs: Crumb[]
  kicker?: string | null
  title: string
  lead?: string
  actions?: ReactNode
  factsHeading?: string
  facts?: Fact[]
}

/**
 * The top of GeLearn's browse and landing pages (topic, role, directories,
 * For Professionals / Companies): breadcrumb, kicker, title, lead, buttons,
 * and an optional "At a glance" figures box on the right.
 */
export function BrowseHero({ crumbs, kicker, title, lead, actions, factsHeading, facts }: BrowseHeroProps) {
  const hasFacts = Boolean(facts?.length)
  return (
    <div className="border-b border-border bg-linear-to-b from-surface to-white">
      <div className={cn('mx-auto grid max-w-330 gap-6 px-4 pt-4 pb-8 md:px-6', hasFacts && 'lg:grid-cols-3 lg:items-center')}>
        <div className={cn(hasFacts && 'lg:col-span-2')}>
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs text-text-muted">
            {crumbs.map((crumb, i) => (
              <span key={crumb.label} className="inline-flex items-center gap-1">
                {i > 0 && <ChevronRightIcon sx={{ fontSize: 16 }} aria-hidden="true" />}
                {crumb.to ? <Link to={crumb.to} className="font-semibold text-sky-700 hover:underline">{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </span>
            ))}
          </nav>
          {kicker && <span className="text-xs font-extrabold uppercase tracking-widest text-sky-700">{kicker}</span>}
          <h1 className="mt-1.5 mb-2.5 text-balance text-3xl font-extrabold text-text-primary">{title}</h1>
          {lead && <p className="max-w-2xl text-base text-slate-700">{lead}</p>}
          {actions && <div className="mt-4 flex flex-wrap gap-2.5">{actions}</div>}
        </div>
        {hasFacts && (
          <div className="grid gap-3 rounded-2xl border border-border bg-white p-5">
            {factsHeading && <h2 className="text-xs font-extrabold uppercase tracking-widest text-text-muted">{factsHeading}</h2>}
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {facts!.map(fact => (
                <div key={fact.label} className="contents">
                  <dt className="text-slate-700">{fact.label}</dt>
                  <dd className="text-right font-extrabold tabular-nums text-text-primary">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}
