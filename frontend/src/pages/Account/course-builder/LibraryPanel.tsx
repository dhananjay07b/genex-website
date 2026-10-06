import { useState } from 'react'
import { Link } from 'react-router-dom'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import type { CourseItemKind, CourseTarget } from '@/types/learning'
import { BuilderCard } from './parts'
import { LIMITS, allLessons, keyOf, lessonDetail, type Draft } from './draft'

type Patch = (next: Partial<Draft>) => void

/**
 * The author's own published content, ready to add as lessons: a Professional's
 * videos and blog posts, or the company's GeAcademy articles, research,
 * whitepapers and podcasts.
 */
export function LibraryPanel({ draft, patch, library, isCompany }: {
  draft: Draft
  patch: Patch
  library: CourseTarget[] | null
  isCompany: boolean
}) {
  const [kind, setKind] = useState<CourseItemKind | 'all'>('all')
  const [query, setQuery] = useState('')
  // Where new lessons go: a module index, or -1 for "Not in a module". Defaults to the last module.
  const [target, setTarget] = useState<number | null>(null)

  const chosen = new Set(allLessons(draft).map(keyOf))
  const full = chosen.size >= LIMITS.items
  const kinds = [...new Set((library ?? []).map(t => t.kind))]
  const q = query.trim().toLowerCase()
  const available = (library ?? []).filter(t =>
    !chosen.has(keyOf(t)) && (kind === 'all' || t.kind === kind) && (!q || t.title.toLowerCase().includes(q)))
  const dest = target === null ? draft.modules.length - 1 : Math.min(target, draft.modules.length - 1)

  const add = (item: CourseTarget) => {
    if (full) return
    if (dest >= 0) patch({ modules: draft.modules.map((m, i) => (i === dest ? { ...m, items: [...m.items, item] } : m)) })
    else patch({ loose: [...draft.loose, item] })
  }

  return (
    <BuilderCard n={4} title={isCompany ? "Your company's published content" : 'Your library'}
      hint={isCompany ? 'GeAcademy articles, research, whitepapers and podcasts' : 'Your published videos and blog posts'}>
      {library === null ? (
        <div className="min-h-20" />
      ) : library.length === 0 ? (
        isCompany ? (
          <p className="text-sm text-text-muted">
            Company courses are built from your published GeAcademy articles, research, whitepapers and podcasts.{' '}
            <Link to="/studio" className="text-primary font-semibold hover:underline">Publish something in Company Studio</Link> first.
          </p>
        ) : (
          <p className="text-sm text-text-muted">
            Courses are built from your published videos and posts. <Link to="/submit-post" className="text-primary font-semibold hover:underline">Submit a post</Link> or{' '}
            <Link to="/submit-video" className="text-primary font-semibold hover:underline">a video</Link> first.
          </p>
        )
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Content type">
            {(['all', ...kinds] as const).map(k => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${kind === k ? 'bg-text-primary text-white border-text-primary' : 'bg-white text-text-primary border-border hover:border-primary'}`}>
                {k === 'all' ? 'All' : COURSE_ITEM_KINDS[k].label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 flex-1 min-w-48 max-w-sm">
              <SearchIcon sx={{ fontSize: 18 }} className="text-text-muted" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your content" aria-label="Search your content"
                className="flex-1 min-w-0 border-0 outline-none text-sm bg-transparent" />
            </label>
            {draft.modules.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                Add to
                <select value={dest} onChange={e => setTarget(Number(e.target.value))}
                  className="rounded-md border border-border bg-white px-2 py-1 text-xs font-semibold max-w-48">
                  {draft.modules.map((m, i) => <option key={m.key} value={i}>Module {i + 1}{m.title ? `: ${m.title}` : ''}</option>)}
                  <option value={-1}>Not in a module</option>
                </select>
              </label>
            )}
          </div>
          {available.length === 0 ? (
            <p className="text-sm text-text-muted">{q || kind !== 'all' ? 'Nothing matches.' : 'Everything in your library is already in this course.'}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {available.map(item => {
                const { icon: Icon, label } = COURSE_ITEM_KINDS[item.kind]
                return (
                  <li key={keyOf(item)}>
                    <button type="button" disabled={full} onClick={() => add(item)}
                      className="w-full flex items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-left hover:border-primary hover:bg-sky-50 transition-colors disabled:opacity-50">
                      <Icon sx={{ fontSize: 19 }} className="text-sky-700 shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-text-primary truncate">{item.title}</span>
                        <span className="block text-xs text-text-muted truncate">{lessonDetail(item, label)}</span>
                      </span>
                      <AccessBadge access={item.access} price={item.price} currency={item.currency} />
                      <AddCircleOutlineIcon sx={{ fontSize: 20 }} className="text-primary shrink-0" aria-label="Add" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="flex gap-2 text-xs text-text-muted">
            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} className="text-primary shrink-0 mt-px" />
            Each lesson keeps its own access. Lessons marked Free show a Preview link on the course page, so visitors can try the course.
          </p>
        </>
      )}
    </BuilderCard>
  )
}
