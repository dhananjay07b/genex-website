import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button, buttonVariants } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { useRole } from '@/hooks/useRole'
import { apiFetch, ApiError } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import { useTrackView } from '@/hooks/useTrackView'
import type { CourseDetail as Course, CourseItem } from '@/types/learning'
import { CourseHero } from './CourseHero'
import { CourseTabs } from './CourseTabs'
import { CourseAbout } from './CourseAbout'
import { CoursePath } from './CoursePath'
import { CourseModules } from './CourseModules'
import { CourseSide } from './CourseSide'
import { CourseReviews } from './CourseReviews'
import { CourseRelated } from './CourseRelated'
import { CoursePromos } from './CoursePromos'
import { CourseFaq } from './CourseFaq'
import { plural, type SectionId } from './format'
import { jumpTo } from './scroll'
import { returnState } from '@/lib/authRedirect'

function Section({ id, label, children }: { id?: SectionId; label?: string; children: ReactNode }) {
  return (
    <section id={id} aria-label={label} className="mx-auto max-w-330 px-4 py-8 md:px-6">
      {children}
    </section>
  )
}

/** First lesson an enrolled learner hasn't finished, after ticking one off locally. */
const firstUnfinished = (items: CourseItem[]) => items.find(i => !i.completed)?.item_id ?? null

/** The course page: hero, tabs, about, career path, lessons, reviews, related courses and FAQ. */
export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { isCompany } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [course, setCourse] = useState<Course | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [reviewsKey, setReviewsKey] = useState(0)
  const [relatedEmpty, setRelatedEmpty] = useState(false)
  const barRef = useRef<HTMLElement | null>(null)

  const load = useCallback(() => apiFetch<Course>(`/api/learning/courses/${slug}/`), [slug])

  useEffect(() => {
    let cancelled = false
    load().then(c => { if (!cancelled) setCourse(c) }).catch(() => { if (!cancelled) setCourse(null) })
    return () => { cancelled = true }
  }, [load, user?.id])

  useTrackView('course', course?.id)
  const markRelatedEmpty = useCallback(() => setRelatedEmpty(true), [])

  const present = useMemo(() => {
    const ids = new Set<SectionId>(['cp-about', 'cp-reviews', 'cp-faq'])
    if (course?.roles[0]?.path.length) ids.add('cp-path')
    if (course?.items.length) ids.add('cp-lessons')
    if (!relatedEmpty) ids.add('cp-more')
    return ids
  }, [course, relatedEmpty])

  if (course === undefined) return <div className="mx-auto h-96 max-w-330 animate-pulse px-4 pt-24 md:px-6" aria-hidden="true"><div className="h-full rounded-2xl bg-slate-100" /></div>
  if (course === null) return <Navigate to="/courses" replace />

  const enrolled = course.enrollment !== null
  const jump = (id: SectionId) => jumpTo(id, barRef.current)

  async function enroll() {
    if (!course) return
    if (!user) {
      navigate('/login', { state: returnState(location) })
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
        next_item_id: firstUnfinished(items),
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
      // Finishing a first lesson can make the learner eligible to review: refresh that part.
      if (done && course.my_review && !course.my_review.can_review) setCourse(await load())
    } catch {
      apply(!done)
    }
  }

  async function reviewsChanged() {
    setCourse(await load())
    setReviewsKey(k => k + 1)
  }

  const nextItem = course.items.find(i => i.item_id === course.next_item_id)
  const primaryRole = course.roles.find(r => r.path.length)
  const hasSide = course.instructors.length > 0 || course.publisher !== null

  return (
    <div className="bg-white pt-16">
      <PageMeta
        title={`${course.title}: GeLearn course`}
        description={course.summary || course.description.slice(0, 160) || `A course on GeLearn.`}
        canonical={`/courses/${course.slug}`}
        image={course.cover_url ? getMediaUrl(course.cover_url) : undefined}
      />
      <CourseHero course={course} signedIn={Boolean(user)} busy={busy} message={message} onEnroll={enroll} onJump={jump} />
      <CourseTabs present={present} barRef={barRef} />

      <Section id="cp-about" label="About"><CourseAbout course={course} signedIn={Boolean(user)} /></Section>
      {primaryRole && <Section id="cp-path" label="Career path"><CoursePath role={primaryRole} /></Section>}
      {(course.items.length > 0 || hasSide) && (
        <Section id={course.items.length > 0 ? 'cp-lessons' : undefined} label={course.items.length > 0 ? 'Lessons' : 'Instructor and publisher'}>
          <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
            {course.items.length > 0 && <div className="min-w-0 lg:col-span-2"><CourseModules course={course} onToggle={toggleComplete} /></div>}
            {hasSide && <CourseSide instructors={course.instructors} publisher={course.publisher} />}
          </div>
        </Section>
      )}

      {course.learner_companies.length > 0 && (
        <Section label="Learners' companies">
          <h2 className="text-xl font-extrabold text-text-primary">Engineers from these companies have taken this course</h2>
          <p className="mt-1 mb-4 text-sm text-text-muted">Counted from enrolled learners with a verified company email.</p>
          <div className="flex flex-wrap gap-2.5">
            {course.learner_companies.map(company => (
              <Link key={company.slug ?? company.name} to={company.slug ? `/c/${company.slug}` : '#'}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-primary">
                {company.logo_url && <img src={getMediaUrl(company.logo_url)} alt="" className="size-6 rounded object-contain" />}
                {company.name}
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section id="cp-reviews" label="Reviews">
        <CourseReviews key={reviewsKey} course={course} signedIn={Boolean(user)} onChanged={reviewsChanged} />
      </Section>
      {!relatedEmpty && <Section id="cp-more" label="More courses"><CourseRelated slug={course.slug} onEmpty={markRelatedEmpty} /></Section>}
      <Section label="GeLearn programmes"><CoursePromos /></Section>
      <Section id="cp-faq" label="FAQ"><CourseFaq course={course} /></Section>

      {/* Phones: keep the main action in reach. */}
      <div className="sticky bottom-0 z-30 flex items-center gap-3 border-t border-border bg-white px-4 py-2.5 shadow-lg lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text-primary">{course.title}</p>
          <p className="text-xs text-text-muted">
            {course.my_relation
              ? (course.my_relation === 'owner' ? 'Your course' : 'You teach this course')
              : enrolled && course.enrollment
              ? `${course.enrollment.completed} of ${plural(course.enrollment.total, 'lesson')} · ${course.enrollment.percent}%`
              : course.access === 'members' ? 'Members · free with an account' : course.access === 'free' ? 'Free course' : 'Paid course'}
          </p>
        </div>
        {course.my_relation
          ? course.my_relation === 'owner' && <Link to={isCompany ? '/studio/courses' : '/account?tab=courses'} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>Manage</Link>
          : enrolled
          ? nextItem && <Link to={nextItem.path} className={buttonVariants({ size: 'sm' })}>{course.enrollment?.completed ? 'Resume' : 'Start'}</Link>
          : !(course.is_locked && course.access === 'paid') && <Button size="sm" onClick={enroll} disabled={busy}>{course.is_locked ? 'Sign in' : 'Enroll'}</Button>}
      </div>
    </div>
  )
}
