import { Link } from 'react-router-dom'
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { COURSE_ITEM_KINDS, timeIsEstimated } from '@/components/gelearn/courseItemKinds'
import type { CourseReadingCard } from '@/types/learning'
import { formatMinutes } from './format'

const OPENS: Record<string, string> = {
  video: 'video page', post: 'post', article: 'article', research: 'research',
  whitepaper: 'whitepaper', podcast: 'podcast',
}

function detail(item: CourseReadingCard) {
  const estimate = timeIsEstimated(item) && item.minutes ? `about ${formatMinutes(item.minutes)}` : ''
  return [COURSE_ITEM_KINDS[item.kind].label, item.meta, estimate].filter(Boolean).join(' · ')
}

const OptionalTag = () => (
  <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-bold normal-case tracking-normal text-slate-600">Optional</span>
)

/**
 * The course page's Further reading: the instructor's published content, after
 * the lessons. Optional, with no ticks, and never part of progress or the certificate.
 * Links open in a new tab, so the learner keeps their place in the course.
 */
export function CourseReadingBlock({ items }: { items: CourseReadingCard[] }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="cp-reading-h" className="mt-6 max-w-4xl rounded-xl border border-border bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div>
          <h3 id="cp-reading-h" className="flex items-center gap-2 text-lg font-extrabold text-text-primary">
            <LibraryBooksOutlinedIcon sx={{ fontSize: 21 }} className="text-sky-700" /> Further reading
          </h3>
          <p className="text-sm text-text-muted">Optional extra reading from the instructor. Not needed to complete the course.</p>
        </div>
        <OptionalTag />
      </div>
      <ul>
        {items.map((item, i) => {
          const { icon: Icon } = COURSE_ITEM_KINDS[item.kind]
          return (
            <li key={`${item.kind}:${item.id}`} className={i > 0 ? 'border-t border-border' : undefined}>
              <Link to={item.path} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 px-4 py-3 hover:bg-sky-50">
                <span className="size-9 shrink-0 rounded-lg border border-border bg-surface text-sky-700 flex items-center justify-center">
                  <Icon sx={{ fontSize: 19 }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary group-hover:text-sky-700">{item.title}</span>
                  <span className="block truncate text-xs text-text-muted">{detail(item)} · opens the {OPENS[item.kind]} in a new tab</span>
                </span>
                {item.is_locked && <LockOutlinedIcon sx={{ fontSize: 16 }} className="shrink-0 text-text-muted" aria-label="Needs access" />}
                <NorthEastIcon sx={{ fontSize: 17 }} className="shrink-0 text-text-muted group-hover:text-sky-700" />
                <span className="sr-only">(opens in a new tab)</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Further reading at the bottom of the lesson player's outline: optional, no ticks. */
export function CourseReadingOutline({ items }: { items: CourseReadingCard[] }) {
  if (items.length === 0) return null
  return (
    <div className="border-t border-border pt-3">
      <p className="flex items-center gap-2 px-3 pb-1.5 text-xs font-extrabold uppercase tracking-wider text-text-muted">
        Further reading <OptionalTag />
      </p>
      <ol className="flex flex-col">
        {items.map(item => {
          const { icon: Icon } = COURSE_ITEM_KINDS[item.kind]
          return (
            <li key={`${item.kind}:${item.id}`}>
              <Link to={item.path} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-surface hover:text-text-primary">
                <Icon sx={{ fontSize: 18 }} className="shrink-0 text-sky-700" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                <NorthEastIcon sx={{ fontSize: 14 }} className="shrink-0 text-text-muted" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
