import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { ListRow } from '@/components/gelearn/discovery/ListBox'
import { cn } from '@/lib/utils'
import type { CourseRolePath } from '@/types/learning'
import { LEVEL_LABEL } from './format'

/** Where this course sits in a career role's path: one course per level, this one highlighted. */
export function CoursePath({ role }: { role: CourseRolePath }) {
  const current = role.path.findIndex(step => step.is_current)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:p-7 grid gap-6 lg:grid-cols-4 lg:items-center">
      <span className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-teal-400 to-secondary" aria-hidden="true" />
      <div>
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800">Career path</span>
        <h2 className="mt-1.5 mb-2 text-xl font-extrabold text-text-primary">
          {current >= 0 && role.path.length > 1 ? `Step ${current + 1} of the ${role.name} path` : `Part of the ${role.name} path`}
        </h2>
        {role.summary && <p className="mb-4 text-sm text-slate-700">{role.summary}</p>}
        <Link to={`/roles/${role.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-primary px-3.5 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors">
          See the full path <ArrowForwardIcon sx={{ fontSize: 17 }} />
        </Link>
      </div>
      <ol className={cn('grid gap-3 lg:col-span-3', role.path.length > 1 && 'md:grid-cols-3')}>
        {role.path.map((step, i) => (
          <li key={step.level}
            className={cn('min-w-0 rounded-xl border bg-white p-3 flex flex-col gap-2', step.is_current ? 'border-primary ring-1 ring-primary' : 'border-border')}>
            <span className="flex items-center justify-between gap-2 text-xs font-extrabold uppercase tracking-wide text-text-muted">
              {role.path.length > 1 ? `Step ${i + 1} · ` : ''}{LEVEL_LABEL[step.level]}
              {step.is_current && <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-extrabold normal-case tracking-normal text-sky-700">This course</span>}
            </span>
            <ListRow card={step.course} />
          </li>
        ))}
      </ol>
    </div>
  )
}
