import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/utils'
import type { CourseStatus, MyCourse } from '@/types/learning'
import { EmptyState } from './EmptyState'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import { STATUS_BADGE_CLASS } from './types'

const STATUS_TEXT: Record<CourseStatus, string> = {
  draft: 'Draft',
  pending: 'In review',
  published: 'Live',
  rejected: 'Needs changes',
}

interface CoursesTabProps {
  /** Where the builder lives: a Professional's dashboard, or Company Studio for a company's courses. */
  basePath?: string
  heading?: string
  emptyTitle?: string
  emptyDescription?: string
}

export function CoursesTab({
  basePath = '/account/courses',
  heading = 'My Courses',
  emptyTitle = 'Turn your posts and videos into a course',
  emptyDescription = 'Group your published videos and posts into an ordered course. Learners enroll and track their progress through it.',
}: CoursesTabProps) {
  const [courses, setCourses] = useState<MyCourse[] | null>(null)
  const [pendingDelete, setPendingDelete] = useState<MyCourse | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    apiFetch<MyCourse[]>('/api/learning/me/courses/').then(setCourses).catch(() => setCourses([]))
  }, [])

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await apiFetch(`/api/learning/me/courses/${pendingDelete.id}/`, { method: 'DELETE' })
      setCourses(prev => prev?.filter(c => c.id !== pendingDelete.id) ?? null)
      setPendingDelete(null)
    } finally {
      setDeleting(false)
    }
  }

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
        <ul className="border border-border rounded-2xl divide-y divide-border overflow-hidden">
          {courses.map(course => (
            <li key={course.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-text-primary truncate">{course.title}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${STATUS_BADGE_CLASS}`}>{STATUS_TEXT[course.status]}</span>
                  <AccessBadge access={course.access} price={course.price} currency={course.currency} />
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {course.items.length} item{course.items.length === 1 ? '' : 's'} · updated {formatRelativeTime(course.updated_at)}
                </p>
                {course.status === 'rejected' && course.rejection_reason && (
                  <p className="text-xs text-red-600 mt-1">Feedback: {course.rejection_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {course.status === 'published' && (
                  <Link to={`/courses/${course.slug}`} aria-label={`View ${course.title}`}
                    className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-primary">
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </Link>
                )}
                <Link to={`${basePath}/${course.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
                  <EditOutlinedIcon sx={{ fontSize: 14 }} /> Edit
                </Link>
                <button type="button" onClick={() => setPendingDelete(course)} aria-label={`Delete ${course.title}`}
                  className="size-9 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <ConfirmDeleteDialog
          label={pendingDelete.title}
          message="will be deleted, along with learners' enrollments and progress in it."
          confirming={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}
