import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import { cn } from '@/lib/utils'
import type { CourseTarget, ReadingKind } from '@/types/learning'
import { RowControls } from './parts'
import { LIMITS, keyOf, lessonDetail, move, type Draft } from './draft'

type Patch = (next: Partial<Draft>) => void

function ReadingRow({ item, children }: { item: CourseTarget; children: ReactNode }) {
  const { icon: Icon, label } = COURSE_ITEM_KINDS[item.kind]
  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2.5">
      <span className="size-9 shrink-0 rounded-lg border border-border bg-surface text-sky-700 flex items-center justify-center"><Icon sx={{ fontSize: 19 }} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-text-primary truncate">{item.title}</span>
        <span className="block text-xs text-text-muted truncate">{lessonDetail(item, label)}</span>
      </span>
      <AccessBadge access={item.access} price={item.price} currency={item.currency} />
      {children}
    </li>
  )
}

/**
 * Step 3 of the builder (optional): the author's published content as extra
 * reading after the lessons. It never counts toward completion or the
 * certificate, and changes go live straight away (the content is already reviewed).
 */
export function FurtherReadingStep({ draft, patch, library, isCompany, live }: {
  draft: Draft
  patch: Patch
  /** The author's published content; null while loading. */
  library: CourseTarget[] | null
  isCompany: boolean
  live: boolean
}) {
  const [kind, setKind] = useState<ReadingKind | 'all'>('all')
  const [query, setQuery] = useState('')
  const { reading } = draft
  const chosen = new Set(reading.map(keyOf))
  const full = reading.length >= LIMITS.reading
  const kinds = [...new Set((library ?? []).map(t => t.kind as ReadingKind))]
  const q = query.trim().toLowerCase()
  const available = (library ?? []).filter(t =>
    !chosen.has(keyOf(t)) && (kind === 'all' || t.kind === kind) && (!q || t.title.toLowerCase().includes(q)))

  return (
    <div className="flex flex-col gap-4">
      <p className="flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-text-muted">
        <InfoOutlinedIcon sx={{ fontSize: 19 }} className="text-primary shrink-0 mt-px" />
        <span>
          <b className="text-text-primary">Optional.</b> Point learners to your published content for extra reading. It shows after the
          lessons, and it doesn&apos;t count toward completing the course or the certificate.
          {live && ' Changes here go live as soon as you save, without review.'}
        </span>
      </p>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <section className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 min-w-0">
          <header>
            <h3 className="text-base font-extrabold text-text-primary">
              In this course <span className="text-xs font-semibold text-text-muted tabular-nums">{reading.length}/{LIMITS.reading}</span>
            </h3>
            <p className="text-xs text-text-muted">Learners see them in this order.</p>
          </header>
          {reading.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-text-muted">
              Nothing yet. Add items from your published content.
            </p>
          ) : (
            <ol className="flex flex-col gap-2">
              {reading.map((item, i) => (
                <ReadingRow key={keyOf(item)} item={item}>
                  <RowControls label={item.title} index={i} count={reading.length}
                    onMove={(from, to) => patch({ reading: move(reading, from, to) })}
                    onRemove={() => patch({ reading: reading.filter((_, j) => j !== i) })} />
                </ReadingRow>
              ))}
            </ol>
          )}
        </section>

        <section className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-3 min-w-0">
          <header>
            <h3 className="text-base font-extrabold text-text-primary">{isCompany ? "Your company's published content" : 'Your published content'}</h3>
            <p className="text-xs text-text-muted">{isCompany ? 'GeAcademy, research, whitepapers, podcasts and videos' : 'Videos and blog posts'}</p>
          </header>
          {library === null ? (
            <div className="min-h-20" />
          ) : library.length === 0 ? (
            isCompany ? (
              <p className="text-sm text-text-muted">
                Nothing published yet. Content your company publishes in{' '}
                <Link to="/studio" className="text-primary font-semibold hover:underline">Company Studio</Link> shows here.
              </p>
            ) : (
              <p className="text-sm text-text-muted">
                Nothing published yet. Your videos and posts show here once they&apos;re published:{' '}
                <Link to="/submit-post" className="text-primary font-semibold hover:underline">submit a post</Link> or{' '}
                <Link to="/submit-video" className="text-primary font-semibold hover:underline">a video</Link>.
              </p>
            )
          ) : (
            <>
              {kinds.length > 1 && (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Content type">
                  {(['all', ...kinds] as const).map(k => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
                      className={cn('rounded-full border px-3 py-1 text-xs font-bold transition-colors',
                        kind === k ? 'bg-text-primary text-white border-text-primary' : 'bg-white text-text-primary border-border hover:border-primary')}>
                      {k === 'all' ? 'All' : COURSE_ITEM_KINDS[k].label}
                    </button>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
                <SearchIcon sx={{ fontSize: 18 }} className="text-text-muted" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your content" aria-label="Search your content"
                  className="flex-1 min-w-0 border-0 outline-none text-sm bg-transparent" />
              </label>
              {available.length === 0 ? (
                <p className="text-sm text-text-muted">{q || kind !== 'all' ? 'Nothing matches.' : 'Everything you’ve published is already here.'}</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {available.map(item => (
                    <ReadingRow key={keyOf(item)} item={item}>
                      <button type="button" disabled={full} onClick={() => patch({ reading: [...reading, item] })}
                        aria-label={`Add ${item.title}`}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-bold text-primary hover:border-primary disabled:opacity-40">
                        <AddIcon sx={{ fontSize: 15 }} /> Add
                      </button>
                    </ReadingRow>
                  ))}
                </ul>
              )}
              {full && <p className="text-xs font-semibold text-amber-800">Further reading holds up to {LIMITS.reading} items.</p>}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
