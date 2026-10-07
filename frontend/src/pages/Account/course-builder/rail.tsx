import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { CompanyProfessional } from '@/types/learning'
import { RailCard, RowControls } from './parts'
import { LIMITS, type Draft } from './draft'

function Face({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  return avatarUrl
    ? <img src={getMediaUrl(avatarUrl)} alt="" className="size-10 rounded-full object-cover shrink-0" />
    : <span className="size-10 rounded-full bg-surface border border-dashed border-border flex items-center justify-center text-xs font-bold text-text-muted shrink-0">{initials || '?'}</span>
}

/**
 * Professional: their own card, read-only (their course always shows them).
 * Company: up to 3 of the company's verified Professionals, or none.
 */
export function InstructorPanel({ isCompany, value, onChange, error }: {
  isCompany: boolean
  value: number[]
  onChange: (ids: number[]) => void
  error?: string
}) {
  const { user } = useAuth()
  const [people, setPeople] = useState<CompanyProfessional[] | null>(null)

  useEffect(() => {
    if (!isCompany) return
    let cancelled = false
    apiFetch<CompanyProfessional[]>('/api/learning/me/company-professionals/')
      .then(rows => { if (!cancelled) setPeople(rows) })
      .catch(() => { if (!cancelled) setPeople([]) })
    return () => { cancelled = true }
  }, [isCompany])

  if (!isCompany) {
    return (
      <RailCard>
        <span className="text-sm font-semibold text-text-primary">Instructor</span>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Face name={user?.display_name || user?.username || ''} avatarUrl={user?.avatar_url ?? null} />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-text-primary truncate">{user?.display_name || user?.username}</span>
            <span className="block text-xs text-text-muted truncate">{[user?.role_title, user?.company?.name ?? user?.company_other].filter(Boolean).join(' · ')}</span>
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Your own course always shows you. Name, photo, job title and bio come from your profile.{' '}
          <Link to="/account?tab=settings" className="font-bold text-primary hover:underline">Edit in Settings</Link>
        </p>
      </RailCard>
    )
  }

  const picked = value.map(id => people?.find(p => p.id === id)).filter((p): p is CompanyProfessional => Boolean(p))
  const options = (people ?? []).filter(p => !value.includes(p.id))
  return (
    <RailCard>
      <span className="flex justify-between text-sm font-semibold text-text-primary">
        Instructors <span className="text-xs text-text-muted tabular-nums">{value.length}/{LIMITS.instructors} · optional</span>
      </span>
      {picked.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
          <Face name={p.display_name} avatarUrl={p.avatar_url} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-sm font-bold text-text-primary truncate">{p.display_name}<VerifiedIcon sx={{ fontSize: 14 }} className="text-primary" /></span>
            <span className="block text-xs text-text-muted truncate">{p.role_title}</span>
          </span>
          <RowControls label={p.display_name} index={i} count={picked.length}
            onMove={(from, to) => { const next = [...value]; [next[from], next[to]] = [next[to], next[from]]; onChange(next) }}
            onRemove={() => onChange(value.filter(id => id !== p.id))} />
        </div>
      ))}
      {people !== null && value.length < LIMITS.instructors && (
        options.length > 0 ? (
          <select value="" onChange={e => e.target.value && onChange([...value, Number(e.target.value)])} aria-label="Add an instructor"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-text-primary">
            <option value="">Add an instructor…</option>
            {options.map(p => <option key={p.id} value={p.id}>{p.display_name}{p.role_title ? ` · ${p.role_title}` : ''}</option>)}
          </select>
        ) : picked.length === 0 ? (
          <p className="text-xs text-text-muted">No verified Professionals at your company yet. They appear here once they sign up with a company email and confirm it.</p>
        ) : null
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-text-muted">Only Professionals at your company with a verified company email are listed. With none picked, the course page shows only &ldquo;Offered by&rdquo; your company.</p>
    </RailCard>
  )
}

/** Which course page sections the course will fill. Advice only: empty sections are hidden on the page. */
export function PageChecklist({ draft, hasCover, isCompany }: { draft: Draft; hasCover: boolean; isCompany: boolean }) {
  const outcomes = draft.outcomes.filter(o => o.trim()).length
  const checks: { ok: boolean; label: string; why: string; optional?: boolean }[] = [
    { ok: draft.summary.trim().length > 0, label: 'Summary', why: 'Fills the top of the page and course cards' },
    { ok: hasCover, label: 'Cover image', why: 'Shown on course cards' },
    { ok: outcomes >= 2, label: 'At least 2 outcomes', why: "Fills “What you'll learn”" },
    { ok: draft.level !== '', label: 'Level', why: 'Places the course in a career path step' },
    { ok: draft.topics.length > 0, label: 'At least 1 topic', why: "Fills “Skills you'll gain”" },
    { ok: draft.roles.length > 0, label: 'At least 1 career role', why: 'Fills the career path band' },
    { ok: draft.modules.length > 0, label: 'Lessons grouped into modules', why: 'Shows the course as modules', optional: true },
    { ok: draft.faqs.some(f => f.question.trim() && f.answer.trim()), label: 'Course FAQ', why: 'Your questions first in the FAQ', optional: true },
    ...(isCompany ? [{ ok: draft.instructors.length > 0, label: 'Instructors', why: 'Shows who teaches it', optional: true }] : []),
  ]
  const done = checks.filter(c => c.ok).length
  return (
    <RailCard>
      <span className="flex justify-between text-sm font-semibold text-text-primary">
        Page checklist <span className="text-xs text-text-muted tabular-nums">{done} of {checks.length}</span>
      </span>
      <div className="h-1.5 rounded-full bg-surface overflow-hidden" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={checks.length} aria-label="Page checklist">
        <div className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${Math.round((done * 100) / checks.length)}%` }} />
      </div>
      <ul className="flex flex-col gap-2">
        {checks.map(c => (
          <li key={c.label} className="flex gap-2 text-sm text-text-primary">
            {c.ok
              ? <CheckCircleIcon sx={{ fontSize: 18 }} className="text-emerald-700 shrink-0 mt-px" />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} className="text-slate-400 shrink-0 mt-px" />}
            <span>
              {c.label}{c.optional && <span className="text-text-muted"> (optional)</span>}
              {!c.ok && <span className="block text-xs text-text-muted">{c.why}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-text-muted">Advice only. It never blocks saving or submitting; empty sections are hidden on the course page.</p>
    </RailCard>
  )
}

export function BuilderActions({ status, slug, dirty, saving, needsReview, lessonCount, onSave, onSubmit, onPreview, formError }: {
  status: string | null
  slug: string | null
  dirty: boolean
  saving: 'draft' | 'submit' | null
  needsReview: boolean
  lessonCount: number
  onSave: () => void
  onSubmit: () => void
  onPreview: () => void
  formError: string
}) {
  const isLive = status === 'published'
  const canSubmit = !isLive && status !== 'pending'
  return (
    <RailCard className="lg:sticky lg:top-24">
      {/* Preview is drawn in the builder from the current edits: an unpublished course never gets a public address. */}
      <Button type="button" variant="secondary" size="md" className="w-full" onClick={onPreview}>
        <PreviewOutlinedIcon sx={{ fontSize: 18 }} /> {isLive ? 'Preview your edits' : 'Preview course page'}
      </Button>
      {isLive && slug && (
        <a href={`/courses/${slug}`} target="_blank" rel="noreferrer"
          className="-mt-1 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <OpenInNewIcon sx={{ fontSize: 15 }} /> View the live page
        </a>
      )}

      {isLive && needsReview && (
        <p className="rounded-lg bg-sky-50 border border-sky-200 px-3 py-2.5 text-xs text-sky-900">
          <b>This course is live.</b> Your changes to what learners are promised go to Genex for review. Learners keep seeing the
          live version until they&apos;re approved. Reordering or moving lessons goes live straight away.
        </p>
      )}

      {canSubmit && (
        <Button type="button" variant="primary" size="md" className="w-full" disabled={saving !== null || lessonCount === 0} onClick={onSubmit}>
          {saving === 'submit' ? 'Submitting…' : 'Submit for review'}
        </Button>
      )}
      <Button type="button" variant={canSubmit ? 'secondary' : 'primary'} size="md" className="w-full" disabled={saving !== null || (!dirty && status !== null)} onClick={onSave}>
        {saving === 'draft' ? 'Saving…' : isLive ? 'Save changes' : 'Save draft'}
      </Button>
      {dirty && <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700"><span className="size-2 rounded-full bg-amber-500" />Unsaved changes</p>}
      <p className="text-xs text-text-muted leading-relaxed">
        {isLive
          ? 'Changes to the title, summary, description, outcomes, prerequisites, modules, FAQ or access wait for Genex review while the live version stays up. Everything else goes live straight away.'
          : status === 'pending'
            ? 'Genex is reviewing this course. You can keep editing; changes are included in the review.'
            : lessonCount === 0
              ? 'Add at least one lesson to submit. Genex reviews every course before it goes live.'
              : 'Genex reviews every course before it goes live.'}
      </p>
      {formError && <p role="alert" className="text-xs font-semibold text-red-600">{formError}</p>}
    </RailCard>
  )
}

