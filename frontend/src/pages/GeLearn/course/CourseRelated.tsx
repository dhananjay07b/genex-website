import { useEffect, useState } from 'react'
import { LearnCard } from '@/components/gelearn/discovery/LearnCard'
import { SeeAllLink } from '@/components/gelearn/discovery/SectionHeading'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import type { CourseRelatedTab } from '@/types/learning'

const SEE_ALL: Record<CourseRelatedTab['key'], (slug: string) => string> = {
  topic: slug => `/topics/${slug}`,
  role: slug => `/roles/${slug}`,
  publisher: () => '/courses',
}

/** "Explore more courses": tabs for the same topic, role and publisher. Hidden when there's nothing to show. */
export function CourseRelated({ slug, onEmpty }: { slug: string; onEmpty: () => void }) {
  const [tabs, setTabs] = useState<CourseRelatedTab[] | null>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let cancelled = false
    apiFetch<CourseRelatedTab[]>(`/api/learning/courses/${slug}/related/`)
      .then(rows => { if (!cancelled) { setTabs(rows); if (!rows.length) onEmpty() } })
      .catch(() => { if (!cancelled) { setTabs([]); onEmpty() } })
    return () => { cancelled = true }
  }, [slug, onEmpty])

  if (!tabs?.length) return null
  const tab = tabs[Math.min(active, tabs.length - 1)]
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl font-extrabold text-text-primary lg:text-2xl">Explore more courses</h2>
        {tab.key !== 'publisher' && <SeeAllLink href={SEE_ALL[tab.key](tab.slug)}>{tab.key === 'topic' ? 'All courses on this topic' : 'See the full path'}</SeeAllLink>}
      </div>
      {tabs.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Related courses">
          {tabs.map((t, i) => (
            <button key={t.key} type="button" role="tab" aria-selected={i === active} onClick={() => setActive(i)}
              className={cn('rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors',
                i === active ? 'border-text-primary bg-text-primary text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-primary')}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" role="tabpanel">
        {tab.courses.map(card => <LearnCard key={card.id} card={card} />)}
      </div>
    </div>
  )
}
