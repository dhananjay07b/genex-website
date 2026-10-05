import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import type { LiveSessionCard as LiveSession } from '@/types/discovery'
import { CompanyLine } from './Byline'

const IST = 'Asia/Kolkata'

function dateParts(iso: string) {
  const date = new Date(iso)
  const part = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...options }).format(date)
  return {
    day: part({ day: '2-digit' }),
    month: part({ month: 'short' }),
    weekday: part({ weekday: 'short' }),
    time: part({ hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase(),
  }
}

/**
 * An upcoming webinar: a header strip with the date and title, then speaker,
 * host company and time on their own lines. Nothing is truncated. Register
 * opens the host's page in a new tab.
 */
export function LiveSessionCard({ session }: { session: LiveSession }) {
  const when = dateParts(session.starts_at)
  const host = session.company ?? { name: 'Genex Technocrats', slug: null, logo_url: null, verified: true }
  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-white">
      <header className="flex items-center gap-3 border-b border-border bg-slate-50 px-4 py-3.5">
        <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-sky-100 bg-white py-1.5" aria-hidden="true">
          <b className="text-xl font-extrabold leading-tight tabular-nums text-text-primary">{when.day}</b>
          <span className="text-xs font-bold uppercase tracking-wide text-sky-700">{when.month}</span>
          <span className="text-xs font-semibold text-text-muted">{when.weekday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-700">
            <span className="size-1.5 rounded-full bg-rose-600" aria-hidden="true" />
            Live session
          </span>
          <h3 className="text-sm font-bold leading-snug text-text-primary wrap-anywhere">{session.title}</h3>
        </div>
      </header>
      <div className="grid flex-1 content-start gap-2 px-4 pt-3.5 pb-1">
        <p className="flex items-start gap-2 text-sm font-semibold text-slate-700 wrap-anywhere">
          <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} className="shrink-0 text-text-muted" />
          {session.speaker.display_name}
          {session.speaker.role_title && <span className="font-medium text-text-muted">, {session.speaker.role_title}</span>}
        </p>
        <CompanyLine company={host} className="text-sm" />
        <p className="flex items-start gap-2 text-sm text-text-muted">
          <ScheduleIcon sx={{ fontSize: 18 }} className="shrink-0" />
          <span><time dateTime={session.starts_at}>{when.time} IST</time> · {session.duration_minutes} min</span>
        </p>
      </div>
      <div className="p-4 pt-3">
        <a
          href={session.registration_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-sm font-bold text-sky-700 transition-colors hover:bg-surface"
        >
          Register <NorthEastIcon sx={{ fontSize: 16 }} />
          <span className="sr-only">for {session.title} (opens in a new tab)</span>
        </a>
      </div>
    </article>
  )
}
