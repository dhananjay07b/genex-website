import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import CloseIcon from '@mui/icons-material/Close'
import TuneIcon from '@mui/icons-material/Tune'
import { PageMeta } from '@/components/seo/PageMeta'
import { LearnCard } from '@/components/gelearn/discovery/LearnCard'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import type { DiscoveryCard, DiscoveryType, SearchFacet, SearchResponse } from '@/types/discovery'

const PAGE_SIZE = 24
const FILTER_GROUPS: { facet: SearchFacet; legend: string }[] = [
  { facet: 'topic', legend: 'Topic' },
  { facet: 'level', legend: 'Level' },
  { facet: 'access', legend: 'Access' },
  { facet: 'max_minutes', legend: 'Length (videos and podcasts)' },
  { facet: 'publisher', legend: 'Published by' },
]
const TABS: (DiscoveryType | '')[] = ['', 'course', 'geacademy', 'research', 'whitepaper', 'video', 'podcast', 'blog', 'tender']
const PARAMS = ['q', 'type', 'topic', 'level', 'access', 'max_minutes', 'publisher', 'sort'] as const
const TAB_LABELS: Record<DiscoveryType, string> = {
  course: 'Courses', geacademy: 'GeAcademy', research: 'Research', whitepaper: 'Whitepapers',
  video: 'Videos', podcast: 'Podcasts', blog: 'Blog', tender: 'Policies & Tenders',
}

/** The query string this page sends to the API: only known, non-empty filters, in a fixed order. */
function apiQuery(params: URLSearchParams) {
  const out = new URLSearchParams()
  for (const name of PARAMS) {
    const value = params.get(name)
    if (value) out.set(name, value)
  }
  return out.toString()
}

/**
 * GeLearn search and catalogue (/search). Coursera-style: content-type tabs,
 * a filter sidebar whose counts reflect the other filters, removable filter
 * chips, sort, and a results grid with "Show more".
 */
export default function SearchPage() {
  const [params, setParams] = useSearchParams()
  const query = apiQuery(params)
  const { data, loading } = useApi<SearchResponse>(`/api/discovery/search/?${query}${query ? '&' : ''}limit=${PAGE_SIZE}`)
  const trending = useApi<string[]>('/api/discovery/search/trending/')
  const [more, setMore] = useState<{ query: string; items: DiscoveryCard[] }>({ query: '', items: [] })
  const [loadingMore, setLoadingMore] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = params.get('q') ?? ''
  const extra = more.query === query ? more.items : []
  const results = data ? [...data.results, ...extra] : []

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next)
  }

  async function showMore() {
    setLoadingMore(true)
    try {
      const page = await apiFetch<SearchResponse>(`/api/discovery/search/?${query}${query ? '&' : ''}limit=${PAGE_SIZE}&offset=${results.length}`)
      setMore({ query, items: [...extra, ...page.results] })
    } finally {
      setLoadingMore(false)
    }
  }

  const active = data
    ? FILTER_GROUPS.flatMap(({ facet }) => {
        const value = params.get(facet)
        if (!value) return []
        const option = data.facets[facet].find(o => o.value === value)
        return [{ facet, label: option?.label ?? value }]
      })
    : []

  return (
    <div className="bg-white pt-16">
      <PageMeta
        title={q ? `${q}: GeLearn search` : 'Browse the catalogue: GeLearn'}
        description="Search courses, GeAcademy articles, research, whitepapers, videos and podcasts on power, energy and automation."
        canonical="/search"
      />
      <div className="mx-auto max-w-330 px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3 pt-6 pb-3">
          <div>
            <h1 className="text-2xl font-extrabold text-text-primary">{q ? <>Results for “{q}”</> : 'Browse the catalogue'}</h1>
            <p className="text-sm text-text-muted">
              {data ? `${data.total} result${data.total === 1 ? '' : 's'} across courses, articles, research, videos and podcasts` : ' '}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700" htmlFor="search-sort">
            Sort by
            <select
              id="search-sort"
              value={params.get('sort') ?? 'best'}
              onChange={e => update({ sort: e.target.value === 'best' ? null : e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
            >
              <option value="best">Best match</option>
              <option value="newest">Newest</option>
              <option value="popular">Most enrolled</option>
              <option value="rated">Highest rated</option>
            </select>
          </label>
        </div>

        <div role="tablist" aria-label="Content type" className="scrollbar-hidden mb-5 flex gap-1 overflow-x-auto border-b border-border">
          {TABS.filter(t => !t || (data?.counts[t] ?? 0) > 0 || params.get('type') === t).map(t => {
            const selected = (params.get('type') ?? '') === t
            const count = t ? data?.counts[t] ?? 0 : data?.total ?? 0
            return (
              <button
                key={t || 'all'}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => update({ type: t || null })}
                className={cn(
                  'whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-bold transition-colors',
                  selected ? 'border-primary text-text-primary' : 'border-transparent text-slate-700 hover:text-text-primary',
                )}
              >
                {t ? TAB_LABELS[t] : 'All'}
                <span className="ml-1 font-semibold tabular-nums text-text-muted">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="grid gap-6 pb-10 lg:grid-cols-4">
          <aside aria-label="Filters" className="lg:col-span-1">
            <button
              type="button"
              onClick={() => setFiltersOpen(o => !o)}
              aria-expanded={filtersOpen}
              className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-bold lg:hidden"
            >
              <TuneIcon sx={{ fontSize: 18 }} /> Filters{active.length ? ` (${active.length})` : ''}
            </button>
            <div className={cn('grid gap-4', !filtersOpen && 'hidden lg:grid')}>
              {data && FILTER_GROUPS.map(({ facet, legend }) => {
                const options = data.facets[facet].filter(o => o.count > 0 || params.get(facet) === o.value)
                if (!options.length) return null
                return (
                  <fieldset key={facet} className="grid gap-1.5 border-b border-border pb-4">
                    <legend className="mb-2 text-sm font-extrabold text-text-primary">{legend}</legend>
                    {options.map(option => (
                      <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={params.get(facet) === option.value}
                          onChange={e => update({ [facet]: e.target.checked ? option.value : null })}
                          className="size-4 accent-primary"
                        />
                        <span className="min-w-0 flex-1">{option.label}</span>
                        <span className="text-xs tabular-nums text-text-muted">{option.count}</span>
                      </label>
                    ))}
                  </fieldset>
                )
              })}
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-3">
            <div className="mb-3.5 flex min-h-8 flex-wrap items-center gap-2" aria-live="polite">
              {active.map(chip => (
                <button
                  key={chip.facet}
                  type="button"
                  onClick={() => update({ [chip.facet]: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1 text-sm font-semibold text-slate-700 hover:border-primary"
                >
                  {chip.label} <CloseIcon sx={{ fontSize: 16 }} aria-label="Remove filter" />
                </button>
              ))}
              {active.length > 0 && (
                <button type="button" onClick={() => update(Object.fromEntries(FILTER_GROUPS.map(g => [g.facet, null])))} className="text-sm font-bold text-sky-700 hover:text-sky-800">
                  Clear all
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid animate-pulse gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="h-72 rounded-xl bg-slate-100" />)}
              </div>
            ) : results.length ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map(card => <LearnCard key={`${card.type}-${card.id}`} card={card} />)}
                </div>
                {data && results.length < data.count && (
                  <div className="mt-6 flex justify-center">
                    <button type="button" onClick={showMore} disabled={loadingMore}
                      className="rounded-lg border border-sky-700 bg-white px-5 py-2.5 text-sm font-bold text-sky-700 hover:bg-surface disabled:opacity-60">
                      {loadingMore ? 'Loading…' : 'Show more results'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                <p className="text-lg font-bold text-text-primary">No results{q && <> for “{q}”</>}</p>
                <p className="mt-1 text-sm text-text-muted">Try fewer filters or different words, or browse a topic.</p>
                <Link to="/topics" className="mt-3 inline-block text-sm font-bold text-sky-700 hover:text-sky-800">Browse all topics</Link>
              </div>
            )}

            {!!trending.data?.length && (
              <div className="mt-8">
                <h2 className="mb-3 text-base font-extrabold text-text-primary">{q ? 'Related searches' : 'Trending searches'}</h2>
                <div className="flex flex-wrap gap-2">
                  {trending.data.filter(t => t !== q.toLowerCase()).map(t => (
                    <Link key={t} to={`/search?q=${encodeURIComponent(t)}`}
                      className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-primary">
                      {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
