import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { AuthorByline } from '@/components/gelearn/AuthorByline'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { LockedOverlay } from '@/components/gelearn/LockedOverlay'
import { useAuth } from '@/context/useAuth'
import { apiFetch, ApiError } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { CourseDetail as Course, CourseItem } from '@/types/learning'

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [course, setCourse] = useState<Course | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    apiFetch<Course>(`/api/learning/courses/${slug}/`)
      .then(c => { if (!cancelled) setCourse(c) })
      .catch(() => { if (!cancelled) setCourse(null) })
    return () => { cancelled = true }
  }, [slug, user?.id])

  if (course === undefined) return <div className="min-h-screen" />
  if (course === null) return <Navigate to="/courses" replace />

  const enrolled = course.enrollment !== null

  async function enroll() {
    if (!course) return
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setBusy(true)
    setMessage('')
    try {
      setCourse(await apiFetch<Course>(`/api/learning/courses/${course.slug}/enroll/`, { method: 'POST' }))
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : "Couldn't enroll. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function toggleComplete(item: CourseItem) {
    if (!course || !enrolled) return
    const done = !item.completed
    // Optimistic: flip locally, then confirm with the server.
    const apply = (completed: boolean) => setCourse(prev => {
      if (!prev || !prev.enrollment) return prev
      const items = prev.items.map(i => (i.item_id === item.item_id ? { ...i, completed } : i))
      const count = items.filter(i => i.completed).length
      return {
        ...prev,
        items,
        enrollment: {
          ...prev.enrollment,
          completed: count,
          completed_item_ids: items.filter(i => i.completed).map(i => i.item_id),
          percent: prev.enrollment.total ? Math.round((count * 100) / prev.enrollment.total) : 0,
        },
      }
    })
    apply(done)
    try {
      await apiFetch(`/api/learning/courses/${course.slug}/items/${item.item_id}/complete/`, { method: done ? 'POST' : 'DELETE' })
    } catch {
      apply(!done)
    }
  }

  return (
    <main>
      <PageMeta title={`${course.title} — GeLearn Courses`} description={course.description || `A course by ${course.owner.display_name}.`} canonical={`/courses/${course.slug}`} />

      <div className="bg-white border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-text-muted flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon sx={{ fontSize: 14 }} />
          <Link to="/courses" className="hover:text-primary transition-colors">Courses</Link>
          <ChevronRightIcon sx={{ fontSize: 14 }} />
          <span className="text-text-primary truncate max-w-xs normal-case font-semibold">{course.title}</span>
        </div>
      </div>

      <section className="bg-brand-tint border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-[1fr_380px] gap-10 items-center">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3">
              <SchoolOutlinedIcon sx={{ fontSize: 16 }} /> Course · {course.item_count} {course.item_count === 1 ? 'lesson' : 'lessons'}
            </p>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-4">{course.title}</h1>
            <p className="text-sm text-text-muted mb-5">
              <AuthorByline
                kind="Course"
                company={course.owner.company}
                name={<Link to={`/u/${course.owner.username}`} className="font-bold text-text-primary hover:text-primary">{course.owner.display_name}</Link>}
              />
            </p>
            {course.description && <p className="text-base text-text-muted leading-relaxed max-w-2xl whitespace-pre-line">{course.description}</p>}
          </div>

          <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="relative aspect-video bg-surface flex items-center justify-center">
              {course.cover_url
                ? <img src={getMediaUrl(course.cover_url)} alt="" className="w-full h-full object-cover" />
                : <SchoolOutlinedIcon sx={{ fontSize: 48 }} className="text-primary/40" />}
              {course.is_locked && <LockedOverlay access={course.access} price={course.price} currency={course.currency} />}
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <AccessBadge access={course.access} price={course.price} currency={course.currency} />
                {course.access === 'free' && <span className="text-xs font-bold text-secondary">Free course</span>}
              </div>
              {enrolled && course.enrollment ? (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-1.5">
                    <span>Your progress</span>
                    <span>{course.enrollment.completed}/{course.enrollment.total} · {course.enrollment.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-surface overflow-hidden" role="progressbar" aria-valuenow={course.enrollment.percent} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${course.enrollment.percent}%` }} />
                  </div>
                </div>
              ) : !course.is_locked ? (
                <Button variant="primary" size="md" className="w-full justify-center" disabled={busy} onClick={enroll}>
                  {busy ? 'Enrolling…' : user ? 'Enroll in this course' : 'Sign in to enroll'}
                </Button>
              ) : null}
              {message && <p role="alert" className="text-xs font-semibold text-red-600">{message}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold text-text-primary mb-6">Course outline</h2>
          <ol className="border border-border rounded-2xl divide-y divide-border">
            {course.items.map((item, index) => {
              const Icon = item.kind === 'video' ? PlayCircleOutlineIcon : ArticleOutlinedIcon
              return (
                <li key={item.item_id} className="flex items-center gap-4 px-5 py-4">
                  {enrolled ? (
                    <button type="button" onClick={() => toggleComplete(item)} aria-pressed={item.completed}
                      aria-label={item.completed ? `Mark "${item.title}" as not done` : `Mark "${item.title}" as done`}
                      className="shrink-0 text-primary hover:opacity-80">
                      {item.completed ? <CheckCircleIcon sx={{ fontSize: 24 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 24 }} className="text-text-muted" />}
                    </button>
                  ) : (
                    <span className="w-6 text-sm font-bold text-text-muted text-center shrink-0">{index + 1}</span>
                  )}
                  <Icon sx={{ fontSize: 20 }} className={item.kind === 'video' ? 'text-primary shrink-0' : 'text-secondary shrink-0'} />
                  <Link to={item.path} className="min-w-0 flex-1 group">
                    <span className={`block text-sm font-semibold truncate group-hover:text-primary transition-colors ${item.completed ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                      {item.title}
                    </span>
                    {item.meta && <span className="block text-xs text-text-muted truncate">{item.kind === 'video' ? 'Video' : 'Article'} · {item.meta}</span>}
                  </Link>
                  {item.is_locked
                    ? <LockOutlinedIcon sx={{ fontSize: 17 }} className="text-text-muted shrink-0" aria-label="Locked" />
                    : <AccessBadge access={item.access} price={item.price} currency={item.currency} />}
                </li>
              )
            })}
          </ol>
          {!enrolled && !course.is_locked && (
            <p className="text-sm text-text-muted mt-4">Enroll to track your progress through the course.</p>
          )}
        </div>
      </section>
    </main>
  )
}
