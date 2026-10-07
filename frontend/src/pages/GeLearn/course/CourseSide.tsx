import { Link } from 'react-router-dom'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StarIcon from '@mui/icons-material/Star'
import VerifiedIcon from '@mui/icons-material/Verified'
import type { ReactNode } from 'react'
import { cn, getMediaUrl } from '@/lib/utils'
import type { CourseInstructor, CoursePublisher } from '@/types/learning'
import { initials, plural } from './format'

/** The company's uploaded logo, or a neutral icon when it has none. */
export function PublisherLogo({ logoUrl, className }: { logoUrl: string | null; className?: string }) {
  return logoUrl ? (
    <span className={cn('size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1.5 shadow-sm', className)}>
      <img src={getMediaUrl(logoUrl)} alt="" className="size-full object-contain" />
    </span>
  ) : (
    <span className={cn('size-14 shrink-0 rounded-xl border border-dashed border-slate-300 bg-surface flex items-center justify-center text-text-muted', className)}>
      <ApartmentOutlinedIcon sx={{ fontSize: 28 }} />
    </span>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-white p-4.5 flex flex-col gap-3">
      <h3 className="text-base font-extrabold text-text-primary">{title}</h3>
      {children}
    </section>
  )
}

function Numbers({ items }: { items: [number, string][] }) {
  const shown = items.filter(([n]) => n > 0)
  if (!shown.length) return null
  return (
    <p className="flex flex-wrap gap-x-3.5 gap-y-1 border-t border-border pt-2.5 text-xs text-text-muted">
      {shown.map(([n, label]) => <span key={label}><b className="text-text-primary tabular-nums">{n.toLocaleString('en-IN')}</b> {label}</span>)}
    </p>
  )
}

function MoreLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 self-start text-sm font-bold text-sky-700 hover:text-sky-800">
      {children} <ArrowForwardIcon sx={{ fontSize: 17 }} />
    </Link>
  )
}

function Instructor({ person }: { person: CourseInstructor }) {
  const meta = [person.role_title, person.years_experience ? `${plural(person.years_experience, 'year')}' experience` : ''].filter(Boolean).join(' · ')
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-3">
        {person.avatar_url
          ? <img src={getMediaUrl(person.avatar_url)} alt="" className="size-13 shrink-0 rounded-full object-cover" />
          : <span className="size-13 shrink-0 rounded-full border border-sky-200 bg-brand-tint text-base font-extrabold text-sky-700 flex items-center justify-center">{initials(person.display_name)}</span>}
        <div className="min-w-0 flex flex-col gap-0.5">
          <Link to={`/u/${person.username}`} className="text-base font-extrabold text-text-primary hover:text-sky-700 hover:underline">{person.display_name}</Link>
          {meta && <span className="text-xs text-text-muted">{meta}</span>}
          {person.company && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              {person.company.name}
              {person.company.verified && <VerifiedIcon sx={{ fontSize: 14 }} className="text-primary" titleAccess="Verified company" />}
            </span>
          )}
          {person.rating && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <StarIcon sx={{ fontSize: 14 }} className="text-amber-600" /><b className="text-text-primary">{person.rating}</b> GeLearn rating
            </span>
          )}
        </div>
      </div>
      {person.bio && <p className="line-clamp-4 text-sm text-slate-700">{person.bio}</p>}
      <Numbers items={[[person.course_count, person.course_count === 1 ? 'course' : 'courses'], [person.learner_count, person.learner_count === 1 ? 'learner' : 'learners']]} />
      <MoreLink to={`/u/${person.username}`}>View profile</MoreLink>
    </div>
  )
}

/** Beside the lessons: who teaches the course and the company offering it. */
export function CourseSide({ instructors, publisher }: { instructors: CourseInstructor[]; publisher: CoursePublisher | null }) {
  return (
    <aside aria-label="Instructor and publisher" className="flex flex-col gap-4 lg:sticky lg:top-40">
      {instructors.length > 0 && (
        <Card title={instructors.length === 1 ? 'Instructor' : 'Instructors'}>
          {instructors.map((person, i) => (
            <div key={person.username} className={cn(i > 0 && 'border-t border-border pt-3.5')}><Instructor person={person} /></div>
          ))}
        </Card>
      )}
      {publisher && (
        <Card title="Offered by">
          <div className="flex items-center gap-3">
            <PublisherLogo logoUrl={publisher.logo_url} className="size-12" />
            <div className="min-w-0">
              <p className="flex items-center gap-1 text-base font-extrabold text-text-primary">
                {publisher.name}
                {publisher.verified && <VerifiedIcon sx={{ fontSize: 16 }} className="text-primary" titleAccess="Verified company" />}
              </p>
              {publisher.description && <p className="line-clamp-2 text-xs text-text-muted">{publisher.description}</p>}
            </div>
          </div>
          <Numbers items={[
            [publisher.counts.courses, publisher.counts.courses === 1 ? 'course' : 'courses'],
            [publisher.counts.reading, 'articles & research'],
            [publisher.counts.whitepapers, publisher.counts.whitepapers === 1 ? 'whitepaper' : 'whitepapers'],
            [publisher.counts.experts, publisher.counts.experts === 1 ? 'expert' : 'experts'],
          ]} />
          {publisher.slug && <MoreLink to={`/c/${publisher.slug}`}>Visit the company page</MoreLink>}
        </Card>
      )}
    </aside>
  )
}
