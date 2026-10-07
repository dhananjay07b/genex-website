import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { apiFetch, ApiError } from '@/lib/api/client'
import { formatRelativeTime, getMediaUrl } from '@/lib/utils'
import type { CourseStatus, MyCourse } from '@/types/learning'
import { EmptyState } from './EmptyState'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'

const STATUS_TEXT: Record<CourseStatus, string> = {
  draft: 'Draft',
  pending: 'In review',
  published: 'Live',
  rejected: 'Needs changes',
}

const STATUS_CHIP: Record<CourseStatus, string> = {
  draft: 'bg-surface text-text-primary border border-border',
  pending: 'bg-sky-100 text-sky-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-amber-100 text-amber-800',
}

const FILTERS: { key: 'all' | CourseStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Live' },
  { key: 'pending', label: 'In review' },
  { key: 'rejected', label: 'Needs changes' },
  { key: 'draft', label: 'Drafts' },
]

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

interface CoursesTabProps {
  /** Where the builder lives: a Professional's dashboard, or Company Studio for a company's courses. */
  basePath?: string
  heading?: string
  emptyTitle?: string
  emptyDescription?: string
}

/** The course list, shared by a Professional's My Courses and Company Studio → Courses. */
export function CoursesTab({
  basePath = '/account/courses',
  heading = 'My Courses',
  emptyTitle = 'Turn your posts and videos into a course',
  emptyDescription = 'Group your published videos and posts into an ordered course. Learners enroll and track their progress through it.',
}: CoursesTabProps) {
  const [courses, setCourses] = useState<MyCourse[] | null>(null)
  const [filter, setFilter] = useState<'all' | CourseStatus>('all')
  const [pendingDelete, setPendingDelete] = useState<MyCourse | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    apiFetch<MyCourse[]>('/api/learning/me/courses/').then(setCourses).catch(() => setCourses([]))
  }, [])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    setDeleteError('')
    try {
      await apiFetch(`/api/learning/me/courses/${pendingDelete.id}/`, { method: 'DELETE' })
      setCourses(prev => prev?.filter(c => c.id !== pendingDelete.id) ?? null)
      setPendingDelete(null)
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Couldn't delete the course.")
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  // A live course with changes waiting (or sent back) also shows under "In review" (or "Needs changes").
  const matches = (c: MyCourse, key: 'all' | CourseStatus) =>
    key === 'all' || c.status === key || (key === 'pending' && c.revision?.status === 'pending') || (key === 'rejected' && c.revision?.status === 'rejected')
  const count = (key: 'all' | CourseStatus) => (courses ?? []).filter(c => matches(c, key)).length
  const shown = (courses ?? []).filter(c => matches(c, filter))

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-xl font-extrabold text-text-primary">{heading}</h1>
        <Link to={`${basePath}/new`}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white text-sm font-bold px-4 py-2 hover:opacity-90 transition-opacity">
          <AddIcon sx={{ fontSize: 17 }} /> New course
        </Link>
      </div>

      {courses === null ? (
        <div className="min-h-40" />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<SchoolOutlinedIcon sx={{ fontSize: 24 }} />}
          title={emptyTitle}
          description={emptyDescription}
          action={<Link to={`${basePath}/new`} className="text-sm font-bold text-primary hover:underline">Create your first course</Link>}
        />
      ) : (
        <>
          <div role="tablist" aria-label="Course status" className="flex gap-1 overflow-x-auto border-b border-border mb-4">
            {FILTERS.filter(f => f.key === 'all' || count(f.key) > 0).map(f => (
              <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap px-3 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${filter === f.key ? 'border-primary text-text-primary' : 'border-transparent text-text-muted hover:text-text-primary'}`}>
                {f.label} <span className="font-semibold text-text-muted">{count(f.key)}</span>
              </button>
            ))}
          </div>
          {deleteError && <p role="alert" className="text-sm font-semibold text-red-600 mb-3">{deleteError}</p>}
          <ul className="flex flex-col gap-3">
            {shown.map(course => {
              const live = course.status === 'published'
              const modules = course.modules.length
              return (
                <li key={course.id} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border bg-white p-3 hover:border-sky-200 hover:shadow-sm transition-all">
                  <div className="w-full sm:w-28 aspect-video rounded-lg overflow-hidden bg-brand-tint flex items-center justify-center shrink-0">
                    {course.cover_url
                      ? <img src={getMediaUrl(course.cover_url)} alt="" className="w-full h-full object-cover" />
                      : <SchoolOutlinedIcon sx={{ fontSize: 28 }} className="text-primary/50" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`${basePath}/${course.id}/edit`} className="font-bold text-text-primary hover:text-primary truncate">{course.title}</Link>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_CHIP[course.status]}`}>{STATUS_TEXT[course.status]}</span>
                      {live && course.revision && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${course.revision.status === 'pending' ? STATUS_CHIP.pending : STATUS_CHIP.rejected}`}>
                          {course.revision.status === 'pending' ? 'Changes in review' : 'Changes sent back'}
                        </span>
                      )}
                      <AccessBadge access={course.access} price={course.price} currency={course.currency} />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {modules ? `${plural(modules, 'module')} · ` : ''}{plural(course.items.length, 'lesson')} · updated {formatRelativeTime(course.updated_at)}
                    </p>
                    {live && course.revision?.status === 'rejected' && course.revision.rejection_reason && (
                      <p className="flex items-start gap-1 text-xs text-amber-800 mt-1">
                        <FeedbackOutlinedIcon sx={{ fontSize: 14 }} className="mt-px shrink-0" /> Genex: {course.revision.rejection_reason}
                      </p>
                    )}
                    {course.status === 'rejected' && course.rejection_reason && (
                      <p className="flex items-start gap-1 text-xs text-amber-800 mt-1">
                        <FeedbackOutlinedIcon sx={{ fontSize: 14 }} className="mt-px shrink-0" /> Genex: {course.rejection_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-text-muted sm:text-right shrink-0">
                    <b className="block text-base text-text-primary tabular-nums">{live ? course.enrolled_count : '—'}</b>learners
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Only live courses have a public page; unpublished ones are previewed inside the builder. */}
                    {live && (
                      <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer"
                        aria-label={`View ${course.title}`} title="View the live page"
                        className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-primary">
                        <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                      </a>
                    )}
                    <Link to={`${basePath}/${course.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
                      <EditOutlinedIcon sx={{ fontSize: 14 }} /> Edit
                    </Link>
                    <button type="button" onClick={() => setPendingDelete(course)} disabled={!course.can_delete}
                      aria-label={`Delete ${course.title}`}
                      title={course.can_delete ? 'Delete' : 'Live with enrolled learners: ask Genex to unpublish it'}
                      className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:pointer-events-none">
                      <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-text-muted mt-3">Live courses with enrolled learners can&apos;t be deleted here, so learners never lose a course they&apos;re taking. Ask Genex to unpublish one instead.</p>
        </>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          label={pendingDelete.title}
          message="will be deleted, along with its modules and FAQ."
          confirming={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
