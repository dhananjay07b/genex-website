import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined'
import { cn } from '@/lib/utils'
import { PageMeta } from '@/components/seo/PageMeta'
import { Select } from '@/components/ui/Select'
import { RolePicker, TopicPicker } from '@/components/gelearn/TopicPicker'
import { AccessField } from '@/components/gelearn/AccessField'
import { useRole } from '@/hooks/useRole'
import { useAuth } from '@/context/useAuth'
import { FileField } from '@/pages/Studio/fields/FileField'
import { apiFetch, ApiError } from '@/lib/api/client'
import type { CourseLevel, CourseStatus, CourseTarget, MyCourse } from '@/types/learning'
import { BasicsCard, FaqCard, WhatLearnersGetCard } from './cards'
import { OutlineEditor } from './OutlineEditor'
import { LibraryPanel } from './LibraryPanel'
import { BuilderActions, InstructorPanel, PageChecklist } from './rail'
import { RailCard } from './parts'
import { PreviewModal } from './PreviewModal'
import {
  allLessons, changes, draftFromCourse, emptyDraft, faqsPayload, metaPayload, needsReview, outlinePayload, type Draft,
} from './draft'

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const STATUS_CHIP: Record<CourseStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface text-text-primary border border-border' },
  pending: { label: 'In review', className: 'bg-sky-100 text-sky-800' },
  published: { label: 'Live', className: 'bg-emerald-100 text-emerald-800' },
  rejected: { label: 'Needs changes', className: 'bg-amber-100 text-amber-800' },
}

/** Keyed by route so switching between courses always starts fresh. */
export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>()
  return <CourseBuilderForm key={id ?? 'new'} id={id} />
}

/**
 * The course builder, shared by Professionals (My Courses) and Company accounts
 * (Company Studio). They differ in their library (own videos and posts, or the
 * company's published content), page shell, and instructor panel.
 */
function CourseBuilderForm({ id }: { id: string | undefined }) {
  const navigate = useNavigate()
  const { isCompany } = useRole()
  const { user } = useAuth()
  const coursesHome = isCompany ? '/studio/courses' : '/account?tab=courses'
  const editBase = isCompany ? '/studio/courses' : '/account/courses'
  const isEditing = Boolean(id)

  const [course, setCourse] = useState<MyCourse | null | undefined>(isEditing ? undefined : null)
  const [saved, setSaved] = useState<Draft>(emptyDraft)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [library, setLibrary] = useState<CourseTarget[] | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState<'draft' | 'submit' | null>(null)
  const [previewing, setPreviewing] = useState(false)

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

  const patch = (next: Partial<Draft>) => { setDraft(prev => ({ ...prev, ...next })); setNotice('') }
  const status = course?.status ?? null
  const lessonCount = allLessons(draft).length

  function validate(submit: boolean) {
    const found: Record<string, string> = {}
    if (draft.title.trim().length < 3) found.title = 'Give the course a title of at least 3 characters.'
    if (draft.access === 'paid' && !(Number(draft.price) >= 1)) found.price = 'Enter a price of at least ₹1.'
    if (draft.modules.some(m => !m.title.trim())) found.items = 'Give every module a title, or remove the empty one.'
    if (submit && lessonCount === 0) found.items = 'Add at least one lesson before submitting.'
    return found
  }

  async function save(submit: boolean) {
    const found = validate(submit)
    setErrors(found)
    setFormError('')
    setNotice('')
    if (Object.keys(found).length) {
      setFormError(Object.values(found)[0])
      return
    }

    setSaving(submit ? 'submit' : 'draft')
    try {
      const first = !course
      let result = await apiFetch<MyCourse>(
        first ? '/api/learning/me/courses/' : `/api/learning/me/courses/${course.id}/`,
        { method: first ? 'POST' : 'PATCH', body: metaPayload(draft, isCompany) },
      )
      // Only send the parts that changed, so a live course isn't sent for review needlessly.
      if (first || changed.outline) {
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/outline/`, { method: 'PUT', body: outlinePayload(draft) })
      }
      if (first ? draft.faqs.length > 0 : changed.faqs) {
        result = await apiFetch<MyCourse>(`/api/learning/me/courses/${result.id}/faqs/`, { method: 'PUT', body: faqsPayload(draft) })
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
        // The edit route loads the saved course (and enables Preview).
        navigate(`${editBase}/${result.id}/edit`, { replace: true })
        return
      }
      load(result)
      setNotice(result.status === 'pending' && status === 'published' ? 'Saved. The changes are with Genex for review.' : 'Saved.')
    } catch (err) {
      const fields = err instanceof ApiError ? err.fields : {}
      setErrors(fields)
      setFormError(Object.values(fields)[0] ?? (err instanceof ApiError ? err.message : "Couldn't save the course. Please try again."))
    } finally {
      setSaving(null)
    }
  }

  const heading = isEditing ? 'Edit course' : 'New course'
  const chip = status ? STATUS_CHIP[status] : null
  const Shell = isCompany ? 'div' : 'main'

  return (
    // In Company Studio the layout already supplies the page shell, so only the builder itself renders.
    <Shell className={isCompany ? undefined : 'min-h-screen pb-10 bg-brand-tint bg-brand-tint-static'}>
      <PageMeta title={`${heading} — Genex GeLearn`} description="Build a course from published content." canonical={`${editBase}/new`} />

      <div className={cn(!isCompany && 'max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16')}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{heading}</p>
            {chip && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${chip.className}`}>{chip.label}</span>}
            {notice && <span role="status" className="text-xs font-bold text-emerald-700">{notice}</span>}
          </div>
          <Link to={coursesHome}
            className="flex items-center gap-1.5 border border-border bg-white rounded-full px-4 py-2 text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors">
            <ArrowBackIcon sx={{ fontSize: 13 }} /> {isCompany ? 'Company courses' : 'My Courses'}
          </Link>
        </div>

        {status === 'rejected' && course?.rejection_reason && (
          <div role="status" className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 mb-5 text-sm text-amber-900">
            <FeedbackOutlinedIcon sx={{ fontSize: 20 }} className="text-amber-700 shrink-0" />
            <p><b className="block">Genex sent this course back</b>&ldquo;{course.rejection_reason}&rdquo; Make the changes, then submit again.</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 w-full flex flex-col gap-5">
            <BasicsCard draft={draft} patch={patch} titleError={errors.title} />
            <WhatLearnersGetCard draft={draft} patch={patch} />
            <OutlineEditor draft={draft} patch={patch} error={errors.items ?? errors.modules} />
            <LibraryPanel draft={draft} patch={patch} library={library} isCompany={isCompany} />
            <FaqCard draft={draft} patch={patch} n={5} />
          </div>

          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-5" aria-label="Course settings">
            <RailCard>
              <FileField kind="image" label="Cover image" currentUrl={course?.cover_url} file={cover} onChange={setCover} />
              <AccessField access={draft.access} price={draft.price} priceError={errors.price}
                onChange={next => patch({ access: next.access, price: next.price })} />
            </RailCard>
            <RailCard>
              <Select label="Level" options={LEVEL_OPTIONS} value={draft.level} error={errors.level}
                onChange={e => patch({ level: e.target.value as CourseLevel })} />
              <TopicPicker value={draft.topics} onChange={topics => patch({ topics })} error={errors.topics}
                help={"Shown as “Skills you'll gain”."} />
              <RolePicker value={draft.roles} onChange={roles => patch({ roles })} error={errors.roles}
                help="Puts the course in that role's career path. Genex can correct these when approving." />
            </RailCard>
            <InstructorPanel isCompany={isCompany} value={draft.instructors} onChange={instructors => patch({ instructors })} error={errors.instructors} />
            <PageChecklist draft={draft} hasCover={Boolean(cover || course?.cover_url)} isCompany={isCompany} />
            <BuilderActions status={status} slug={course?.slug ?? null} dirty={dirty} saving={saving}
              needsReview={needsReview(saved, draft)} enrolled={course?.enrolled_count ?? 0} lessonCount={lessonCount}
              onSave={() => save(false)} onSubmit={() => save(true)} onPreview={() => setPreviewing(true)} formError={formError} />
          </aside>
        </div>
      </div>

      {previewing && (
        <PreviewModal draft={draft} coverUrl={coverPreview ?? course?.cover_url ?? null}
          publisher={isCompany ? `Course by ${user?.company?.name ?? 'your company'}` : `Course by ${user?.display_name || user?.username || 'you'}`}
          onClose={() => setPreviewing(false)} />
      )}
    </Shell>
  )
}
