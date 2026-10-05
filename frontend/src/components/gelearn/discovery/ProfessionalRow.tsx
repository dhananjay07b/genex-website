import { Link } from 'react-router-dom'
import StarIcon from '@mui/icons-material/Star'
import { getMediaUrl } from '@/lib/utils'
import type { LeadingProfessional } from '@/types/discovery'
import { CompanyLine } from './Byline'

/** A featured Professional in "Our Leading Professionals": photo, name, role, company, GeLearn rating. */
export function ProfessionalRow({ person }: { person: LeadingProfessional }) {
  const initials = person.display_name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const body = (
    <>
      <span className="relative size-13 shrink-0 rounded-full bg-linear-to-br from-gradient-start to-gradient-end p-0.5">
        {person.avatar_url ? (
          <img src={getMediaUrl(person.avatar_url)} alt="" className="size-full rounded-full border-2 border-white object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-extrabold text-slate-600">
            {initials}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-bold text-text-primary wrap-anywhere">{person.display_name}</span>
        {person.role_title && <span className="text-xs font-medium text-text-muted wrap-anywhere">{person.role_title}</span>}
        {person.company && <CompanyLine company={person.company} />}
        {person.rating && (
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-text-muted">
            <StarIcon sx={{ fontSize: 16 }} className="text-amber-500" />
            <b className="text-sm text-text-primary tabular-nums">{person.rating}</b>
            GeLearn rating
          </span>
        )}
      </span>
    </>
  )
  const classes = 'flex min-w-0 items-center gap-3 rounded-lg bg-white p-2.5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
  return person.username ? <Link to={`/u/${person.username}`} className={classes}>{body}</Link> : <div className={classes}>{body}</div>
}
