import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined'
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import { cn } from '@/lib/utils'
import { PageMeta } from '@/components/seo/PageMeta'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/context/useAuth'
import { apiFetch, ApiError } from '@/lib/api/client'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/pages/Account/dashboard/ConfirmDialog'
import type { CourseLesson, CourseLessonType, CourseRevisionInfo, CourseStatus, CourseTarget, MyCourse } from '@/types/learning'
import { BasicsCard, WhatLearnersGetCard } from './cards'
import { CurriculumStep } from './CurriculumStep'
import { FurtherReadingStep } from './FurtherReadingStep'
import { SettingsStep } from './SettingsStep'
import { PreviewModal } from './PreviewModal'
import {
  allLessons, changes, draftFromCourse, emptyDraft, faqsPayload, keyOf, keptModules, mapItems, metaPayload, needsReview,
  outlinePayload, readingPayload, type Draft, type StepKey,
} from './draft'

const STATUS_CHIP: Record<CourseStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface text-text-primary border border-border' },
  pending: { label: 'In review', className: 'bg-sky-100 text-sky-800' },
  published: { label: 'Live', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Needs changes', className: 'bg-amber-100 text-amber-800' },
}

const STEPS: { key: StepKey; label: string; optional?: boolean }[] = [
  { key: 'details', label: 'Details' },
  { key: 'curriculum', label: 'Curriculum' },
  { key: 'reading', label: 'Further reading', optional: true },
  { key: 'settings', label: 'Settings & publish' },
]

const isStep = (value: string | null): value is StepKey => STEPS.some(s => s.key === value)

/** Which step holds each field the server (or the builder) can complain about. */
const FIELD_STEP: Record<string, StepKey> = {
  title: 'details', summary: 'details', description: 'details', language: 'details', outcomes: 'details', prerequisites: 'details',
  items: 'curriculum', modules: 'curriculum', loose_items: 'curriculum',
  reading: 'reading',
  price: 'settings', access: 'settings', level: 'settings', topics: 'settings', roles: 'settings', instructors: 'settings', faqs: 'settings',
}

/** Set by the first lesson on an unsaved course: once the draft is saved, open that lesson's editor in that module. */
interface OpenLesson { kind: CourseLessonType; module: number }

/** Keyed by route so switching between courses always starts fresh. */
export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>()
  return <CourseBuilderForm key={id ?? 'new'} id={id} />
}

/**
 * The course builder, shared by Professionals (inside My account) and Company
 * accounts (inside Company Studio), in four steps: Details, Curriculum (modules
 * of text, video and quiz lessons), Further reading (optional) and Settings &
 * publish. A sticky bar keeps Save, Preview and Submit in reach on every step.
 */
function CourseBuilderForm({ id }: { id: string | undefined }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const step: StepKey = isStep(params.get('step')) ? (params.get('step') as StepKey) : 'details'
  const [openLesson, setOpenLesson] = useState<OpenLesson | null>(() => (location.state as { openLesson?: OpenLesson } | null)?.openLesson ?? null)
  // Read once: drop it from history so a reload doesn't open the editor again.
  useEffect(() => {
    if (openLesson) navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [openLesson, navigate, location.pathname, location.search])
  const { isCompany } = useRole()
  const { user } = useAuth()
  const coursesHome = isCompany ? '/studio/courses' : '/account?tab=courses'
  const editBase = isCompany ? '/studio/courses' : '/account/courses'
  const isEditing = Boolean(id)
  const topRef = useRef<HTMLDivElement>(null)

  const [course, setCourse] = useState<MyCourse | null | undefined>(isEditing ? undefined : null)
  const [saved, setSaved] = useState<Draft>(emptyDraft)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [lessons, setLessons] = useState<CourseLesson[] | null>(null)
  const [library, setLibrary] = useState<CourseTarget[] | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null)
  const [previewing, setPreviewing] = useState(false)
  const [withdrawing, setWithdrawing] = useState<'ask' | 'busy' | null>(null)
  // Bumped when the course lessons should be fetched again (withdrawing drops their edits waiting for review).
  const [lessonsKey, setLessonsKey] = useState(0)

  const load = (loaded: MyCourse) => {
    const d = draftFromCourse(loaded)
    setCourse(loaded)
    setSaved(d)
    setDraft(d)
  }

  useEffect(() => {
    apiFetch<CourseTarget[]>('/api/learning/me/library/').then(setLibrary).catch(() => setLibrary([]))
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    apiFetch<MyCourse>(`/api/learning/me/courses/${id}/`)
      .then(loaded => { if (!cancelled) load(loaded) })
      .catch(() => { if (!cancelled) setCourse(null) })
    return () => { cancelled = true }
  }, [id])

  const courseId = course?.id ?? null
  useEffect(() => {
    if (courseId === null) return
    let cancelled = false
    apiFetch<CourseLesson[]>(`/api/learning/me/courses/${courseId}/lessons/`)
      .then(rows => { if (!cancelled) setLessons(rows) })
      .catch(() => { if (!cancelled) setLessons([]) })
    return () => { cancelled = true }
  }, [courseId, lessonsKey])

  const changed = changes(saved, draft)
  const coverPreview = useMemo(() => (cover ? URL.createObjectURL(cover) : null), [cover])
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview) }, [coverPreview])
  const dirty = changed.any || cover !== null
  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  if (isEditing && course === null) return <Navigate to={coursesHome} replace />
  if (isEditing && course === undefined) return <div className="min-h-screen" />

  const goTo = (next: StepKey) => {
    setOpenLesson(null) // only the first visit to Curriculum after saving opens the new lesson
    setParams(prev => { const p = new URLSearchParams(prev); p.set('step', next); return p }, { replace: true })
    topRef.current?.scrollIntoView({ block: 'start' })
  }
  const patch = (next: Partial<Draft>) => { setDraft(prev => ({ ...prev, ...next })); setNotice('') }
  // A lesson needs a course to belong to: starting the first one on a new course saves the draft first.
  const startFirstLesson = (kind: CourseLessonType, module: number): string | null => {
    if (draft.title.trim().length < 3) {
      setErrors({ title: 'Give the course a title of at least 3 characters.' })
      return 'Give the course a title first (in Details). The course is then saved as a draft and your lesson opens.'
    }
    void save(false, { kind, module })
    return null
  }
  // A course lesson saved or deleted on the server: update (or drop) its copy in both the saved and edited outline,
  // so it neither shows as an unsaved change nor gets sent back after it's gone.
  const syncLesson = (card: CourseTarget, removed: boolean) => {
    const key = keyOf(card)
    const fn = (item: CourseTarget) => (keyOf(item) === key ? (removed ? null : card) : item)
    setSaved(prev => mapItems(prev, fn))
    setDraft(prev => mapItems(prev, fn))
  }
  // A lesson saved on a live course can send it for review (or, edited back, drop that): only the review status
  // is updated, so the rest of the builder keeps any unsaved edits.
  const setRevision = (revision: CourseRevisionInfo | null) => {
    setCourse(prev => (prev ? { ...prev, revision } : prev))
    if (revision?.status === 'pending' && !course?.revision) setNotice('Saved. Your changes are with Genex for review.')
  }
  const status = course?.status ?? null
  const live = status === 'published'
  const lessonCount = allLessons(draft).length
  const unfinished = (lessons ?? []).filter(l => l.problem && allLessons(draft).some(i => i.id === l.id))
  const canSubmit = !live && status !== 'pending'

  function validate(submit: boolean) {
    const found: Record<string, string> = {}
    if (draft.title.trim().length < 3) found.title = 'Give the course a title of at least 3 characters.'
    if (draft.access === 'paid' && !(Number(draft.price) >= 1)) found.price = 'Enter a price of at least ₹1.'
    if (keptModules(draft).some(m => !m.title.trim())) found.items = 'Give every module a title, or delete the empty one.'
    if (submit && lessonCount === 0) found.items = 'Add at least one lesson to a module before submitting.'
    return found
  }

  function showErrors(found: Record<string, string>) {
    setErrors(found)
    const [field, message] = Object.entries(found)[0] ?? []
    setFormError(message ?? '')
    if (field && FIELD_STEP[field] && FIELD_STEP[field] !== step) goTo(FIELD_STEP[field])
  }

  async function save(submit: boolean, then?: OpenLesson) {
    const found = validate(submit)
    setNotice('')
    if (Object.keys(found).length) {
      showErrors(found)
      return
    }
    setErrors({})
    setFormError('')

    setSaving(submit ? 'submit' : 'draft')
    try {
      const first = !course
      let result = await apiFetch<MyCourse>(
        first ? '/api/learning/me/courses/' : `/api/learning/me/courses/${course.id}/`,
        { method: first ? 'POST' : 'PATCH', body: metaPayload(draft, isCompany) },
      )
      // Only send the parts that changed, so a live course isn't sent for review needlessly.
      if (first ? keptModules(draft).length > 0 : changed.outline) {
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/outline/`, { method: 'PUT', body: outlinePayload(draft) })
      }
      if (first ? draft.faqs.length > 0 : changed.faqs) {
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/faqs/`, { method: 'PUT', body: faqsPayload(draft) })
      }
      if (first ? draft.reading.length > 0 : changed.reading) {
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/reading/`, { method: 'PUT', body: readingPayload(draft) })
      }
      if (cover) {
        const form = new FormData()
        form.append('file', cover)
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/cover/`, { method: 'POST', body: form })
        setCover(null)
      }
      if (submit) {
        await apiFetch(`/api/learning/me/courses/${result.id}/submit/`, { method: 'POST' })
        navigate(coursesHome)
        return
      }
      if (first) {
        // The edit route loads the saved course (and enables Preview); the step stays the same.
        navigate(`${editBase}/${result.id}/edit${location.search}`, { replace: true, state: then ? { openLesson: then } : null })
        return
      }
      load(result)
      setNotice(result.revision?.status === 'pending' && !course?.revision ? 'Saved. Your changes are with Genex for review.' : 'Saved.')
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      if (Object.keys(fields).length) showErrors(fields)
      else setFormError(err instanceof ApiError ? err.message : "Couldn't save the course. Please try again.")
    } finally {
      setSaving(null)
    }
  }

  async function withdraw() {
    if (!course) return
    setWithdrawing('busy')
    try {
      load(await apiFetch<MyCourse>(`/api/learning/me/courses/${course.id}/revision/`, { method: 'DELETE' }))
      setLessonsKey(k => k + 1)
      setNotice('Changes withdrawn. The builder shows the live version again.')
    } catch {
      setFormError("Couldn't withdraw the changes. Please try again.")
    } finally {
      setWithdrawing(null)
    }
  }

  const revision = course?.revision ?? null
  const heading = isEditing ? 'Edit course' : 'New course'
  const chip = status ? STATUS_CHIP[status] : null
  const outcomes = draft.outcomes.filter(o => o.trim()).length
  const done: Record<StepKey, boolean> = {
    details: draft.title.trim().length >= 3 && draft.summary.trim().length > 0 && outcomes >= 2,
    curriculum: lessonCount > 0 && unfinished.length === 0 && keptModules(draft).every(m => m.title.trim()),
    reading: draft.reading.length > 0,
    settings: Boolean(cover || course?.cover_url) && draft.level !== '' && draft.topics.length > 0 && draft.roles.length > 0,
  }
  const stepIndex = STEPS.findIndex(s => s.key === step)
  const prev = STEPS[stepIndex - 1]
  const next = STEPS[stepIndex + 1]
  const submitBlocked = lessonCount === 0
    ? 'Add at least one lesson to submit.'
    : unfinished.length ? `Finish every lesson first. “${unfinished[0].title}”: ${unfinished[0].problem}.` : ''

  return (
    <div ref={topRef} className="scroll-mt-28">
      <PageMeta title={heading} description="Build a course." canonical={`${editBase}/new`} noIndex />

      {/* Sticky builder bar: where you are, save state and the main actions, on every step. */}
      <div className="lg:sticky lg:top-24 z-20 -mx-1 px-1 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1 pb-3 border-b border-border">
          <div className="min-w-0 flex-1">
            <Link to={coursesHome} className="inline-flex items-center gap-1 text-xs font-bold text-text-muted hover:text-primary">
              <ArrowBackIcon sx={{ fontSize: 14 }} /> {isCompany ? 'Company courses' : 'My Courses'}
            </Link>
            {/* The dashboard header holds the page <h1> (the person's or company's name). */}
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-text-primary">
              <span className="truncate max-w-full">{draft.title.trim() || heading}</span>
              {chip && <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', chip.className)}>{chip.label}</span>}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span role="status" className={cn('inline-flex items-center gap-1.5 text-xs font-bold', dirty ? 'text-amber-700' : 'text-emerald-700')}>
              {dirty
                ? <><span className="size-2 rounded-full bg-amber-500" />Unsaved changes</>
                : notice
                  ? <><CloudDoneOutlinedIcon sx={{ fontSize: 16 }} />{notice}</>
                  : course ? <><CloudDoneOutlinedIcon sx={{ fontSize: 16 }} />All changes saved</> : null}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={() => setPreviewing(true)}>
              <PreviewOutlinedIcon sx={{ fontSize: 17 }} /> Preview
            </Button>
            <Button type="button" variant={canSubmit ? 'secondary' : 'primary'} size="sm" disabled={saving !== null || (!dirty && status !== null)}
              onClick={() => save(false)}>
              {saving === 'draft' ? 'Saving…' : live ? 'Save changes' : 'Save draft'}
            </Button>
            {canSubmit && (
              <Button type="button" variant="primary" size="sm" disabled={saving !== null}
                onClick={() => (submitBlocked ? goTo('settings') : save(true))}>
                {saving === 'submit' ? 'Submitting…' : 'Submit for review'}
              </Button>
            )}
          </div>
        </div>

        <nav aria-label="Course builder steps" className="flex gap-1 overflow-x-auto py-2 border-b border-border">
          {STEPS.map((s, i) => {
            const current = s.key === step
            return (
              <button key={s.key} type="button" onClick={() => goTo(s.key)} aria-current={current ? 'step' : undefined}
                className={cn('flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition-colors',
                  current ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary font-semibold hover:bg-surface')}>
                <span className={cn('size-6 rounded-full flex items-center justify-center text-xs font-extrabold',
                  current ? 'bg-primary text-white' : 'bg-surface text-text-muted border border-border')}>{i + 1}</span>
                {s.label}
                {s.optional && <span className="rounded-full border border-border px-1.5 text-xs font-semibold text-text-muted">Optional</span>}
                {done[s.key] && <CheckCircleIcon sx={{ fontSize: 17 }} className="text-emerald-600" aria-label="Complete" />}
              </button>
            )
          })}
        </nav>
        {formError && <p role="alert" className="py-2 text-sm font-semibold text-red-600">{formError}</p>}
      </div>

      <div className="pt-5 flex flex-col gap-5">
        {status === 'rejected' && course?.rejection_reason && (
          <div role="status" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <FeedbackOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-700 shrink-0" />
            <p><b className="block">Genex sent this course back</b>&ldquo;{course.rejection_reason}&rdquo; Make the changes, then submit again.</p>
          </div>
        )}

        {live && revision && (
          <div role="status" className={cn('flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3.5 text-sm',
            revision.status === 'rejected' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900')}>
            {revision.status === 'rejected'
              ? <FeedbackOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-700 shrink-0" />
              : <HourglassEmptyOutlinedIcon sx={{ fontSize: 20 }} className="text-sky-700 shrink-0" />}
            <p className="flex-1 min-w-60">
              {revision.status === 'rejected' ? (
                <><b className="block">Genex sent your changes back</b>
                  {revision.rejection_reason && <>&ldquo;{revision.rejection_reason}&rdquo; </>}
                  Edit and save to send them again, or withdraw them. Learners still see the live version.</>
              ) : (
                <><b className="block">Your changes are waiting for Genex review</b>
                  Learners still see the live version. Once Genex approves, the changes replace it automatically. You can keep editing.</>
              )}
            </p>
            <Button type="button" variant="secondary" size="sm" onClick={() => setWithdrawing('ask')} disabled={withdrawing !== null}>
              Withdraw changes
            </Button>
          </div>
        )}

        {live && lessonCount === 0 && (
          <p role="status" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
            <FeedbackOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-700 shrink-0" />
            <span><b className="block">Needs lessons</b>Learners can&apos;t finish this course until it has text, video or quiz lessons. Add them in Curriculum.</span>
          </p>
        )}

        {step === 'details' && (
          <>
            <BasicsCard draft={draft} patch={patch} titleError={errors.title} />
            <WhatLearnersGetCard draft={draft} patch={patch} />
          </>
        )}
        {step === 'curriculum' && (
          <CurriculumStep courseId={courseId} live={live} revision={revision} draft={draft} patch={patch}
            lessons={lessons} setLessons={setLessons} error={errors.items ?? errors.modules ?? errors.loose_items}
            starting={saving === 'draft' && !course} onStartWithoutCourse={startFirstLesson} openOnLoad={openLesson}
            onLessonSaved={card => syncLesson(card, false)} onLessonDeleted={card => syncLesson(card, true)} onRevision={setRevision} />
        )}
        {step === 'reading' && (
          <FurtherReadingStep draft={draft} patch={patch} library={library} isCompany={isCompany} live={live} />
        )}
        {step === 'settings' && (
          <SettingsStep draft={draft} patch={patch} errors={errors} isCompany={isCompany} course={course ?? null}
            cover={cover} onCover={setCover} lessonCount={lessonCount} unfinished={unfinished} goTo={goTo}
            canSubmit={canSubmit} live={live} status={status} needsReview={needsReview(saved, draft)}
            saving={saving} dirty={dirty} submitBlocked={submitBlocked} onSave={() => save(false)} onSubmit={() => save(true)} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {prev ? (
            <Button type="button" variant="secondary" size="md" onClick={() => goTo(prev.key)}>
              <ArrowBackIcon sx={{ fontSize: 17 }} /> {prev.label}
            </Button>
          ) : <span />}
          {next && (
            <Button type="button" variant="primary" size="md" onClick={() => goTo(next.key)}>
              Next: {next.label} <ArrowForwardIcon sx={{ fontSize: 17 }} />
            </Button>
          )}
        </div>
      </div>

      {withdrawing && (
        <ConfirmDialog title="Withdraw your changes?"
          description="The changes waiting for review are dropped and the builder goes back to the live version. Learners see no difference."
          confirmLabel="Withdraw changes" confirming={withdrawing === 'busy'}
          onCancel={() => setWithdrawing(null)} onConfirm={withdraw} />
      )}

      {previewing && (
        <PreviewModal draft={draft} coverUrl={coverPreview ?? course?.cover_url ?? null}
          publisher={isCompany ? `Course by ${user?.company?.name ?? 'your company'}` : `Course by ${user?.display_name || user?.username || 'you'}`}
          onClose={() => setPreviewing(false)} />
      )}
    </div>
  )
}
