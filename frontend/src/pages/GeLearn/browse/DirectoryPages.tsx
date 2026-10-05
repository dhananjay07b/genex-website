import type { ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageMeta } from '@/components/seo/PageMeta'
import { BrowseHero } from '@/components/gelearn/discovery/BrowseHero'
import { CompanyCard, ProfessionalCard } from '@/components/gelearn/discovery/DirectoryCards'
import { LiveSessionCard } from '@/components/gelearn/discovery/LiveSessionCard'
import { useApi } from '@/hooks/useApi'
import { useExploreMenu } from '@/hooks/useExploreMenu'
import { cn } from '@/lib/utils'
import type { CompanyCardData, LiveSessionCard as LiveSession, ProfessionalCardData } from '@/types/discovery'
import { Section } from '../home/sections'

const FILTER_CHIP = 'rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors'

function PromoBand({ tag, heading, body, linkLabel, linkTo, tone }: {
  tag: string; heading: string; body: string; linkLabel: string; linkTo: string; tone: 'mint' | 'slate'
}) {
  return (
    <Section label={tag}>
      <div className={cn('flex flex-col gap-2 rounded-2xl border p-6', tone === 'mint' ? 'border-emerald-100 bg-surface-alt' : 'border-slate-200 bg-slate-100')}>
        <span className={cn('text-xs font-extrabold uppercase tracking-widest', tone === 'mint' ? 'text-emerald-700' : 'text-sky-700')}>{tag}</span>
        <h2 className="text-lg font-extrabold text-text-primary">{heading}</h2>
        <p className="max-w-xl text-sm text-slate-700">{body}</p>
        <Link to={linkTo} className="mt-1 inline-flex items-center gap-0.5 self-start text-sm font-bold text-sky-700 hover:text-sky-800">
          {linkLabel} <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </Link>
      </div>
    </Section>
  )
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-text-muted">{children}</p>
}

/** /professionals: Leading Professionals, featured first, filterable by area of expertise. */
export function ProfessionalsPage() {
  const [params, setParams] = useSearchParams()
  const topic = params.get('topic')
  const { data } = useApi<ProfessionalCardData[]>(`/api/discovery/professionals/${topic ? `?topic=${encodeURIComponent(topic)}` : ''}`)
  const { topic_groups } = useExploreMenu()
  const topics = topic_groups.flatMap(g => g.topics)

  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title="Leading Professionals: GeLearn" description="Verified engineers publishing courses, videos and field notes on GeLearn." canonical="/professionals" />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Leading Professionals' }]}
        kicker="Our Leading Professionals"
        title="Learn from the engineers who run the plants"
        lead="Professionals are verified against their company email domain and rated by Genex. Featured Professionals come first."
      />
      <Section label="Professionals">
        <div className="scrollbar-hidden mb-5 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by expertise">
          {[{ slug: '', name: 'All' }, ...topics].map(t => {
            const on = (topic ?? '') === t.slug
            return (
              <button key={t.slug || 'all'} type="button" aria-pressed={on}
                onClick={() => setParams(t.slug ? { topic: t.slug } : {})}
                className={cn(FILTER_CHIP, 'shrink-0', on ? 'border-text-primary bg-text-primary text-white' : 'border-border bg-white text-slate-700 hover:border-primary')}>
                {t.name}
              </button>
            )
          })}
        </div>
        {data === null ? (
          <div className="h-60 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        ) : data.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map(p => <ProfessionalCard key={p.username ?? p.display_name} person={p} />)}
          </div>
        ) : (
          <EmptyNote>No Professionals list this area of expertise yet.</EmptyNote>
        )}
      </Section>
      <PromoBand tone="mint" tag="Become a Professional" heading="Working in the sector? Share what you know."
        body="Professionals publish posts, videos and courses under their verified company name."
        linkLabel="How to become a Professional" linkTo="/for-professionals" />
    </div>
  )
}

/** /companies: verified companies and what each has published. */
export function CompaniesPage() {
  const { data } = useApi<CompanyCardData[]>('/api/discovery/companies/')
  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title="Companies on GeLearn" description="Verified companies publishing courses, research and whitepapers on GeLearn." canonical="/companies" />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Companies' }]}
        kicker="Verified companies"
        title="Companies publishing on GeLearn"
        lead="Each company's identity is verified by Genex, and its engineers' work carries the company badge."
      />
      <Section label="Companies">
        {data === null ? (
          <div className="h-60 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        ) : data.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map(c => <CompanyCard key={c.slug} company={c} />)}
          </div>
        ) : (
          <EmptyNote>No companies are listed yet.</EmptyNote>
        )}
      </Section>
      <PromoBand tone="slate" tag="GeLearn for Companies" heading="Want your company listed here?"
        body="Publish courses, research and whitepapers from Company Studio under your verified name."
        linkLabel="See how it works" linkTo="/for-companies" />
    </div>
  )
}

const WHEN = [
  { value: '', label: 'All upcoming' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
] as const

function monthOf(iso: string) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'long', year: 'numeric' }).format(new Date(iso))
}

/** /live-sessions: upcoming webinars, grouped by month. */
export function LiveSessionsPage() {
  const [params, setParams] = useSearchParams()
  const when = params.get('when') ?? ''
  const { data } = useApi<LiveSession[]>(`/api/discovery/live-sessions/${when ? `?when=${when}` : ''}`)
  const months: [string, LiveSession[]][] = []
  for (const session of data ?? []) {
    const month = monthOf(session.starts_at)
    const last = months[months.length - 1]
    if (last && last[0] === month) last[1].push(session)
    else months.push([month, [session]])
  }

  return (
    <div className="bg-white pt-16 pb-8">
      <PageMeta title="Live sessions: GeLearn" description="Upcoming webinars and live demos with engineers from Genex and partner companies." canonical="/live-sessions" />
      <BrowseHero
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Live sessions' }]}
        kicker="Live sessions"
        title="Upcoming webinars and live demos"
        lead="Free sessions with engineers from Genex and partner companies. Registration opens on the host's page, and every time is shown in IST."
      />
      <Section label="Sessions">
        <div role="tablist" aria-label="When" className="scrollbar-hidden mb-5 flex gap-1 overflow-x-auto border-b border-border">
          {WHEN.map(w => (
            <button key={w.value || 'all'} type="button" role="tab" aria-selected={when === w.value}
              onClick={() => setParams(w.value ? { when: w.value } : {})}
              className={cn('whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-bold', when === w.value ? 'border-primary text-text-primary' : 'border-transparent text-slate-700 hover:text-text-primary')}>
              {w.label}
            </button>
          ))}
        </div>
        {data === null ? (
          <div className="h-60 animate-pulse rounded-2xl bg-slate-100" aria-hidden="true" />
        ) : months.length ? (
          months.map(([month, sessions]) => (
            <div key={month} className="mb-7">
              <h2 className="mb-3 flex items-center gap-2.5 text-base font-extrabold text-text-primary after:h-px after:flex-1 after:bg-border">{month}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sessions.map(s => <LiveSessionCard key={s.id} session={s} />)}
              </div>
            </div>
          ))
        ) : (
          <EmptyNote>No sessions are scheduled {when === 'week' ? 'this week' : when === 'month' ? 'this month' : 'yet'}. Check back soon.</EmptyNote>
        )}
      </Section>
      <PromoBand tone="slate" tag="For companies" heading="Want to host a session?"
        body="Companies on GeLearn can list their webinars here, with registration on their own page."
        linkLabel="Talk to Genex" linkTo="/for-companies" />
    </div>
  )
}
