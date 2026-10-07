import { useState } from 'react'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import VerifiedIcon from '@mui/icons-material/Verified'
import { Button } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'
import { cn, getMediaUrl } from '@/lib/utils'
import type { SnippetListResponse } from '@/types/api'
import type { CourseDetail, CourseReview, MyReviewState } from '@/types/learning'
import { initials, longDate, plural } from './format'

const MAX_LENGTH = 2000
const PAGE_SIZE = 10

type Filter = 'all' | '5' | '4' | 'low' | 'completed'
const FILTERS: { key: Filter; label: string; query: string }[] = [
  { key: 'all', label: 'All', query: '' },
  { key: '5', label: '5 stars', query: 'rating=5' },
  { key: '4', label: '4 stars', query: 'rating=4' },
  { key: 'low', label: '3 stars and below', query: 'rating_max=3' },
  { key: 'completed', label: 'Completed the course', query: 'completed=1' },
]

export function Stars({ value, size = 18, label }: { value: number; size?: number; label?: string }) {
  return (
    <span className="inline-flex text-amber-600" role="img" aria-label={label ?? `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(i => i <= Math.round(value)
        ? <StarIcon key={i} sx={{ fontSize: size }} />
        : <StarBorderIcon key={i} sx={{ fontSize: size }} />)}
    </span>
  )
}

function ReviewCard({ review }: { review: CourseReview }) {
  const { author } = review
  return (
    <article className="rounded-xl border border-border bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center gap-3">
        {author.avatar_url
          ? <img src={getMediaUrl(author.avatar_url)} alt="" className="size-10 rounded-full object-cover" />
          : <span className="size-10 rounded-full border border-sky-200 bg-brand-tint text-sm font-extrabold text-sky-700 flex items-center justify-center">{initials(author.display_name)}</span>}
        <div className="min-w-0">
          <p className="text-sm font-bold text-text-primary">{author.display_name}{review.is_mine && <span className="font-normal text-text-muted"> (you)</span>}</p>
          <p className="flex flex-wrap items-center gap-1 text-xs text-text-muted">
            {[author.role_title, author.company?.name].filter(Boolean).join(' · ')}
            {author.company?.verified && <VerifiedIcon sx={{ fontSize: 13 }} className="text-primary" titleAccess="Verified company" />}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted">
        <Stars value={review.rating} size={16} />
        <span>Reviewed {longDate(review.created_at)}</span>
        {review.completed_course && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
            <TaskAltIcon sx={{ fontSize: 13 }} /> Completed the course
          </span>
        )}
      </div>
      {review.body && <p className="text-sm text-slate-700 whitespace-pre-line">{review.body}</p>}
    </article>
  )
}

function WriteReview({ slug, state, onSaved }: { slug: string; state: MyReviewState; onSaved: () => void }) {
  const existing = state.review
  const [rating, setRating] = useState(existing?.rating ?? 0)
  const [body, setBody] = useState(existing?.body ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(!existing)

  async function save() {
    if (!rating) { setError('Choose a rating from 1 to 5 stars.'); return }
    setSaving(true)
    setError('')
    try {
      await apiFetch(`/api/learning/courses/${slug}/reviews/me/`, { method: 'PUT', body: { rating, body } })
      setEditing(false)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save your review. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    setSaving(true)
    try {
      await apiFetch(`/api/learning/courses/${slug}/reviews/me/`, { method: 'DELETE' })
      setRating(0)
      setBody('')
      setEditing(true)
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  if (existing && !editing) {
    return (
      <div className="rounded-xl border border-sky-200 bg-brand-tint p-4 flex flex-col gap-2">
        <p className="text-sm font-extrabold text-text-primary">Your review</p>
        {existing.status === 'hidden' && <p className="text-xs font-semibold text-amber-800">Hidden by Genex: it isn&apos;t shown to other learners.</p>}
        <Stars value={existing.rating} />
        {existing.body && <p className="text-sm text-slate-700 whitespace-pre-line">{existing.body}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={remove} disabled={saving}>Delete</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-brand-tint p-4 flex flex-col gap-2.5">
      <p className="text-sm font-extrabold text-text-primary">{existing ? 'Edit your review' : 'How was this course?'}</p>
      <div className="flex gap-0.5" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map(i => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={plural(i, 'star')}
            onClick={() => setRating(i)} className="p-0.5 text-amber-600 hover:scale-110 transition-transform">
            {i <= rating ? <StarIcon sx={{ fontSize: 30 }} /> : <StarBorderIcon sx={{ fontSize: 30 }} />}
          </button>
        ))}
      </div>
      <label htmlFor="cp-review-text" className="text-xs text-text-muted">Tell other engineers what you got from it (optional)</label>
      <textarea id="cp-review-text" value={body} onChange={e => setBody(e.target.value)} maxLength={MAX_LENGTH} rows={3}
        placeholder="What did you apply on site? What could be better?"
        className="w-full resize-y rounded-md border border-border bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-muted">Shown with your name, role and verified company. You can edit or delete it later.</p>
        <div className="flex gap-2">
          {existing && <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>}
          <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : existing ? 'Update review' : 'Post review'}</Button>
        </div>
      </div>
      {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  )
}

/** Rating summary, filters, review list and (for eligible learners) the write/edit form. */
export function CourseReviews({ course, signedIn, onChanged }: { course: CourseDetail; signedIn: boolean; onChanged: () => void }) {
  const summary = course.rating_summary
  const [filter, setFilter] = useState<Filter>('all')
  const [pages, setPages] = useState<{ rows: CourseReview[]; total: number; page: number; hasMore: boolean } | null>(null)
  const [loading, setLoading] = useState(false)

  // The first three reviews come with the page; the list is fetched once someone filters or asks for more.
  // (The page remounts this section after a review is saved, which resets the list.)

  async function load(next: Filter, page: number) {
    setLoading(true)
    const query = [FILTERS.find(f => f.key === next)!.query, `limit=${PAGE_SIZE}`, `offset=${(page - 1) * PAGE_SIZE}`].filter(Boolean).join('&')
    try {
      const data = await apiFetch<SnippetListResponse<CourseReview>>(`/api/learning/courses/${course.slug}/reviews/?${query}`)
      setPages(prev => ({
        rows: page === 1 || !prev ? data.results : [...prev.rows, ...data.results],
        total: data.count,
        page,
        hasMore: Boolean(data.next),
      }))
    } finally {
      setLoading(false)
    }
  }

  const choose = (next: Filter) => { setFilter(next); void load(next, 1) }
  const rows = pages?.rows ?? course.reviews
  const total = pages ? pages.total : summary?.count ?? course.reviews.length
  const showMore = pages ? pages.hasMore : total > course.reviews.length
  const state = course.my_review

  return (
    <div>
      <h2 className="mb-4 text-xl font-extrabold text-text-primary lg:text-2xl">Learner reviews</h2>
      <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
        <div>
          {summary ? (
            <>
              <div className="flex items-baseline gap-2.5">
                <span className="text-5xl font-extrabold leading-none text-text-primary tabular-nums">{summary.average.toFixed(1)}</span>
                <Stars value={summary.average} label={`${summary.average.toFixed(1)} out of 5 stars`} />
              </div>
              <p className="mt-1.5 text-sm text-text-muted">{plural(summary.count, 'review')} from enrolled learners</p>
              <div className="mt-4 grid gap-2">
                {summary.distribution.map(row => (
                  <button key={row.stars} type="button" onClick={() => choose(row.stars >= 4 ? String(row.stars) as Filter : 'low')}
                    aria-label={`Show ${row.stars}-star reviews`}
                    className="grid grid-cols-6 items-center gap-2.5 text-left text-sm font-bold text-slate-700 hover:text-sky-700">
                    <span>{row.stars} star</span>
                    <span className="col-span-4 h-2 rounded-full bg-slate-200 overflow-hidden"><span className="block h-full rounded-full bg-amber-600" style={{ width: `${row.percent}%` }} /></span>
                    <span className="text-right font-semibold text-text-muted tabular-nums">{row.percent}%</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-text-muted">
              {course.reviews.length ? 'The average rating shows once 3 learners have reviewed this course.' : 'No reviews yet.'}
            </p>
          )}
          <p className="mt-4 text-xs text-text-muted">Only enrolled learners who have started the course can review it.</p>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-3.5">
          {state?.can_review && <WriteReview key={state.review?.updated_at ?? 'new'} slug={course.slug} state={state} onSaved={onChanged} />}
          {signedIn && state && !state.can_review && (course.enrollment || course.my_relation) && (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-slate-700">{state.reason}</p>
          )}

          {(rows.length > 0 || pages) && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reviews">
              {FILTERS.map(f => (
                <button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => choose(f.key)}
                  className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                    filter === f.key ? 'border-text-primary bg-text-primary text-white' : 'border-border bg-white text-slate-700 hover:border-primary')}>
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <div aria-live="polite" className={cn('flex flex-col gap-3.5', loading && 'opacity-60')}>
            {rows.map(review => <ReviewCard key={review.id} review={review} />)}
            {pages && rows.length === 0 && <p className="text-sm text-text-muted">No reviews match this filter.</p>}
          </div>
          {showMore && (
            <Button variant="secondary" size="md" className="self-start" disabled={loading}
              onClick={() => load(filter, pages ? pages.page + 1 : 1)}>
              {pages ? 'Show more reviews' : `Show all ${plural(total, 'review')}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
