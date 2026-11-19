import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import { useAuth } from '@/context/useAuth'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type { CompanyProfessional } from '@/types/learning'
import { BuilderCard, RowControls } from './parts'
import { LIMITS } from './draft'

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
      <BuilderCard title="Instructor">
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
      </BuilderCard>
    )
  }

  const picked = value.map(id => people?.find(p => p.id === id)).filter((p): p is CompanyProfessional => Boolean(p))
  const options = (people ?? []).filter(p => !value.includes(p.id))
  return (
    <BuilderCard title="Instructors" hint={`${value.length}/${LIMITS.instructors} · optional`}>
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
    </BuilderCard>
  )
}
