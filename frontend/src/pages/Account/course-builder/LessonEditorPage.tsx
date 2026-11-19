import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { COURSE_LESSON_TYPES } from '@/components/gelearn/courseItemKinds'
import { useRole } from '@/hooks/useRole'
import { apiFetch, ApiError } from '@/lib/api/client'
import { cn, embedVideoUrl } from '@/lib/utils'
import { ConfirmDialog } from '@/pages/Account/dashboard/ConfirmDialog'
import type { CourseLesson, CourseLessonSaved, CourseLessonType, MyCourse, QuizQuestion } from '@/types/learning'
import { QuizEditor } from './QuizEditor'
import { blankQuestion, quizProblem } from './quiz'
import { fieldClass } from './draft'

const LESSON_TYPES: CourseLessonType[] = ['text', 'video', 'quiz']
const isLessonType = (value: string | null): value is CourseLessonType => LESSON_TYPES.includes(value as CourseLessonType)

interface Fields {
  title: string
  video_url: string
  duration: string
  body: string
  is_preview: boolean
  /** Quizzes. Kept as typed; checked on saving. */
  pass_mark: string
  questions: QuizQuestion[]
}

const fieldsOf = (lesson: CourseLesson | null, kind: CourseLessonType): Fields => ({
  title: lesson?.title ?? '',
  video_url: lesson?.video_url ?? '',
  duration: lesson?.duration ?? '',
  body: lesson?.body ?? '',
  is_preview: lesson?.is_preview ?? false,
  pass_mark: String(lesson?.pass_mark ?? 70),
  questions: lesson ? lesson.questions : kind === 'quiz' ? [blankQuestion()] : [],
})

/** A question with nothing typed in it is left out rather than refused. */
const isBlank = (q: QuizQuestion) => !q.prompt.trim() && q.options.every(o => !o.trim()) && !q.explanation.trim()

/** Field errors the page has no field for (e.g. "detail") are shown as the page's message. */
const FIELD_NAMES = new Set(['title', 'video_url', 'duration', 'body', 'pass_mark'])

const TITLE_PLACEHOLDER: Record<CourseLessonType, string> = {
  text: 'e.g. Why protection relays trip',
  video: 'e.g. Testing a feeder relay',
  quiz: 'e.g. Check your understanding: relay basics',
}

const TYPE_CHIP: Record<CourseLessonType, string> = {
  text: 'bg-sky-100 text-sky-800',
  video: 'bg-emerald-50 text-emerald-800',
  quiz: 'bg-amber-50 text-amber-800',
}

/** Keyed by lesson so moving to another lesson always starts fresh. */
export default function LessonEditorPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId?: string }>()
  return <LessonEditorForm key={`${id}:${lessonId ?? 'new'}`} courseId={Number(id)} lessonId={lessonId ? Number(lessonId) : null} />
}

/**
 * A course lesson, written on its own page inside the dashboard frame (it
 * replaced the pop-up editor): a sticky lesson bar with Save, then the lesson.
 * Text lessons keep their formatting toolbar in view while scrolling. A new
 * lesson is created on its first save and put into the module it was added to.
 */
function LessonEditorForm({ courseId, lessonId }: { courseId: number; lessonId: number | null }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isCompany } = useRole()
  const editBase = isCompany ? '/studio/courses' : '/account/courses'
  const backTo = `${editBase}/${courseId}/edit?step=curriculum`
  // The module a new lesson goes into (kept in the address until it's in the outline).
  const targetModule = params.get('module') ? Number(params.get('module')) : null
  const newKind = params.get('kind')

  const [course, setCourse] = useState<MyCourse | null | undefined>(undefined)
  const [lesson, setLesson] = useState<CourseLesson | null | undefined>(lessonId === null ? null : undefined)
  const kind: CourseLessonType = lesson?.kind ?? (isLessonType(newKind) ? newKind : 'text')
  const [fields, setFields] = useState<Fields>(() => fieldsOf(null, kind))
  const [initial, setInitial] = useState(() => JSON.stringify(fieldsOf(null, kind)))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  // The text toolbar is pinned right under the lesson bar: the bar's bottom line is hidden so only the toolbar's edge shows.
  const [toolbarPinned, setToolbarPinned] = useState(false)
  // Set just before navigating away on purpose (after the first save), so the unsaved-changes guard lets it through.
  const leaving = useRef(false)
  const dirty = JSON.stringify(fields) !== initial

  useEffect(() => {
    let cancelled = false
    apiFetch<MyCourse>(`/api/learning/me/courses/${courseId}/`)
      .then(c => { if (!cancelled) setCourse(c) })
      .catch(() => { if (!cancelled) setCourse(null) })
    if (lessonId !== null) {
      apiFetch<CourseLesson>(`/api/learning/me/courses/${courseId}/lessons/${lessonId}/`)
        .then(l => {
          if (cancelled) return
          setLesson(l)
          const f = fieldsOf(l, l.kind)
          setFields(f)
          setInitial(JSON.stringify(f))
        })
        .catch(() => { if (!cancelled) setLesson(null) })
    }
    return () => { cancelled = true }
  }, [courseId, lessonId])

  // Warn before closing the tab with unsaved edits, and confirm before leaving the page in the app.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    dirty && !leaving.current && currentLocation.pathname !== nextLocation.pathname)

  if (course === null || (lessonId !== null && lesson === null)) return <Navigate to={backTo} replace />
  if (course === undefined || lesson === undefined) return <div className="min-h-screen" />

  const { label, icon: Icon } = COURSE_LESSON_TYPES[kind]
  const live = course.status === 'published'
  const isVideo = kind === 'video'
  const isQuiz = kind === 'quiz'

  // Where the lesson sits: "Module 2 › Lesson 3", or the module a new one is going into.
  const item = lesson ? course.items.find(i => i.kind === 'lesson' && i.id === lesson.id) : undefined
  const moduleIndex = course.modules.findIndex(m => m.id === (item?.module_id ?? targetModule))
  const lessonIndex = item ? course.items.filter(i => i.module_id === item.module_id).indexOf(item) : -1
  const crumb = moduleIndex >= 0
    ? `Module ${moduleIndex + 1} › ${lessonIndex >= 0 ? `Lesson ${lessonIndex + 1}` : 'New lesson'}`
    : lesson ? 'Not in a module yet' : 'New lesson'

  const set = (next: Partial<Fields>) => { setFields(prev => ({ ...prev, ...next })); setFormError(''); setNotice('') }

  /** Puts a lesson into its module (the one it was added to, or the last). Returns a problem to show, or ''. */
  async function placeInOutline(saved: CourseLesson): Promise<string> {
    if (!course) return ''
    const ref = { kind: 'lesson' as const, id: saved.id }
    const target = course.modules.some(m => m.id === targetModule) ? targetModule : course.modules.at(-1)?.id ?? null
    const modules = course.modules.length
      ? course.modules.map(m => ({
        id: m.id, title: m.title, summary: m.summary,
        items: [...course.items.filter(i => i.module_id === m.id).map(i => ({ kind: i.kind, id: i.id })), ...(m.id === target ? [ref] : [])],
      }))
      : [{ id: null, title: 'Module 1', summary: '', items: [ref] }]
    try {
      setCourse(await apiFetch<MyCourse>(`/api/learning/me/courses/${course.id}/outline/`, { method: 'PUT', body: { modules, loose_items: [] } }))
      return ''
    } catch (err) {
      const message = err instanceof ApiError ? Object.values(err.fields)[0] ?? err.message : ''
      return `Saved, but it isn't in a module yet${message ? `: ${message}` : '.'} Finish it and save again, or place it from Curriculum.`
    }
  }

  async function submit(e?: FormEvent) {
    e?.preventDefault()
    if (fields.title.trim().length < 3) {
      setErrors({ title: 'Give the lesson a title of at least 3 characters.' })
      return
    }
    const { pass_mark: passMarkText, questions: typed, ...common } = fields
    let quiz = {}
    if (isQuiz) {
      const passMark = Number(passMarkText)
      if (!Number.isInteger(passMark) || passMark < 1 || passMark > 100) {
        setErrors({ pass_mark: 'Choose a pass mark from 1 to 100%.' })
        return
      }
      const questions = typed.filter(q => !isBlank(q))
        .map(q => ({ ...q, options: q.options.map(o => o.trim()), explanation: q.explanation.trim() }))
      const problem = quizProblem(questions)
      if (problem) {
        setErrors({})
        setFormError(problem)
        return
      }
      quiz = { pass_mark: passMark, questions }
    }
    setSaving(true)
    setErrors({})
    setFormError('')
    setNotice('')
    const created = !lesson
    try {
      const { course_revision: revision, ...saved } = await apiFetch<CourseLessonSaved>(
        created ? `/api/learning/me/courses/${courseId}/lessons/` : `/api/learning/me/courses/${courseId}/lessons/${lesson.id}/`,
        { method: created ? 'POST' : 'PATCH', body: { ...common, ...quiz, title: fields.title.trim(), ...(created ? { kind } : {}) } },
      )
      // A new lesson joins its module straight away (on a live course once it's finished, as Genex reviews it then).
      const problem = saved.in_outline || (live && saved.problem) ? '' : await placeInOutline(saved)
      if (created) {
        leaving.current = true
        const keep = targetModule !== null && (problem || (live && saved.problem)) ? `?module=${targetModule}` : ''
        navigate(`${editBase}/${courseId}/lessons/${saved.id}${keep}`, { replace: true })
        return
      }
      setLesson(saved)
      const f = fieldsOf(saved, saved.kind)
      setFields(f)
      setInitial(JSON.stringify(f))
      if (problem) setFormError(problem)
      else setNotice(live && saved.approved && revision?.status === 'pending' ? 'Saved. Your edits are with Genex for review.' : 'Saved.')
      if (live && saved.problem && !saved.in_outline) setNotice(`Saved. Finish it to add it to the course: ${saved.problem}.`)
    } catch (err) {
      const found = err instanceof ApiError ? err.fields : {}
      setErrors(found)
      const other = Object.entries(found).find(([name]) => !FIELD_NAMES.has(name))?.[1]
      setFormError(other ?? (Object.keys(found).length ? '' : err instanceof ApiError ? err.message : "Couldn't save the lesson. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const link = fields.video_url.trim()
  const embed = link ? embedVideoUrl(link) : null
  const saveLabel = saving ? 'Saving…' : !lesson ? 'Create lesson' : live && lesson.approved ? 'Send for review' : 'Save lesson'
  const previewSwitch = (
    <label className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary cursor-pointer" title="Visitors can open this lesson before they enroll">
      <input type="checkbox" role="switch" checked={fields.is_preview} onChange={e => set({ is_preview: e.target.checked })}
        className="size-4 accent-primary" />
      Free preview
    </label>
  )

  return (
    <>
    <form onSubmit={submit} className="flex flex-col gap-5" aria-label={`${lesson ? 'Edit' : 'New'} ${label.toLowerCase()}`}>
      <PageMeta title={lesson ? `Edit: ${lesson.title}` : `New ${label.toLowerCase()}`} description="Write a course lesson." canonical={backTo} noIndex />

      {/* Lesson bar: a fixed height, so the text toolbar can stick just under it (top-42 = header 6rem + bar 4rem + a 0.5rem gap). */}
      <div className={cn('sticky top-24 z-20 -mx-1 flex h-16 items-center gap-3 border-b bg-white px-1', toolbarPinned ? 'border-transparent' : 'border-border')}>
        <Link to={backTo} aria-label="Back to Curriculum"
          className="size-9 shrink-0 rounded-lg border border-border flex items-center justify-center text-text-primary hover:border-primary hover:text-primary">
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-text-muted">
            <Link to={backTo} className="hover:text-primary">Curriculum</Link> · {crumb}
          </p>
          <h2 className="flex min-w-0 items-center gap-2 text-base font-extrabold text-text-primary">
            <span className="truncate">{fields.title.trim() || lesson?.title || `New ${label.toLowerCase()}`}</span>
            <span className={cn('hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold', TYPE_CHIP[kind])}>
              <Icon sx={{ fontSize: 14 }} /> {label}
            </span>
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-4">
          {previewSwitch}
          <span role="status" className={cn('inline-flex items-center gap-1.5 text-xs font-bold', dirty ? 'text-amber-700' : 'text-emerald-700')}>
            {dirty
              ? <><span className="size-2 rounded-full bg-amber-500" />Unsaved changes</>
              : lesson ? <><CloudDoneOutlinedIcon sx={{ fontSize: 16 }} />Saved</> : null}
          </span>
        </div>
        <Button type="submit" variant="primary" size="sm" disabled={saving || (lesson !== null && !dirty)}>{saveLabel}</Button>
      </div>

      {(formError || notice) && (
        <p role={formError ? 'alert' : 'status'} className={cn('flex gap-2 rounded-xl border px-4 py-3 text-sm',
          formError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900')}>
          {formError ? <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0" /> : <CheckCircleIcon sx={{ fontSize: 18 }} className="shrink-0" />}
          {formError || notice}
        </p>
      )}

      {live && (
        <p className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <InfoOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0" />
          <span>
            {lesson?.approved
              ? <><b>This lesson is live.</b> Your edits go to Genex for review, and learners keep the current version until they&apos;re approved. Free preview changes apply straight away.</>
              : <><b>This course is live.</b> A new lesson goes to Genex for review once it&apos;s finished and saved.</>}
          </span>
        </p>
      )}

      {lesson?.problem && !formError && (
        <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0" /> To finish this lesson: {lesson.problem}.
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lesson-title" className="text-sm font-semibold text-text-primary">{isQuiz ? 'Quiz title' : 'Lesson title'}</label>
        <input id="lesson-title" value={fields.title} maxLength={200} placeholder={TITLE_PLACEHOLDER[kind]} autoFocus={!lesson}
          aria-invalid={Boolean(errors.title) || undefined}
          onChange={e => set({ title: e.target.value })}
          className={cn(fieldClass, 'text-xl font-extrabold py-2.5', errors.title && 'border-red-500')} />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>
      <div className="md:hidden">{previewSwitch}</div>

      {kind === 'text' && (
        <RichTextEditor label="Lesson text" value={fields.body} onChange={html => set({ body: html })} error={errors.body}
          minHeightClassName="min-h-96" stickyToolbar="top-40" wordCount onToolbarPinned={setToolbarPinned} />
      )}

      {isVideo && (
        <>
          <section className="bg-white border border-border rounded-2xl p-5 flex flex-col gap-4">
            <header>
              <h3 className="text-base font-extrabold text-text-primary">Video</h3>
              <p className="text-xs text-text-muted">YouTube or Vimeo. Unlisted videos work; private ones don&apos;t.</p>
            </header>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lesson-video" className="text-sm font-semibold text-text-primary">Video link</label>
              <input id="lesson-video" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={fields.video_url}
                aria-invalid={Boolean(errors.video_url) || (Boolean(link) && !embed) || undefined} aria-describedby="lesson-video-check"
                onChange={e => set({ video_url: e.target.value })}
                className={cn(fieldClass, (errors.video_url || (link && !embed)) && 'border-amber-500')} />
              <p id="lesson-video-check" aria-live="polite" className="text-xs">
                {errors.video_url
                  ? <span className="font-semibold text-red-600">{errors.video_url}</span>
                  : !link
                    ? <span className="text-text-muted">Paste the link from the address bar or the Share button.</span>
                    : embed
                      ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-700"><CheckCircleIcon sx={{ fontSize: 15 }} />
                          {embed.includes('vimeo') ? 'Vimeo' : 'YouTube'} video found. It plays inside the lesson.</span>
                      : <span className="inline-flex items-center gap-1 font-semibold text-amber-800"><WarningAmberOutlinedIcon sx={{ fontSize: 15 }} />
                          This isn&apos;t a YouTube or Vimeo link, so it can&apos;t play inside the lesson. Learners would open it in a new tab.</span>}
              </p>
            </div>
            {embed && (
              <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-slate-900">
                <iframe src={embed} title="Video preview" className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen />
              </div>
            )}
            <div className="flex flex-col gap-1.5 sm:max-w-xs">
              <label htmlFor="lesson-duration" className="flex justify-between gap-2 text-sm font-semibold text-text-primary">
                Length <span className="font-normal text-text-muted">minutes:seconds</span>
              </label>
              <input id="lesson-duration" placeholder="e.g. 12:40" maxLength={20} inputMode="numeric" value={fields.duration}
                onChange={e => set({ duration: e.target.value })} className={cn(fieldClass, errors.duration && 'border-red-500')} />
              {errors.duration
                ? <p className="text-xs text-red-500">{errors.duration}</p>
                : <p className="text-xs text-text-muted">Shown to learners and added to the course&apos;s total time.</p>}
            </div>
          </section>
          <details open={Boolean(fields.body.replace(/<[^>]*>/g, '').trim()) || undefined} className="group bg-white border border-border rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 details-marker-hidden">
              <StickyNote2OutlinedIcon sx={{ fontSize: 19 }} className="text-primary" />
              <span className="text-sm font-extrabold text-text-primary">Notes for learners</span>
              <span className="text-xs text-text-muted">Optional · shown under the video</span>
              <ExpandMoreIcon sx={{ fontSize: 20 }} className="ml-auto text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5">
              <RichTextEditor ariaLabel="Notes for learners" value={fields.body} onChange={html => set({ body: html })} error={errors.body}
                minHeightClassName="min-h-32" />
            </div>
          </details>
        </>
      )}

      {isQuiz && (
        <>
          <details open={Boolean(fields.body.replace(/<[^>]*>/g, '').trim()) || undefined} className="group bg-white border border-border rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 details-marker-hidden">
              <StickyNote2OutlinedIcon sx={{ fontSize: 19 }} className="text-primary" />
              <span className="text-sm font-extrabold text-text-primary">Introduction</span>
              <span className="text-xs text-text-muted">Optional · shown before the first question</span>
              <ExpandMoreIcon sx={{ fontSize: 20 }} className="ml-auto text-text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5">
              <RichTextEditor ariaLabel="Quiz introduction" value={fields.body} onChange={html => set({ body: html })} error={errors.body}
                minHeightClassName="min-h-24" />
            </div>
          </details>
          <QuizEditor questions={fields.questions} onChange={questions => set({ questions })}
            passMark={fields.pass_mark} onPassMark={pass_mark => set({ pass_mark })} passMarkError={errors.pass_mark} />
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm font-bold text-text-muted hover:text-primary">
          <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Curriculum
        </Link>
        <Button type="submit" variant="primary" size="md" disabled={saving || (lesson !== null && !dirty)}>{saveLabel}</Button>
      </div>
    </form>

    {/* Outside the form: its buttons would otherwise submit the lesson. */}
    {blocker.state === 'blocked' && (
      <ConfirmDialog title="Leave without saving?" description="Your changes to this lesson haven't been saved and will be lost."
        confirmLabel="Leave without saving" onCancel={() => blocker.reset()} onConfirm={() => blocker.proceed()} />
    )}
    </>
  )
}
