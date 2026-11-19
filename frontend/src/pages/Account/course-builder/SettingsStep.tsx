import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { RolePicker, TopicPicker } from '@/components/gelearn/TopicPicker'
import { AccessField } from '@/components/gelearn/AccessField'
import { FileField } from '@/pages/Studio/fields/FileField'
import { cn } from '@/lib/utils'
import type { CourseLesson, CourseLevel, CourseStatus, MyCourse } from '@/types/learning'
import { BuilderCard } from './parts'
import { FaqCard } from './cards'
import { InstructorPanel } from './rail'
import { keptModules, type Draft, type StepKey } from './draft'

type Patch = (next: Partial<Draft>) => void

const LEVEL_OPTIONS: { value: CourseLevel; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

interface Check {
  state: 'ok' | 'todo' | 'optional'
  label: string
  detail?: string
  step?: StepKey
}

/**
 * Step 4 of the builder: cover and access, where the course appears, instructors
 * and FAQ, with a "Ready to submit?" card that links to whatever still needs work.
 */
export function SettingsStep({
  draft, patch, errors, isCompany, course, cover, onCover, lessonCount, unfinished, goTo,
  canSubmit, live, status, needsReview, saving, dirty, submitBlocked, onSave, onSubmit,
}: {
  draft: Draft
  patch: Patch
  errors: Record<string, string>
  isCompany: boolean
  course: MyCourse | null
  cover: File | null
  onCover: (file: File | null) => void
  lessonCount: number
  /** Lessons in the outline that still need something before submitting. */
  unfinished: CourseLesson[]
  goTo: (step: StepKey) => void
  canSubmit: boolean
  live: boolean
  status: CourseStatus | null
  needsReview: boolean
  saving: 'draft' | 'submit' | null
  dirty: boolean
  /** Why the course can't be submitted yet, or ''. */
  submitBlocked: string
  onSave: () => void
  onSubmit: () => void
}) {
  const outcomes = draft.outcomes.filter(o => o.trim()).length
  const modules = keptModules(draft).length
  const hasCover = Boolean(cover || course?.cover_url)
  const checks: Check[] = [
    {
      state: draft.title.trim().length >= 3 && draft.summary.trim() && outcomes >= 2 ? 'ok' : 'todo',
      label: `Title, summary and ${outcomes >= 2 ? `${outcomes} outcomes` : 'at least 2 outcomes'}`,
      detail: draft.summary.trim() ? undefined : 'The summary fills the top of the page and course cards.',
      step: 'details',
    },
    {
      state: lessonCount > 0 ? 'ok' : 'todo',
      label: lessonCount > 0 ? `${modules} module${modules === 1 ? '' : 's'}, ${lessonCount} lesson${lessonCount === 1 ? '' : 's'}` : 'At least one lesson',
      step: 'curriculum',
    },
    ...(unfinished.length ? [{
      state: 'todo' as const,
      label: unfinished.length === 1 ? "1 lesson isn't finished" : `${unfinished.length} lessons aren't finished`,
      detail: `“${unfinished[0].title}”: ${unfinished[0].problem}.`,
      step: 'curriculum' as const,
    }] : []),
    {
      state: hasCover && draft.level !== '' && draft.topics.length > 0 ? 'ok' : 'todo',
      label: 'Cover, level and topics',
      detail: hasCover && draft.level !== '' && draft.topics.length > 0 ? undefined : 'Shown on course cards and in “Skills you’ll gain”.',
    },
    {
      state: draft.roles.length > 0 ? 'ok' : 'todo',
      label: 'At least 1 career role',
      detail: draft.roles.length > 0 ? undefined : 'Puts the course in that role’s career path.',
    },
    {
      state: 'optional',
      label: draft.reading.length ? `Further reading: ${draft.reading.length} item${draft.reading.length === 1 ? '' : 's'}` : 'Further reading',
      detail: live ? 'Optional · changes go live straight away' : 'Optional',
      step: 'reading',
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <BuilderCard title="Cover and access">
          <div className="grid gap-5 md:grid-cols-2">
            <FileField kind="image" label="Cover image" currentUrl={course?.cover_url} file={cover} onChange={onCover} />
            <AccessField access={draft.access} price={draft.price} priceError={errors.price}
              onChange={next => patch({ access: next.access, price: next.price })} />
          </div>
        </BuilderCard>
        <BuilderCard title="Where it appears" hint="Level, topics and career roles">
          <div className="sm:max-w-xs">
            <Select label="Level" options={LEVEL_OPTIONS} value={draft.level} error={errors.level}
              onChange={e => patch({ level: e.target.value as CourseLevel })} />
          </div>
          <TopicPicker value={draft.topics} onChange={topics => patch({ topics })} error={errors.topics}
            help={"Shown as “Skills you'll gain”."} />
          <RolePicker value={draft.roles} onChange={roles => patch({ roles })} error={errors.roles}
            help="Puts the course in that role's career path. Genex can correct these when approving." />
        </BuilderCard>
        <InstructorPanel isCompany={isCompany} value={draft.instructors} onChange={instructors => patch({ instructors })} error={errors.instructors} />
        <FaqCard draft={draft} patch={patch} />
      </div>

      <aside aria-label="Ready to submit" className="lg:sticky lg:top-60 bg-white border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <h3 className="text-base font-extrabold text-text-primary">{canSubmit ? 'Ready to submit?' : 'Course checklist'}</h3>
        <ul className="flex flex-col gap-3">
          {checks.map(({ step, ...c }) => (
            <li key={c.label} className="flex gap-2 text-sm text-text-primary">
              {c.state === 'ok'
                ? <CheckCircleIcon sx={{ fontSize: 19 }} className="text-emerald-600 shrink-0" />
                : c.state === 'todo'
                  ? <ErrorOutlineIcon sx={{ fontSize: 19 }} className="text-amber-600 shrink-0" />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 19 }} className="text-slate-400 shrink-0" />}
              <span className="min-w-0">
                <span className={cn(c.state === 'ok' && 'text-text-muted')}>{c.label}</span>
                {c.detail && <span className="block text-xs text-text-muted">{c.detail}</span>}
                {c.state === 'todo' && step && (
                  <button type="button" onClick={() => goTo(step)} className="block text-xs font-bold text-primary hover:underline">
                    Go to {step === 'details' ? 'Details' : step === 'curriculum' ? 'Curriculum' : 'Further reading'}
                  </button>
                )}
              </span>
            </li>
          ))}
        </ul>

        {live && needsReview && (
          <p className="rounded-lg bg-sky-50 border border-sky-200 px-3 py-2.5 text-xs text-sky-900">
            <b>This course is live.</b> Changes to what learners are promised, and new lessons, go to Genex for review. Learners keep the
            live version until they&apos;re approved. Reordering lessons and Further reading go live straight away.
          </p>
        )}

        {canSubmit && (
          <Button type="button" variant="primary" size="md" className="w-full justify-center"
            disabled={saving !== null || Boolean(submitBlocked)} onClick={onSubmit}>
            {saving === 'submit' ? 'Submitting…' : 'Submit for review'}
          </Button>
        )}
        <Button type="button" variant={canSubmit ? 'secondary' : 'primary'} size="md" className="w-full justify-center"
          disabled={saving !== null || (!dirty && status !== null)} onClick={onSave}>
          {saving === 'draft' ? 'Saving…' : live ? 'Save changes' : 'Save draft'}
        </Button>
        {live && course?.slug && (
          <a href={`/courses/${course.slug}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <OpenInNewIcon sx={{ fontSize: 15 }} /> View the live page
          </a>
        )}
        <p className="text-xs text-text-muted leading-relaxed">
          {live
            ? 'Changes to the title, summary, description, outcomes, prerequisites, modules, FAQ or access wait for Genex review while the live version stays up.'
            : status === 'pending'
              ? 'Genex is reviewing this course. You can keep editing; changes are included in the review.'
              : submitBlocked || 'Genex reviews every course before it goes live.'}
        </p>
      </aside>
    </div>
  )
}
