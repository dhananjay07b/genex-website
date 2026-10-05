import { Link } from 'react-router-dom'
import StarIcon from '@mui/icons-material/Star'
import VerifiedIcon from '@mui/icons-material/Verified'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import { getMediaUrl } from '@/lib/utils'
import type { CompanyCardData, ProfessionalCardData, RoleCardData } from '@/types/discovery'
import { CompanyLine } from './Byline'

/** A Professional in a grid: photo, name, role, company, GeLearn rating, expertise. */
export function ProfessionalCard({ person }: { person: ProfessionalCardData }) {
  const initials = person.display_name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const body = (
    <>
      <span className="flex items-center gap-3">
        <span className="size-13 shrink-0 rounded-full bg-linear-to-br from-gradient-start to-gradient-end p-0.5">
          {person.avatar_url
            ? <img src={getMediaUrl(person.avatar_url)} alt="" className="size-full rounded-full border-2 border-white object-cover" />
            : <span className="flex size-full items-center justify-center rounded-full border-2 border-white bg-slate-100 text-sm font-extrabold text-slate-600">{initials}</span>}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-bold text-text-primary wrap-anywhere">{person.display_name}</span>
          {person.role_title && <span className="block text-xs text-text-muted wrap-anywhere">{person.role_title}</span>}
        </span>
      </span>
      {person.company && <CompanyLine company={person.company} />}
      {person.rating
        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted"><StarIcon sx={{ fontSize: 16 }} className="text-amber-500" /><b className="text-sm tabular-nums text-text-primary">{person.rating}</b>GeLearn rating</span>
        : <span className="text-xs text-text-muted">Not rated yet</span>}
      {person.expertise.length > 0 && (
        <span className="flex flex-wrap gap-1.5">
          {person.expertise.map(t => (
            <span key={t.id} className="rounded-full border border-border bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-700">{t.name}</span>
          ))}
        </span>
      )}
    </>
  )
  const classes = 'grid content-start gap-2.5 rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md'
  return person.username ? <Link to={`/u/${person.username}`} className={classes}>{body}</Link> : <div className={classes}>{body}</div>
}

/** A company in the directory: logo, name with verified tick, description, what it has published. */
export function CompanyCard({ company }: { company: CompanyCardData }) {
  const stats: [number, string][] = [
    [company.counts.courses, company.counts.courses === 1 ? 'course' : 'courses'],
    [company.counts.reading, 'articles & research'],
    [company.counts.whitepapers, company.counts.whitepapers === 1 ? 'whitepaper' : 'whitepapers'],
    [company.counts.experts, company.counts.experts === 1 ? 'expert' : 'experts'],
  ]
  return (
    <Link to={`/c/${company.slug}`} className="grid content-start gap-2.5 rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md">
      <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
        {company.logo_url
          ? <img src={getMediaUrl(company.logo_url)} alt="" className="size-full object-contain" />
          : <span className="text-lg font-extrabold text-text-muted">{company.name.slice(0, 2).toUpperCase()}</span>}
      </span>
      <h3 className="flex items-center gap-1.5 text-base font-extrabold text-text-primary">
        {company.name}
        <VerifiedIcon sx={{ fontSize: 18 }} className="text-sky-700" titleAccess="Verified company" />
      </h3>
      {company.description && <p className="text-sm text-slate-700">{company.description}</p>}
      <dl className="flex flex-wrap gap-x-3.5 gap-y-1 border-t border-border pt-2.5 text-xs text-text-muted">
        {stats.map(([n, label]) => (
          <div key={label}><dd className="inline font-extrabold tabular-nums text-text-primary">{n}</dd> <dt className="inline">{label}</dt></div>
        ))}
      </dl>
    </Link>
  )
}

/** A career role card: picture, name, summary and how many courses prepare for it. */
export function RoleCard({ role }: { role: RoleCardData }) {
  return (
    <Link to={`/roles/${role.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg hover:shadow-slate-900/10">
      <div className="aspect-video overflow-hidden">
        {role.image_url
          ? <img src={getMediaUrl(role.image_url)} alt="" loading="lazy" className="size-full object-cover" />
          : <div className="flex size-full items-center justify-center bg-linear-to-br from-surface to-slate-100 text-sky-800/70"><WorkOutlineOutlinedIcon sx={{ fontSize: 36 }} /></div>}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="text-sm font-bold text-text-primary group-hover:underline group-hover:underline-offset-2">{role.name}</h3>
        {role.summary && <p className="text-xs text-text-muted">{role.summary}</p>}
        {role.course_count !== null && (
          <p className="mt-auto flex items-center justify-between border-t border-border pt-2 text-xs">
            <span className="text-text-muted">Courses on GeLearn</span>
            <b className="tabular-nums text-text-primary">{role.course_count}</b>
          </p>
        )}
      </div>
    </Link>
  )
}
