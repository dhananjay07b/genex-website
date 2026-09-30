import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { SnippetListResponse } from '@/types/api'
import type { CourseDetail } from '@/types/learning'
import { EmptyState } from './EmptyState'

/** Enrolled courses, with progress and a jump to the next unfinished lesson. */
export function LearningTab() {
  const [courses, setCourses] = useState<CourseDetail[] | null>(null)

  useEffect(() => {
    apiFetch<SnippetListResponse<CourseDetail>>('/api/learning/me/enrollments/?limit=100')
      .then(res => setCourses(res.results))
      .catch(() => setCourses([]))
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-xl font-extrabold text-text-primary">My Learning</h1>
        <Link to="/courses" className="text-sm font-bold text-primary hover:underline">Browse courses</Link>
      </div>

      {courses === null ? (
        <div className="min-h-40" />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<AutoStoriesOutlinedIcon sx={{ fontSize: 24 }} />}
          title="You haven't enrolled in a course yet"
          description="Courses are built by verified industry professionals. Enroll in one to track your progress here."
          action={<Link to="/courses" className="text-sm font-bold text-primary hover:underline">Explore courses</Link>}
        />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => {
            const progress = course.enrollment
            const next = course.items.find(item => !item.completed)
            const done = progress !== null && progress.total > 0 && progress.completed === progress.total
            return (
              <li key={course.slug} className="border border-border rounded-2xl overflow-hidden flex flex-col">
                <Link to={`/courses/${course.slug}`} className="flex gap-4 p-4 group">
                  <span className="size-16 rounded-xl bg-brand-tint flex items-center justify-center overflow-hidden shrink-0">
                    {course.cover_url
                      ? <img src={getMediaUrl(course.cover_url)} alt="" className="w-full h-full object-cover" />
                      : <SchoolOutlinedIcon sx={{ fontSize: 24 }} className="text-primary/50" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-text-primary leading-snug group-hover:text-primary transition-colors line-clamp-2">{course.title}</span>
                    <span className="block text-xs text-text-muted mt-1">by {course.owner.display_name}</span>
                  </span>
                </Link>
                <div className="px-4 pb-4 mt-auto">
                  <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-1.5">
                    <span>{progress ? `${progress.completed} of ${progress.total} lessons` : ''}</span>
                    <span>{progress?.percent ?? 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface overflow-hidden mb-3" role="progressbar"
                    aria-valuenow={progress?.percent ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label={`${course.title} progress`}>
                    <div className="h-full bg-linear-to-r from-primary to-secondary" style={{ width: `${progress?.percent ?? 0}%` }} />
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary">
                      <CheckCircleIcon sx={{ fontSize: 16 }} /> Completed
                    </span>
                  ) : next ? (
                    <Link to={next.path} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                      Continue: <span className="truncate max-w-48">{next.title}</span> <ArrowForwardIcon sx={{ fontSize: 14 }} />
                    </Link>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
