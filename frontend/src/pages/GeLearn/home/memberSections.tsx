import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { cn } from '@/lib/utils'
import { Byline } from '@/components/gelearn/discovery/Byline'
import { CardThumb } from '@/components/gelearn/discovery/CardThumb'
import { ListRow } from '@/components/gelearn/discovery/ListBox'
import { SectionHeading } from '@/components/gelearn/discovery/SectionHeading'
import type { DiscoveryCard, MyHomeData } from '@/types/discovery'
import type { CourseItemKind } from '@/types/learning'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import { CardGrid, Section } from './sections'
import type { HeadingValue, PrefixValue, WelcomeValue } from './types'

function NextKindIcon({ kind }: { kind: CourseItemKind }) {
  const Icon = COURSE_ITEM_KINDS[kind].icon
  return <Icon sx={{ fontSize: 18 }} className="text-sky-700" />
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const BUTTON_PRIMARY = 'inline-flex items-center gap-1.5 rounded-lg gradient-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90'
const BUTTON_OUTLINE = 'inline-flex items-center rounded-lg border border-sky-700 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 hover:bg-surface'

// ── Welcome: continue learning, this week, career goal ─────────────────────

export function WelcomeSection({ value, me, name }: { value: WelcomeValue; me: MyHomeData; name: string }) {
  const current = me.continue
  const today = new Date().toLocaleDateString('en-CA')
  return (
    <div className="bg-linear-to-b from-surface to-white">
      <Section label="Your learning" className="pt-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="grid gap-5 rounded-2xl border border-border bg-white p-5 shadow-sm sm:grid-cols-3 sm:items-center lg:col-span-3">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <h1 className="text-2xl font-extrabold text-text-primary">Welcome back, {name}</h1>
              {current ? (
                <>
                  <p className="mt-3 text-xs font-bold uppercase tracking-widest text-text-muted">Continue learning</p>
                  <h2 className="text-lg font-bold text-text-primary">{current.course.title}</h2>
                  <Byline author={current.course.author} company={current.course.company} className="mb-2" />
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-valuenow={current.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Course progress"
                  >
                    <div className="h-full rounded-full gradient-brand" style={{ width: `${current.percent}%` }} />
                  </div>
                  <p className="mt-1 text-xs font-medium text-text-muted">
                    {current.completed} of {current.total} lessons complete · {current.percent}%
                  </p>
                  {current.next_item && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                      <NextKindIcon kind={current.next_item.kind} />
                      <span>Next: <b className="text-text-primary">{current.next_item.title}</b>{current.next_item.meta && ` · ${current.next_item.meta}`}</span>
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={current.course.path} className={BUTTON_PRIMARY}>Resume <ArrowForwardIcon sx={{ fontSize: 16 }} /></Link>
                    <Link to="/account?tab=learning" className={BUTTON_OUTLINE}>My Learning</Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm text-slate-700">
                    {me.enrolled_count ? 'You’ve finished everything you enrolled in. Pick your next course.' : 'Start your first course. Many are free.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/courses" className={BUTTON_PRIMARY}>Explore courses <ArrowForwardIcon sx={{ fontSize: 16 }} /></Link>
                    <Link to="/account?tab=learning" className={BUTTON_OUTLINE}>My Learning</Link>
                  </div>
                </>
              )}
            </div>
            {current && (
              <div className="aspect-video overflow-hidden rounded-xl">
                <CardThumb type="course" imageUrl={current.course.image_url} iconSize={56} />
              </div>
            )}
          </div>

          <aside className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5" aria-label="This week">
            <h2 className="text-sm font-extrabold text-text-primary">This week</h2>
            <ol className="grid grid-cols-7 gap-1 text-center">
              {me.week.days.map((day, i) => {
                const done = day.count > 0
                const isToday = day.date === today
                return (
                  <li key={day.date} className="flex flex-col items-center gap-1 text-xs font-semibold text-text-muted">
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full border',
                        done ? 'border-secondary bg-secondary text-white' : isToday ? 'border-2 border-primary' : 'border-border',
                      )}
                      aria-label={`${day.date}: ${day.count} lesson${day.count === 1 ? '' : 's'}`}
                    >
                      {done && <CheckIcon sx={{ fontSize: 16 }} />}
                    </span>
                    {WEEKDAYS[i]}
                  </li>
                )
              })}
            </ol>
            <p className="text-xs text-text-muted">
              {me.week.total} lesson{me.week.total === 1 ? '' : 's'} completed this week
            </p>
            <ul className="grid gap-1.5 text-sm text-slate-700">
              <li><b className="tabular-nums text-text-primary">{me.enrolled_count}</b> course{me.enrolled_count === 1 ? '' : 's'} enrolled</li>
              <li><Link to="/account?tab=saved" className="hover:text-sky-700"><b className="tabular-nums text-text-primary">{me.saved_count}</b> saved item{me.saved_count === 1 ? '' : 's'}</Link></li>
            </ul>
          </aside>
        </div>

        <p className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-sky-100 bg-surface px-4 py-3 text-sm text-slate-700">
          <FlagOutlinedIcon sx={{ fontSize: 18 }} className="text-sky-700" />
          {me.career_goal ? (
            <>Your goal: <b className="text-text-primary">{me.career_goal.name}</b>. Courses for it are suggested below.</>
          ) : (
            <>{value.goal_prompt}</>
          )}
          <Link to="/account?tab=settings#career-goal" className="font-bold text-sky-700 hover:text-sky-800">
            {me.career_goal ? 'Change goal' : 'Set your goal'}
          </Link>
        </p>
      </Section>
    </div>
  )
}

// ── Recently viewed and similar ────────────────────────────────────────────

function Panel({ title, cards }: { title: string; cards: DiscoveryCard[] }) {
  if (!cards.length) return null
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-xl border border-border p-3.5">
      <h3 className="px-1 pb-1 text-sm font-extrabold text-text-primary">{title}</h3>
      {cards.slice(0, 3).map(card => <ListRow key={`${card.type}-${card.id}`} card={card} />)}
    </div>
  )
}

export function ResumeSection({ value, me }: { value: HeadingValue; me: MyHomeData }) {
  if (!me.recently_viewed.length && !me.similar.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Recently viewed" cards={me.recently_viewed} />
        <Panel title="Similar to your activity" cards={me.similar} />
      </div>
    </Section>
  )
}

// ── Recommendation rows ────────────────────────────────────────────────────

export function BecauseSection({ value, me }: { value: PrefixValue; me: MyHomeData }) {
  if (!me.because?.courses.length) return null
  return (
    <Section label={`${value.heading_prefix} ${me.because.course.title}`}>
      <SectionHeading title={`${value.heading_prefix} ${me.because.course.title}`} subtitle="Courses on the same topics." />
      <CardGrid cards={me.because.courses} />
    </Section>
  )
}

export function GoalCoursesSection({ value, me }: { value: PrefixValue; me: MyHomeData }) {
  if (!me.career_goal || !me.goal_courses.length) return null
  const title = `${value.heading_prefix} ${me.career_goal.name}`
  return (
    <Section label={title}>
      <SectionHeading title={title} seeAllLabel="Change goal" seeAllUrl="/account?tab=settings#career-goal" />
      <CardGrid cards={me.goal_courses} />
    </Section>
  )
}

export function QuickVideosSection({ value, me }: { value: HeadingValue; me: MyHomeData }) {
  if (!me.quick_videos.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <CardGrid cards={me.quick_videos} />
    </Section>
  )
}

// ── Tenders closing soon ───────────────────────────────────────────────────

function closingLabel(daysLeft: number | null | undefined) {
  if (daysLeft === null || daysLeft === undefined) return 'Open'
  if (daysLeft <= 0) return 'Closes today'
  if (daysLeft === 1) return 'Closes tomorrow'
  return `Closes in ${daysLeft} days`
}

export function ClosingTendersSection({ value, me }: { value: HeadingValue; me: MyHomeData }) {
  if (!me.closing_tenders.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {me.closing_tenders.map(tender => (
          <Link
            key={tender.id}
            to={tender.path}
            className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted">{tender.sector || 'Tender'}</span>
              <span className={cn(
                'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold',
                (tender.days_left ?? 99) <= 7 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
              )}>
                {closingLabel(tender.days_left)}
              </span>
            </span>
            <h3 className="text-sm font-bold leading-snug text-text-primary">{tender.title}</h3>
            <p className="mt-auto text-xs text-text-muted">{tender.authority}</p>
          </Link>
        ))}
      </div>
    </Section>
  )
}
