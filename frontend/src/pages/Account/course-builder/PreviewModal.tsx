import { useEffect, useMemo, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import { getMediaUrl } from '@/lib/utils'
import type { CourseTarget } from '@/types/learning'
import { allLessons, formatMinutes, keyOf, lessonDetail, totalMinutes, type Draft } from './draft'

const LEVEL_LABEL: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

function Lessons({ items }: { items: CourseTarget[] }) {
  return (
    <ol className="divide-y divide-border">
      {items.map(item => {
        const { icon: Icon, label } = COURSE_ITEM_KINDS[item.kind]
        return (
          <li key={keyOf(item)} className="flex items-center gap-3 px-4 py-2.5">
            <Icon sx={{ fontSize: 18 }} className="text-sky-700 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary truncate">{item.title}</span>
              <span className="block text-xs text-text-muted truncate">{lessonDetail(item, label)}</span>
            </span>
            {item.access === 'free'
              ? <span className="text-xs font-bold text-primary">Preview</span>
              : <LockOutlinedIcon sx={{ fontSize: 16 }} className="text-text-muted" aria-label="Locked for visitors" />}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * How the course page will read, drawn from the builder's current (even unsaved)
 * content. It never creates a link: a course that isn't live has no public page.
 */
export function PreviewModal({ draft, coverUrl, publisher, onClose }: {
  draft: Draft
  /** Saved cover URL, or a local object URL for a newly picked file. */
  coverUrl: string | null
  publisher: string
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const lessons = allLessons(draft)
  const total = totalMinutes(lessons)
  const outcomes = draft.outcomes.filter(o => o.trim())
  const prerequisites = draft.prerequisites.filter(p => p.trim())
  const faqs = draft.faqs.filter(f => f.question.trim() && f.answer.trim())
  const cover = useMemo(() => (coverUrl && !coverUrl.startsWith('blob:') ? getMediaUrl(coverUrl) : coverUrl), [coverUrl])

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg/45 flex items-start justify-center p-4 overflow-y-auto" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div role="dialog" aria-modal="true" aria-labelledby="cb-preview-title" className="w-full max-w-4xl my-6 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border bg-amber-50">
          <p className="text-sm font-semibold text-amber-900">Preview of your current edits. Only you can see it; nothing is published.</p>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close preview"
            className="size-9 rounded-lg flex items-center justify-center text-text-primary hover:bg-amber-100 shrink-0">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="bg-brand-tint px-6 py-8 grid gap-6 md:grid-cols-5 items-center">
          <div className="md:col-span-3 flex flex-col gap-3 min-w-0">
            <p className="text-sm font-bold text-text-primary">{publisher}</p>
            <h2 id="cb-preview-title" className="text-3xl font-extrabold text-text-primary leading-tight">{draft.title.trim() || 'Untitled course'}</h2>
            {draft.summary.trim() && <p className="text-base text-text-muted">{draft.summary}</p>}
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {draft.level && <span className="rounded border border-border bg-white px-1.5 py-0.5 font-bold text-text-primary">{LEVEL_LABEL[draft.level]}</span>}
              <AccessBadge access={draft.access} price={draft.access === 'paid' ? draft.price : null} currency="INR" />
              <span>{draft.language}</span>
            </div>
          </div>
          <div className="md:col-span-2 rounded-xl border border-border bg-white overflow-hidden">
            <div className="aspect-video bg-surface flex items-center justify-center">
              {cover ? <img src={cover} alt="" className="w-full h-full object-cover" /> : <SchoolOutlinedIcon sx={{ fontSize: 40 }} className="text-primary/40" />}
            </div>
            <dl className="divide-y divide-border text-sm">
              <div className="flex justify-between gap-3 px-4 py-2.5"><dt className="text-text-muted">Content</dt><dd className="font-bold text-text-primary text-right">
                {draft.modules.length ? `${draft.modules.length} modules, ` : ''}{lessons.length} lessons</dd></div>
              {total > 0 && <div className="flex justify-between gap-3 px-4 py-2.5"><dt className="text-text-muted">Time</dt><dd className="font-bold text-text-primary">About {formatMinutes(total)}</dd></div>}
              {prerequisites[0] && <div className="flex justify-between gap-3 px-4 py-2.5"><dt className="text-text-muted">Before you start</dt><dd className="font-bold text-text-primary text-right">{prerequisites[0]}</dd></div>}
            </dl>
          </div>
        </div>

        <div className="px-6 py-6 flex flex-col gap-7">
          {outcomes.length > 0 && (
            <section>
              <h3 className="text-lg font-extrabold text-text-primary mb-3">What you&apos;ll learn</h3>
              <ul className="grid gap-2.5 sm:grid-cols-2 rounded-xl border border-border p-4">
                {outcomes.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-primary"><CheckIcon sx={{ fontSize: 18 }} className="text-emerald-700 shrink-0" />{o}</li>
                ))}
              </ul>
            </section>
          )}

          {draft.description.trim() && (
            <section>
              <h3 className="text-lg font-extrabold text-text-primary mb-2">About this course</h3>
              <p className="text-sm text-text-muted whitespace-pre-line">{draft.description}</p>
            </section>
          )}

          <section>
            <h3 className="text-lg font-extrabold text-text-primary mb-3">
              {draft.modules.length ? `There ${draft.modules.length === 1 ? 'is 1 module' : `are ${draft.modules.length} modules`} in this course` : 'Lessons'}
            </h3>
            {lessons.length === 0 ? (
              <p className="text-sm text-text-muted">No lessons yet.</p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
                {draft.modules.map((m, i) => (
                  <div key={m.key}>
                    <div className="px-4 py-3 bg-surface">
                      <p className="text-sm font-bold text-text-primary">{m.title.trim() || `Module ${i + 1}`}</p>
                      <p className="text-xs text-text-muted">Module {i + 1} · {m.items.length} lessons{totalMinutes(m.items) ? ` · ${formatMinutes(totalMinutes(m.items))}` : ''}</p>
                      {m.summary.trim() && <p className="text-xs text-text-muted mt-1">{m.summary}</p>}
                    </div>
                    {m.items.length > 0 && <Lessons items={m.items} />}
                  </div>
                ))}
                {draft.loose.length > 0 && <Lessons items={draft.loose} />}
              </div>
            )}
          </section>

          {faqs.length > 0 && (
            <section>
              <h3 className="text-lg font-extrabold text-text-primary mb-2">Frequently asked questions</h3>
              <div className="divide-y divide-border border-y border-border">
                {faqs.map((f, i) => (
                  <details key={i} className="py-3">
                    <summary className="cursor-pointer text-sm font-bold text-text-primary">{f.question}</summary>
                    <p className="text-sm text-text-muted mt-2">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
          <p className="text-xs text-text-muted">Reviews, ratings, the career path and related courses fill in on the live page once the course is published.</p>
        </div>
      </div>
    </div>
  )
}
