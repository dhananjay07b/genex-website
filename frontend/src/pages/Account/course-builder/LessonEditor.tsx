import { useEffect, useRef, useState, type FormEvent } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { COURSE_LESSON_TYPES } from '@/components/gelearn/courseItemKinds'
import { apiFetch, ApiError } from '@/lib/api/client'
import { embedVideoUrl } from '@/lib/utils'
import type { CourseLesson, CourseLessonSaved, CourseLessonType, QuizQuestion } from '@/types/learning'
import { QuizEditor } from './QuizEditor'
import { blankQuestion, quizProblem } from './quiz'

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

/** Field errors the form has no field for (e.g. "detail") are shown as the form's message. */
const FIELD_NAMES = new Set(['title', 'video_url', 'duration', 'body'])

/**
 * Writes or edits one of the course's own lessons. It's saved straight away
 * (POST or PATCH), separately from the rest of the builder; a new lesson is then
 * placed in the outline, which the builder saves with the course. On a live
 * course, edits to an approved lesson wait for Genex review.
 */
export function LessonEditor({ courseId, lesson, kind, live, onClose, onSaved }: {
  courseId: number
  /** null for a new lesson of `kind`. */
  lesson: CourseLesson | null
  kind: CourseLessonType
  /** The course is live: changes to its approved lessons go to Genex for review. */
  live: boolean
  onClose: () => void
  onSaved: (lesson: CourseLessonSaved, created: boolean) => void
}) {
  const [fields, setFields] = useState<Fields>(() => fieldsOf(lesson, kind))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const [initial] = useState(() => JSON.stringify(fieldsOf(lesson, kind)))
  const dirty = JSON.stringify(fields) !== initial
  const type = lesson?.kind ?? kind
  const { label, icon: Icon } = COURSE_LESSON_TYPES[type]
  const isVideo = type === 'video'
  const isQuiz = type === 'quiz'
  const link = fields.video_url.trim()
  const plays = link ? embedVideoUrl(link) !== null : true

  // On opening only: focus the title and stop the page behind from scrolling. (Re-focusing on later renders
  // would pull the cursor out of the lesson text mid-typing.)
  useEffect(() => {
    titleRef.current?.focus()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow }
  }, [])

  // Escape closes only while nothing is typed, so a stray key never loses a lesson.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !dirty) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, dirty])

  const set = (next: Partial<Fields>) => { setFields(prev => ({ ...prev, ...next })); setFormError('') }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (fields.title.trim().length < 3) {
      setErrors({ title: 'Give the lesson a title of at least 3 characters.' })
      return
    }
    const { pass_mark: passMarkText, questions: typed, ...common } = fields
    let quiz = {}
    if (isQuiz) {
      const passMark = Number(passMarkText)
      if (!Number.isInteger(passMark) || passMark < 1 || passMark > 100) {
        setErrors({ pass_mark: 'Enter a whole number from 1 to 100.' })
        return
      }
      const questions = typed.filter(q => !isBlank(q))
      const problem = quizProblem(questions)
      if (problem) {
        setErrors({})
        setFormError(problem)
        return
      }
      quiz = { pass_mark: passMark, questions: questions.map(q => ({ ...q, options: q.options.map(o => o.trim()) })) }
    }
    setSaving(true)
    setErrors({})
    setFormError('')
    const body = { ...common, ...quiz, title: fields.title.trim(), ...(lesson ? {} : { kind: type }) }
    try {
      const saved = await apiFetch<CourseLessonSaved>(
        lesson ? `/api/learning/me/courses/${courseId}/lessons/${lesson.id}/` : `/api/learning/me/courses/${courseId}/lessons/`,
        { method: lesson ? 'PATCH' : 'POST', body },
      )
      onSaved(saved, !lesson)
    } catch (err) {
      const found = err instanceof ApiError ? err.fields : {}
      setErrors(found)
      const other = Object.entries(found).find(([name]) => !FIELD_NAMES.has(name) && name !== 'pass_mark')?.[1]
      setFormError(other ?? (Object.keys(found).length ? '' : err instanceof ApiError ? err.message : "Couldn't save the lesson. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-dark-bg/45 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget && !dirty) onClose() }}>
      <form onSubmit={submit} role="dialog" aria-modal="true" aria-labelledby="lesson-editor-title"
        className="w-full max-w-3xl my-6 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
          <h2 id="lesson-editor-title" className="flex items-center gap-2 text-base font-extrabold text-text-primary">
            <Icon sx={{ fontSize: 20 }} className="text-sky-700" />
            {lesson ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close without saving"
            className="size-9 rounded-lg flex items-center justify-center text-text-primary hover:bg-surface shrink-0">
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          <Input ref={titleRef} label="Lesson title" placeholder={isVideo ? 'e.g. Testing a feeder relay' : isQuiz ? 'e.g. Check your understanding: relay basics' : 'e.g. Why protection relays trip'}
            maxLength={200} value={fields.title} error={errors.title} onChange={e => set({ title: e.target.value })} />

          {isVideo && (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Video link" placeholder="https://www.youtube.com/watch?v=…" type="url" inputMode="url"
                    value={fields.video_url} error={errors.video_url} onChange={e => set({ video_url: e.target.value })} />
                </div>
                <Input label="Length" placeholder="e.g. 14:32" maxLength={20}
                  value={fields.duration} error={errors.duration} onChange={e => set({ duration: e.target.value })} />
              </div>
              <p className="flex gap-2 text-xs text-text-muted leading-relaxed">
                <InfoOutlinedIcon sx={{ fontSize: 15 }} className="text-primary shrink-0 mt-px" />
                {plays
                  ? 'Use an unlisted YouTube or Vimeo link, so the video plays inside the lesson and isn’t listed on those sites.'
                  : 'Only YouTube and Vimeo links play inside the lesson. Learners open this link in a new tab instead.'}
              </p>
            </div>
          )}

          <RichTextEditor label={isVideo ? 'Notes under the video (optional)' : isQuiz ? 'Introduction (optional)' : 'Lesson text'}
            value={fields.body} onChange={html => set({ body: html })} error={errors.body}
            minHeightClassName={isVideo || isQuiz ? 'min-h-32' : 'min-h-80'} />

          {isQuiz && (
            <QuizEditor questions={fields.questions} onChange={questions => set({ questions })}
              passMark={fields.pass_mark} onPassMark={pass_mark => set({ pass_mark })} passMarkError={errors.pass_mark} />
          )}

          <label className="flex items-start gap-3 rounded-xl border border-border px-4 py-3 cursor-pointer hover:border-primary">
            <input type="checkbox" checked={fields.is_preview} onChange={e => set({ is_preview: e.target.checked })}
              className="mt-0.5 size-4 accent-primary" />
            <span>
              <span className="block text-sm font-semibold text-text-primary">Free preview</span>
              <span className="block text-xs text-text-muted leading-relaxed">
                Anyone can open this lesson from the course page before enrolling, so they can try the course.
              </span>
            </span>
          </label>

          {live && lesson?.approved ? (
            <p className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900 leading-relaxed">
              <InfoOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0 mt-px" />
              <span>
                <b>This lesson is live.</b> Your edits go to Genex for review, and learners keep seeing the current version until
                they&apos;re approved. Turning free preview on or off applies straight away.
              </span>
            </p>
          ) : (
            <p className="text-xs text-text-muted leading-relaxed">
              {fields.is_preview
                ? 'Everyone else can open it only after enrolling.'
                : 'Only learners of this course can open it.'}{' '}
              {live
                ? 'It goes to Genex for review once it’s in the outline and you save the course.'
                : 'Genex reviews it with the rest of the course before it goes live.'}
            </p>
          )}
          {formError && <p role="alert" className="text-sm font-semibold text-red-600">{formError}</p>}
        </div>

        <div className="flex flex-wrap justify-end gap-3 px-5 py-4 border-t border-border bg-surface">
          <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="primary" size="md" disabled={saving || (lesson !== null && !dirty)}>
            {saving ? 'Saving…' : !lesson ? 'Create lesson' : live && lesson.approved ? 'Send for review' : 'Save lesson'}
          </Button>
        </div>
      </form>
    </div>
  )
}
