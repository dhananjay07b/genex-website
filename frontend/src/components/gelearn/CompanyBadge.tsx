import { Link } from 'react-router-dom'
import VerifiedIcon from '@mui/icons-material/Verified'
import { cn, getMediaUrl } from '@/lib/utils'
import type { CompanyDisplay } from '@/types/auth'

interface CompanyBadgeProps {
  company: CompanyDisplay
  className?: string
  /**
   * Link to the public company page (/c/<slug>). Only for badges that aren't
   * already inside a link or button — nested interactive elements are invalid.
   */
  linked?: boolean
}

/**
 * A user's company, inline. Verified companies (Company staff, or a professional who
 * confirmed an email on the company's domain) get their logo and a verified
 * tick; unverified / unlisted companies render as plain text only.
 */
export function CompanyBadge({ company, className, linked = false }: CompanyBadgeProps) {
  if (!company.verified) {
    return <span className={cn('min-w-0 truncate', className)}>{company.name}</span>
  }
  const content = (
    <>
      {company.logo_url && (
        <img src={getMediaUrl(company.logo_url)} alt="" className="size-4 shrink-0 rounded-sm object-contain" />
      )}
      <span className="truncate font-semibold text-text-primary">{company.name}</span>
      <VerifiedIcon
        sx={{ fontSize: 15 }}
        className="shrink-0 text-primary"
        titleAccess={`Verified ${company.name} account`}
      />
    </>
  )
  const classes = cn('inline-flex items-center gap-1.5 min-w-0 align-middle', className)
  if (linked && company.slug) {
    return <Link to={`/c/${company.slug}`} className={cn(classes, 'hover:underline')}>{content}</Link>
  }
  return <span className={classes}>{content}</span>
}
