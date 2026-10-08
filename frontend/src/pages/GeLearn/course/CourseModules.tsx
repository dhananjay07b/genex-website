import { useState } from 'react'
import { Link } from 'react-router-dom'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import { cn } from '@/lib/utils'
import type { CourseDetail, CourseItem } from '@/types/learning'
import { formatMinutes, lessonFormats, plural } from './format'

interface LessonListProps {
  items: CourseItem[]
  numbers: Map<number, number>
  enrolled: boolean
  nextId: number | null
  onOpen: (item: CourseItem) => void
}

function detail(item: CourseItem) {
  const { label } = COURSE_ITEM_KINDS[item.kind]
  // Show "about N min" only where the stored detail isn't already a time (blog posts, whitepapers).
  const estimate = (item.kind === 'post' || item.kind === 'whitepaper') && item.minutes ? `about ${formatMinutes(item.minutes)}` : ''
  return [label, item.meta, estimate].filter(Boolean).join(' · ')
}

function LessonList({ items, numbers, enrolled, nextId, onOpen }: LessonListProps) {
  return (
    <ol>
      {items.map(item => {
        const { icon: Icon } = COURSE_ITEM_KINDS[item.kind]
        const isNext = enrolled && item.item_id === nextId
        return (
          <li key={item.item_id}
            className={cn('flex items-center gap-3 border-t border-border border-l-2 px-4 py-2.5 text-sm transition-colors hover:bg-sky-50 hover:border-l-primary',
              isNext ? 'bg-sky-50 border-l-primary' : 'border-l-transparent')}>
            {enrolled ? (
              // Done once opened from this page; there is no manual ticking.
              item.completed
                ? <CheckCircleIcon sx={{ fontSize: 22 }} className="shrink-0 text-emerald-700" titleAccess="Done" />
                : <RadioButtonUncheckedIcon sx={{ fontSize: 22 }} className="shrink-0 text-slate-400" titleAccess="Not opened yet" />
            ) : (
              <span className="w-6 shrink-0 text-center text-xs font-extrabold text-text-muted tabular-nums">{numbers.get(item.item_id)}</span>
            )}
            <Icon sx={{ fontSize: 19 }} className="text-sky-700 shrink-0" />
            {item.is_locked ? (
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-text-primary truncate">{item.title}</span>
                <span className="block text-xs text-text-muted truncate">{detail(item)}</span>
              </span>
            ) : (
              <Link to={item.path} onClick={() => onOpen(item)} className="group min-w-0 flex-1">
                <span className={cn('block font-semibold truncate group-hover:text-sky-700', item.completed ? 'text-text-muted' : 'text-text-primary')}>{item.title}</span>
                <span className="block text-xs text-text-muted truncate">{detail(item)}</span>
              </Link>
            )}
            {isNext && <span className="shrink-0 rounded-full border border-sky-200 bg-white px-2 py-0.5 text-xs font-extrabold text-sky-700">Up next</span>}
            {!enrolled && (item.is_locked
              ? <LockOutlinedIcon sx={{ fontSize: 17 }} className="shrink-0 text-text-muted" aria-label="Locked" />
              : item.access === 'free' && <Link to={item.path} className="shrink-0 text-xs font-bold text-sky-700 hover:underline">Preview</Link>)}
          </li>
        )
      })}
    </ol>
  )
}

/** The lesson outline: modules (collapsible) or one plain list, plus the certificate note. */
export function CourseModules({ course, onOpen }: { course: CourseDetail; onOpen: (item: CourseItem) => void }) {
  const enrolled = course.enrollment !== null
  const byId = new Map(course.items.map(i => [i.item_id, i]))
  const numbers = new Map(course.items.map((i, n) => [i.item_id, n + 1]))
  const loose = course.items.filter(i => !course.modules.some(m => m.item_ids.includes(i.item_id)))
  // Open the module with the learner's next lesson (or the first module for visitors).
  const [open, setOpen] = useState<Set<number>>(() => {
    const withNext = enrolled ? course.modules.find(m => course.next_item_id !== null && m.item_ids.includes(course.next_item_id)) : undefined
    return new Set((withNext ? [withNext] : course.modules.slice(0, 1)).map(m => m.id))
  })
  const allOpen = course.modules.length > 0 && course.modules.every(m => open.has(m.id))
  const done = new Set(course.enrollment?.completed_item_ids ?? [])
  const list = (items: CourseItem[]) => (
    <LessonList items={items} numbers={numbers} enrolled={enrolled} nextId={course.next_item_id} onOpen={onOpen} />
  )

  const heading = course.modules.length
    ? `There ${course.modules.length === 1 ? 'is 1 module' : `are ${course.modules.length} modules`} in this course`
    : 'Lessons in this course'
  const summary = [plural(course.items.length, 'lesson'), lessonFormats(course.lesson_counts),
    course.total_minutes ? `about ${formatMinutes(course.total_minutes)} in total` : ''].filter(Boolean).join(' · ')

  return (
    <div className="max-w-4xl">
      <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-text-primary lg:text-2xl">{heading}</h2>
          <p className="mt-1 text-sm text-text-muted">{summary}</p>
        </div>
        {course.modules.length > 1 && (
          <button type="button" onClick={() => setOpen(allOpen ? new Set() : new Set(course.modules.map(m => m.id)))}
            className="text-sm font-bold text-sky-700 hover:text-sky-800">
            {allOpen ? 'Collapse all modules' : 'Expand all modules'}
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {course.modules.map((m, i) => {
          const items = m.item_ids.map(id => byId.get(id)).filter((x): x is CourseItem => Boolean(x))
          const isOpen = open.has(m.id)
          const finished = items.filter(x => done.has(x.item_id)).length
          return (
            <section key={m.id} className={cn(i > 0 && 'border-t border-border')}>
              <h3>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(prev => { const next = new Set(prev); if (next.has(m.id)) next.delete(m.id); else next.add(m.id); return next })}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface">
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-extrabold text-text-primary">{m.title}</span>
                    <span className="block text-xs text-text-muted">
                      Module {i + 1} · {plural(items.length, 'lesson')}{m.minutes ? ` · ${formatMinutes(m.minutes)}` : ''}
                      {enrolled && ` · ${finished} of ${items.length} done`}
                    </span>
                  </span>
                  <ExpandMoreIcon sx={{ fontSize: 22 }} className={cn('text-sky-700 transition-transform', isOpen && 'rotate-180')} />
                </button>
              </h3>
              {isOpen && (
                <>
                  {m.summary && <p className="px-4 pb-3 text-sm text-slate-700 max-w-3xl">{m.summary}</p>}
                  {items.length > 0 && list(items)}
                </>
              )}
            </section>
          )
        })}
        {loose.length > 0 && (
          <section className={cn(course.modules.length > 0 && 'border-t border-border')}>
            {course.modules.length > 0 && <h3 className="px-4 pt-3.5 pb-2 text-base font-extrabold text-text-primary">More lessons</h3>}
            {list(loose)}
          </section>
        )}
        <div className="flex items-center gap-3.5 border-t border-border bg-surface px-4 py-3.5">
          <WorkspacePremiumOutlinedIcon sx={{ fontSize: 28 }} className="text-text-muted" />
          <p className="text-sm">
            <b className="block text-text-primary">Certificate of completion</b>
            <span className="text-text-muted">Planned. Lessons you finish now will count once certificates launch.</span>
          </p>
        </div>
      </div>
      {!enrolled && !course.is_locked && !course.my_relation && <p className="mt-3 text-sm text-text-muted">Enroll to track your progress. A lesson counts once you open it from this page.</p>}
    </div>
  )
}
