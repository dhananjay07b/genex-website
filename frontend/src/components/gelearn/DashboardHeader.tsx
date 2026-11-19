import type { Ref } from 'react'
import { useAuth } from '@/context/useAuth'
import { cn, getMediaUrl } from '@/lib/utils'
import type { AccountType } from '@/types/auth'

const CONTEXT_LABELS: Record<AccountType, string> = {
  learner: 'My account · Learner',
  professional: 'My account · Professional',
  company: 'My account · Company',
}

interface DashboardHeaderProps {
  /** Replaces the account-type label, e.g. "Company Studio". */
  label?: string
  /** Lets a page measure the band (the account sidebar sizes itself from its height). */
  ref?: Ref<HTMLDivElement>
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()
}

/**
 * The header band shared by every dashboard page (My account for Learners and Professionals,
 * the company account and Company Studio): identity mark, context label, then the name as the page <h1>.
 * People show their photo (or initials) in a circle; companies show their logo (or initials) in a tile.
 */
export function DashboardHeader({ label, ref }: DashboardHeaderProps) {
  const { user } = useAuth()
  if (!user) return null

  const isCompany = user.account_type === 'company'
  const name = (isCompany ? user.company?.name : null) || user.display_name || user.username
  const image = isCompany ? user.company?.logo_url : user.avatar_url

  return (
    <div ref={ref} className="bg-brand-tint border-b border-border pt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9 flex items-center gap-4">
        <span
          aria-hidden="true"
          className={cn(
            'size-14 shrink-0 flex items-center justify-center overflow-hidden bg-white border text-lg font-extrabold',
            isCompany ? 'rounded-2xl border-border text-text-primary' : 'rounded-full border-sky-200 text-primary',
            isCompany && image && 'p-2.5',
          )}
        >
          {image ? (
            <img src={getMediaUrl(image)} alt="" className={cn('w-full h-full', isCompany ? 'object-contain' : 'object-cover')} />
          ) : (
            initialsOf(name)
          )}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">{label ?? CONTEXT_LABELS[user.account_type]}</p>
          <h1 className="text-3xl font-extrabold text-text-primary truncate">{name}</h1>
        </div>
      </div>
    </div>
  )
}
