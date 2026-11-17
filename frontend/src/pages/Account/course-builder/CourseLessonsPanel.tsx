import { useEffect, useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlineOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { COURSE_LESSON_TYPES } from '@/components/gelearn/courseItemKinds'
import { apiFetch } from '@/lib/api/client'
import { ConfirmDialog } from '@/pages/Account/dashboard/ConfirmDialog'
import type { CourseLesson, CourseLessonType, CourseTarget, MyCourse } from '@/types/learning'
import { BuilderCard } from './parts'
import { LIMITS, allLessons, formatMinutes, keyOf, type Draft } from './draft'
import { LessonEditor } from './LessonEditor'

type Patch = (next: Partial<Draft>) => void

const NEW_TYPES: CourseLessonType[] = ['text', 'video']

/**
 * Lessons written inside this course: they live only here, open only for its
 * learners and are reviewed with it. Each is saved as soon as it's written;
 * placing it in the outline is saved with the course, like any other lesson.
 */
export function CourseLessonsPanel({ n, course, draft, patch, onLessonSaved, onLessonDeleted, openOnLoad, onStartWithoutCourse, starting }: {
  n: number
  /** null until the course is first saved. */
  course: MyCourse | null
  /** Open a new lesson of this type straight away (the first lesson, just after the draft was saved for it). */
  openOnLoad: CourseLessonType | null
  /** A new lesson on an unsaved course: the builder saves the draft first. Returns why it can't, if it can't. */
  onStartWithoutCourse: (kind: CourseLessonType) => string | null
  /** That first save is in progress. */
  starting: boolean
  draft: Draft
  patch: Patch
  /** Keeps the outline's copy of a lesson (title, length…) in step after an edit. */
  onLessonSaved: (card: CourseTarget) => void
  /** The server already took it out of the outline. */
  onLessonDeleted: (card: CourseTarget) => void
}) {
  const [lessons, setLessons] = useState<CourseLesson[] | null>(null)
  const [editing, setEditing] = useState<{ lesson: CourseLesson | null; kind: CourseLessonType } | null>(
    () => (openOnLoad && course ? { lesson: null, kind: openOnLoad } : null),
  )
  const [deleting, setDeleting] = useState<{ lesson: CourseLesson; busy: boolean } | null>(null)
  const [error, setError] = useState('')
  const courseId = course?.id ?? null

  useEffect(() => {
    if (courseId === null) return
    apiFetch<CourseLesson[]>(`/api/learning/me/courses/${courseId}/lessons/`).then(setLessons).catch(() => setLessons([]))
  }, [courseId])

  const live = course?.status === 'published'
  const inOutline = new Set(allLessons(draft).map(keyOf))
  const full = inOutline.size >= LIMITS.items

  // New lessons go at the end of the last module, or the plain list when there are no modules.
  const place = (card: CourseTarget) => {
    if (full || inOutline.has(keyOf(card))) return
    const last = draft.modules.length - 1
    if (last >= 0) patch({ modules: draft.modules.map((m, i) => (i === last ? { ...m, items: [...m.items, card] } : m)) })
    else patch({ loose: [...draft.loose, card] })
  }

  function saved(lesson: CourseLesson, created: boolean) {
    setLessons(prev => (created ? [...(prev ?? []), lesson] : (prev ?? []).map(l => (l.id === lesson.id ? lesson : l))))
    setEditing(null)
    if (created) place(lesson.card)
    else onLessonSaved(lesson.card)
  }

  function start(kind: CourseLessonType) {
    setError('')
    if (courseId !== null) {
      setEditing({ lesson: null, kind })
      return
    }
    const problem = onStartWithoutCourse(kind)
    if (problem) setError(problem)
  }

  async function remove() {
    if (!deleting || !courseId) return
    const { lesson } = deleting
    setDeleting({ lesson, busy: true })
    try {
      await apiFetch(`/api/learning/me/courses/${courseId}/lessons/${lesson.id}/`, { method: 'DELETE' })
      setLessons(prev => (prev ?? []).filter(l => l.id !== lesson.id))
      onLessonDeleted(lesson.card)
      setDeleting(null)
    } catch {
      setError("Couldn't delete the lesson. Please try again.")
      setDeleting(null)
    }
  }

  return (
    <BuilderCard n={n} title="Lessons written for this course" hint="Text and video lessons for this course's learners, and free previews">
      {live && (
        <p className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-xs text-sky-900">
          <LockOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0 mt-px" />
          This course is live, so its lessons can't be changed yet. Editing lessons of a live course is coming in the next update.
        </p>
      )}
      {courseId === null && (
        <p className="text-sm text-text-muted">
          Write lessons right here, without publishing them anywhere else on GeLearn. Only this course&apos;s learners see them.
        </p>
      )}
      {lessons !== null && lessons.length > 0 && (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {lessons.map(lesson => {
            const { icon: Icon, label } = COURSE_LESSON_TYPES[lesson.kind]
            const placed = inOutline.has(keyOf(lesson.card))
            return (
              <li key={lesson.id} className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 px-3 py-2.5">
                <span className="flex items-center gap-3 min-w-0 w-full sm:w-auto sm:flex-1">
                  <Icon sx={{ fontSize: 19 }} className="text-sky-700 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-text-primary truncate">{lesson.title}</span>
                    <span className="block text-xs text-text-muted truncate">
                      {[label, lesson.kind === 'video' ? lesson.duration : lesson.minutes ? `about ${formatMinutes(lesson.minutes)}` : '',
                        lesson.is_preview ? 'Free preview' : '']
                        .filter(Boolean).join(' · ')}
                    </span>
                    {lesson.problem && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-800">
                        <WarningAmberOutlinedIcon sx={{ fontSize: 14 }} /> To finish: {lesson.problem}
                      </span>
                    )}
                  </span>
                </span>
                <span className="flex items-center gap-1 ml-auto shrink-0">
                  {placed
                    ? <span className="text-xs font-bold text-emerald-700 px-2">In the outline</span>
                    : !live && (
                      <button type="button" onClick={() => place(lesson.card)} disabled={full}
                        className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-bold text-primary hover:border-primary disabled:opacity-50">
                        <AddCircleOutlineIcon sx={{ fontSize: 15 }} /> Add to outline
                      </button>
                    )}
                  {!live && (
                    <>
                      <button type="button" onClick={() => setEditing({ lesson, kind: lesson.kind })} aria-label={`Edit ${lesson.title}`}
                        className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface hover:text-text-primary">
                        <EditOutlinedIcon sx={{ fontSize: 17 }} />
                      </button>
                      <button type="button" onClick={() => setDeleting({ lesson, busy: false })} aria-label={`Delete ${lesson.title}`}
                        className="size-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-600">
                        <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                      </button>
                    </>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {!live && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-text-primary">New lesson:</span>
          {NEW_TYPES.map(type => {
            const { icon: Icon, label } = COURSE_LESSON_TYPES[type]
            return (
              <button key={type} type="button" onClick={() => start(type)} disabled={full || starting || (courseId !== null && lessons === null)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-bold text-text-primary hover:border-primary hover:text-primary disabled:opacity-50">
                <Icon sx={{ fontSize: 16 }} /> {label}
              </button>
            )
          })}
          {starting && <span role="status" className="text-xs font-semibold text-text-muted">Saving the course as a draft…</span>}
        </div>
      )}
      {!live && (
        <p className="text-xs text-text-muted">
          {courseId === null
            ? 'Starting the first lesson saves the course as a draft, so the lesson has a course to belong to.'
            : 'New lessons are added at the end of the outline. Save the course to keep the outline.'}
        </p>
      )}
      {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}

      {editing && courseId !== null && (
        <LessonEditor courseId={courseId} lesson={editing.lesson} kind={editing.kind}
          onClose={() => setEditing(null)} onSaved={saved} />
      )}
      {deleting && (
        <ConfirmDialog title={`Delete “${deleting.lesson.title}”?`}
          description="The lesson is deleted for good and taken out of the course outline."
          confirmLabel="Delete lesson" confirming={deleting.busy}
          onCancel={() => setDeleting(null)} onConfirm={remove} />
      )}
    </BuilderCard>
  )
}
