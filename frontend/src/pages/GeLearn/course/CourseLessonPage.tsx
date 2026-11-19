import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { RichText } from '@/components/ui/RichText'
import { buttonVariants } from '@/components/ui/Button'
import { COURSE_LESSON_TYPES, courseItemDisplay } from '@/components/gelearn/courseItemKinds'
import { useAuth } from '@/context/useAuth'
import { apiFetch, ApiError } from '@/lib/api/client'
import { returnState } from '@/lib/authRedirect'
import { cn, embedVideoUrl } from '@/lib/utils'
import { CourseReadingOutline } from './CourseReading'
import type { CourseDetail as Course, CourseItem, CourseLessonBlock, CourseLessonContent } from '@/types/learning'
import { formatMinutes, plural } from './format'
import { recordLessonOpen } from './lessons'
import { QuizPlayer } from './QuizPlayer'

type Loaded<T> = T | null | undefined

/** The course's lessons in the order learners take them: each module's, then those in no module. */
function inOrder(course: Course): CourseItem[] {
  const byId = new Map(course.items.map(i => [i.item_id, i]))
  const inModules = course.modules.flatMap(m => m.item_ids.map(id => byId.get(id)).filter((i): i is CourseItem => Boolean(i)))
  const placed = new Set(inModules.map(i => i.item_id))
  return [...inModules, ...course.items.filter(i => !placed.has(i.item_id))]
}

function Outline({ course, currentId, completed, onOpen }: {
  course: Course
  currentId: number | null
  completed: Set<number>
  onOpen: (item: CourseItem) => void
}) {
  const enrolled = course.enrollment !== null
  const byId = new Map(course.items.map(i => [i.item_id, i]))
  const loose = course.items.filter(i => !course.modules.some(m => m.item_ids.includes(i.item_id)))
  const groups = [
    ...course.modules.map(m => ({ key: `m${m.id}`, title: m.title, items: m.item_ids.map(id => byId.get(id)).filter((i): i is CourseItem => Boolean(i)) })),
    ...(loose.length ? [{ key: 'loose', title: course.modules.length ? 'More lessons' : '', items: loose }] : []),
  ]
  return (
    <nav aria-label="Course outline" className="flex flex-col gap-4">
      {groups.map(group => (
        <div key={group.key}>
          {group.title && <p className="px-3 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-text-muted">{group.title}</p>}
          <ol className="flex flex-col">
            {group.items.map(item => {
              const { icon: Icon } = courseItemDisplay(item)
              const current = item.item_id === currentId
              const done = completed.has(item.item_id)
              const row = cn('flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm',
                current ? 'border-l-primary bg-sky-50 font-bold text-text-primary' : 'border-l-transparent text-slate-700')
              const mark = enrolled
                ? done
                  ? <CheckCircleIcon sx={{ fontSize: 18 }} className="shrink-0 text-emerald-700" titleAccess="Done" />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} className="shrink-0 text-slate-400" titleAccess="Not done yet" />
                : <Icon sx={{ fontSize: 18 }} className="shrink-0 text-sky-700" />
              return (
                <li key={item.item_id}>
                  {item.is_locked ? (
                    <span className={row}>
                      {mark}<span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <LockOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0 text-text-muted" aria-label="Locked" />
                    </span>
                  ) : (
                    <Link to={item.path} onClick={() => onOpen(item)} aria-current={current ? 'page' : undefined}
                      className={cn(row, !current && 'hover:bg-surface hover:text-text-primary')}>
                      {mark}<span className="min-w-0 flex-1 truncate">{item.title}</span>
                      {item.kind !== 'lesson' && <OpenInNewIcon sx={{ fontSize: 14 }} className="shrink-0 text-text-muted" aria-label="Opens its own page" />}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
      <CourseReadingOutline items={course.reading ?? []} />
    </nav>
  )
}

/**
 * A lesson written inside a course, opened from the course: video and/or text,
 * or a quiz, with the course outline beside it and Previous / Next. Opening it
 * as an enrolled learner completes it (as opening any lesson from the course
 * does); a quiz is completed by passing it.
 */
export default function CourseLessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>()
  const { user } = useAuth()
  const location = useLocation()
  const [course, setCourse] = useState<Loaded<Course>>(undefined)
  // Keyed by the lesson it was loaded for, so moving to another lesson shows nothing stale while it loads.
  const [loaded, setLoaded] = useState<{ key: string; lesson: CourseLessonContent | null; block: CourseLessonBlock | null } | null>(null)
  const [justDone, setJustDone] = useState<Set<number>>(new Set())
  const [certificate, setCertificate] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    apiFetch<Course>(`/api/learning/courses/${slug}/`).then(c => { if (!cancelled) setCourse(c) }).catch(() => { if (!cancelled) setCourse(null) })
    return () => { cancelled = true }
  }, [slug, user?.id])

  const key = `${slug}/${lessonId}/${user?.id ?? ''}`
  useEffect(() => {
    let cancelled = false
    apiFetch<CourseLessonContent>(`/api/learning/courses/${slug}/lessons/${lessonId}/`)
      .then(l => { if (!cancelled) setLoaded({ key, lesson: l, block: null }) })
      .catch(err => {
        if (cancelled) return
        const block = err instanceof ApiError && err.status === 403
          ? { detail: err.message, code: (err.fields.code as CourseLessonBlock['code']) ?? 'enroll', title: err.fields.title ?? '' }
          : null
        setLoaded({ key, lesson: null, block })
      })
    window.scrollTo(0, 0)
    return () => { cancelled = true }
  }, [slug, lessonId, key])
  const current = loaded?.key === key ? loaded : null
  const lesson: Loaded<CourseLessonContent> = current ? current.lesson : undefined
  const block = current?.block ?? null

  const enrolled = Boolean(course?.enrollment)
  const completed = useMemo(
    () => new Set([...(course?.enrollment?.completed_item_ids ?? []), ...justDone]),
    [course, justDone],
  )
  const itemId = lesson?.item_id ?? null
  const isQuiz = lesson?.kind === 'quiz'

  // Opening the lesson as an enrolled learner completes it (a quiz: passing it); the last one issues the certificate.
  useEffect(() => {
    if (!course || !enrolled || isQuiz || itemId === null || completed.has(itemId)) return
    apiFetch<{ completed: number; certificate_code: string | null }>(
      `/api/learning/courses/${course.slug}/items/${itemId}/open/`, { method: 'POST' },
    ).then(res => {
      setJustDone(prev => new Set(prev).add(itemId))
      if (res.certificate_code) setCertificate(res.certificate_code)
    }).catch(() => {})
  }, [course, enrolled, isQuiz, itemId, completed])

  if (course === null || (lesson === null && !block)) return <Navigate to={course ? `/courses/${course.slug}` : '/courses'} replace />
  if (course === undefined || lesson === undefined) {
    return <div className="mx-auto h-96 max-w-330 animate-pulse px-4 pt-24 md:px-6" aria-hidden="true"><div className="h-full rounded-2xl bg-slate-100" /></div>
  }

  const ordered = inOrder(course)
  const index = ordered.findIndex(i => i.kind === 'lesson' && i.id === Number(lessonId))
  const prev = index > 0 ? ordered[index - 1] : null
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null
  const coursePath = `/courses/${course.slug}`
  const doneCount = ordered.filter(i => completed.has(i.item_id)).length
  const certificateCode = certificate ?? (doneCount === ordered.length ? course.enrollment?.certificate_code ?? null : null)
  // Other lessons opened from here count too, as on the course page.
  const openFromHere = (item: CourseItem) => {
    if (enrolled && !item.is_locked && !completed.has(item.item_id) && item.kind !== 'lesson') {
      recordLessonOpen(course.slug, item.item_id)
      setJustDone(prev => new Set(prev).add(item.item_id))
    }
  }

  const title = lesson?.title ?? block?.title ?? 'Lesson'
  const type = lesson ? COURSE_LESSON_TYPES[lesson.kind] : null
  const embed = lesson?.video_url ? embedVideoUrl(lesson.video_url) : null

  const progress = enrolled && (
    <div className="flex flex-col gap-1.5 px-3">
      <p className="text-xs font-semibold text-text-muted">{doneCount} of {plural(ordered.length, 'lesson')} done</p>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden" role="progressbar" aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={ordered.length} aria-label="Course progress">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${ordered.length ? (doneCount * 100) / ordered.length : 0}%` }} />
      </div>
    </div>
  )

  return (
    <div className="bg-white pt-16">
      <PageMeta title={`${title} · ${course.title}`} description={`A lesson in the course ${course.title} on GeLearn.`}
        canonical={`${coursePath}/lessons/${lessonId}`} noIndex />

      <div className="border-b border-border">
        <div className="mx-auto flex max-w-330 items-center gap-1.5 px-4 py-3 text-xs font-bold text-text-muted md:px-6">
          <Link to="/courses" className="hover:text-primary">Courses</Link>
          <ChevronRightIcon sx={{ fontSize: 14 }} />
          <Link to={coursePath} className="truncate hover:text-primary">{course.title}</Link>
          <ChevronRightIcon sx={{ fontSize: 14 }} />
          <span className="truncate text-text-primary">{title}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-330 gap-8 px-4 py-8 md:px-6 lg:grid-cols-4">
        {/* Phones: the outline folds away above the lesson. */}
        <details className="rounded-xl border border-border lg:hidden">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-text-primary">
            Course outline{enrolled ? ` · ${doneCount} of ${ordered.length} done` : ''}
          </summary>
          <div className="flex flex-col gap-3 border-t border-border py-3">
            {progress}
            <Outline course={course} currentId={itemId} completed={completed} onOpen={openFromHere} />
          </div>
        </details>
        <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:sticky lg:top-24 lg:self-start">
          <Link to={coursePath} className="px-3 text-sm font-extrabold text-text-primary hover:text-primary">{course.title}</Link>
          {progress}
          <Outline course={course} currentId={itemId} completed={completed} onOpen={openFromHere} />
        </aside>

        <article className="min-w-0 flex flex-col gap-6 lg:col-span-3">
          {block ? (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface px-6 py-8">
              <LockOutlinedIcon sx={{ fontSize: 28 }} className="text-text-muted" />
              <h1 className="text-2xl font-extrabold text-text-primary">{title}</h1>
              <p className="text-sm text-slate-700">{block.detail}</p>
              {block.code === 'sign_in'
                ? <Link to="/login" state={returnState(location)} className={buttonVariants({ size: 'md' })}>Sign in</Link>
                : <Link to={coursePath} className={buttonVariants({ size: 'md' })}>Go to the course</Link>}
            </div>
          ) : lesson && type && (
            <>
              {(lesson.has_pending || !lesson.approved) && (
                <p className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <HourglassEmptyOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0 mt-px" />
                  <span>
                    <b>Only the course team sees this version.</b>{' '}
                    {lesson.has_pending
                      ? 'It includes edits waiting for Genex review. Learners see the approved lesson until they’re approved.'
                      : 'Genex hasn’t reviewed this lesson yet, so learners can’t open it.'}
                  </span>
                </p>
              )}
              {!enrolled && lesson.is_preview && lesson.approved && (
                <p className="flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0" />
                  <span className="flex-1 min-w-48">This is a free preview. Enroll to open every lesson and track your progress.</span>
                  <Link to={coursePath} className="font-bold underline hover:no-underline">Enroll in the course</Link>
                </p>
              )}
              <header className="flex flex-col gap-2">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-sky-700">
                  <type.icon sx={{ fontSize: 16 }} />
                  {[type.label, lesson.kind === 'video' ? lesson.duration : lesson.minutes ? formatMinutes(lesson.minutes) : ''].filter(Boolean).join(' · ')}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight text-text-primary text-balance">{lesson.title}</h1>
              </header>

              {lesson.kind === 'video' && lesson.video_url && (embed ? (
                <div className="aspect-video overflow-hidden rounded-2xl bg-slate-900">
                  <iframe src={embed} title={lesson.title} className="size-full" allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                </div>
              ) : (
                <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: 'md' }), 'self-start')}>
                  Watch the video <OpenInNewIcon sx={{ fontSize: 16 }} />
                </a>
              ))}

              {lesson.body && <RichText html={lesson.body} className="max-w-3xl text-base text-slate-800" />}

              {lesson.quiz && (
                <QuizPlayer key={key} slug={course.slug} lessonId={lesson.id} quiz={lesson.quiz}
                  saving={enrolled && itemId !== null && !lesson.has_pending}
                  onPassed={code => {
                    if (itemId !== null) setJustDone(prev => new Set(prev).add(itemId))
                    if (code) setCertificate(code)
                  }} />
              )}
            </>
          )}

          {certificateCode && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 26 }} className="text-emerald-700" />
              <p className="flex-1 min-w-48 text-sm font-semibold text-emerald-900">You&apos;ve finished the course. Your certificate is ready.</p>
              <Link to={`/certificates/${certificateCode}`} className={buttonVariants({ size: 'md' })}>View certificate</Link>
            </div>
          )}

          <nav aria-label="Lessons" className="grid grid-cols-2 gap-3 border-t border-border pt-5">
            {prev && !prev.is_locked ? (
              <Link to={prev.path} onClick={() => openFromHere(prev)} className="flex min-w-0 items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm hover:border-primary">
                <ArrowBackIcon sx={{ fontSize: 18 }} className="shrink-0 text-primary" />
                <span className="min-w-0"><span className="block text-xs text-text-muted">Previous</span><span className="block truncate font-bold text-text-primary">{prev.title}</span></span>
              </Link>
            ) : <span />}
            {next && (next.is_locked ? (
              <span className="col-start-2 flex min-w-0 items-center justify-end gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-muted">
                <span className="min-w-0 text-right"><span className="block text-xs">Next (enroll to open)</span><span className="block truncate font-bold">{next.title}</span></span>
                <LockOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0" />
              </span>
            ) : (
              <Link to={next.path} onClick={() => openFromHere(next)} className="col-start-2 flex min-w-0 items-center justify-end gap-2 rounded-xl border border-primary bg-sky-50 px-4 py-3 text-sm hover:bg-sky-100">
                <span className="min-w-0 text-right"><span className="block text-xs text-text-muted">Next</span><span className="block truncate font-bold text-text-primary">{next.title}</span></span>
                <ArrowForwardIcon sx={{ fontSize: 18 }} className="shrink-0 text-primary" />
              </Link>
            ))}
            {!next && !certificateCode && (
              <Link to={coursePath} className="col-start-2 flex items-center justify-end gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-text-primary hover:border-primary">
                Back to the course <ArrowForwardIcon sx={{ fontSize: 18 }} className="text-primary" />
              </Link>
            )}
          </nav>
        </article>
      </div>
    </div>
  )
}
