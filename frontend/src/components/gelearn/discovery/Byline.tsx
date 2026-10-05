import VerifiedIcon from '@mui/icons-material/Verified'
import { cn, getMediaUrl } from '@/lib/utils'
import type { CompanyDisplay } from '@/types/auth'
import type { PersonCard } from '@/types/discovery'

/** A company on its own line: logo, full name (wraps, never cut off), verified tick. */
export function CompanyLine({ company, className }: { company: CompanyDisplay; className?: string }) {
  return (
    <span className={cn('flex items-start gap-1.5 text-xs font-semibold text-slate-700', className)}>
      {company.verified && company.logo_url && (
        <img src={getMediaUrl(company.logo_url)} alt="" className="mt-px size-4 shrink-0 rounded-sm object-contain" />
      )}
      <span className="min-w-0 wrap-anywhere">
        {company.name}
        {company.verified && (
          <VerifiedIcon sx={{ fontSize: 14 }} className="ml-1 -mt-0.5 text-primary" titleAccess={`Verified ${company.name}`} />
        )}
      </span>
    </span>
  )
}

interface BylineProps {
  author: PersonCard | null
  company: CompanyDisplay | null
  className?: string
}

/**
 * Who a course or item is by. A Professional's work shows their name, with
 * their company on the next line; company or Genex work shows the company only.
 */
export function Byline({ author, company, className }: BylineProps) {
  const shownCompany = company ?? author?.company ?? null
  if (!author && !shownCompany) {
    return <span className={cn('text-xs font-semibold text-slate-700', className)}>Genex Technocrats</span>
  }
  return (
    <span className={cn('flex flex-col gap-0.5 min-w-0', className)}>
      {author && !company && (
        <span className="text-xs font-bold text-text-primary wrap-anywhere">{author.display_name}</span>
      )}
      {shownCompany && <CompanyLine company={shownCompany} />}
    </span>
  )
}
