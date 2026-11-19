import { Link, useLocation } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VerifiedIcon from '@mui/icons-material/Verified'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import ViewModuleOutlinedIcon from '@mui/icons-material/ViewModuleOutlined'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import ScheduleIcon from '@mui/icons-material/Schedule'
import type { ReactNode } from 'react'
import { Button, buttonVariants } from '@/components/ui/Button'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { COURSE_ITEM_KINDS } from '@/components/gelearn/courseItemKinds'
import { SaveButton } from '@/components/engagement/SaveButton'
import { formatPrice, getMediaUrl } from '@/lib/utils'
import { returnState } from '@/lib/authRedirect'
import { useRole } from '@/hooks/useRole'
import type { CourseDetail, CourseItem } from '@/types/learning'
import { PublisherLogo } from './CourseSide'
import { LEVEL_LABEL, aboutTime, formatMinutes, initials, lessonFormats, monthYear, plural, type SectionId } from './format'

interface CourseHeroProps {
  course: CourseDetail
  signedIn: boolean
  busy: boolean
  message: string
  onEnroll: () => void
  onJump: (id: SectionId) => void
  /** Records that the learner opened a lesson from the course page. */
  onOpen: (item: CourseItem) => void
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 px-4 py-3">
      <dt className="flex items-center gap-1.5 pt-0.5 text-xs font-extrabold uppercase tracking-wide text-text-muted">
        <span className="text-sky-700">{icon}</span>{label}
      </dt>
      <dd className="col-span-2 grid gap-px text-sm font-extrabold text-text-primary min-w-0">{children}</dd>
    </div>
  )
}

const sub = 'text-xs font-medium text-text-muted'

export function CourseHero({ course, signedIn, busy, message, onEnroll, onJump, onOpen }: CourseHeroProps) {
  const location = useLocation()
  const { isCompany } = useRole()
  const enrolled = course.enrollment !== null
  const nextItem = course.items.find(i => i.item_id === course.next_item_id) ?? null
  const instructors = course.instructors
  const firstTopic = course.topics[0]
  const firstRole = course.roles[0]
  const lessons = course.items.length
  const finished = enrolled && course.enrollment!.total > 0 && course.enrollment!.completed >= course.enrollment!.total

  let enrollAction: ReactNode
  if (!course.is_locked) {
    enrollAction = <Button size="lg" onClick={onEnroll} disabled={busy}>{busy ? 'Enrolling…' : course.access === 'paid' ? 'Enroll' : 'Enroll for free'}</Button>
  } else if (course.access === 'paid' && course.price) {
    enrollAction = <Button size="lg" disabled>{formatPrice(course.price, course.currency)} · Checkout coming soon</Button>
  } else {
    enrollAction = <Button size="lg" onClick={onEnroll}>Sign in to enroll</Button>
  }
  const accessNote = course.access === 'members'
    ? 'Members course: free with a GeLearn account'
    : course.access === 'free' ? 'Free course' : 'Paid course'

  return (
    <div className="bg-linear-to-b from-brand-tint via-sky-50/40 to-white">
      <div className="mx-auto max-w-330 px-4 pt-4 pb-10 md:px-6">
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-text-muted">
          <Link to="/" className="font-semibold text-sky-700 hover:underline">Home</Link>
          <ChevronRightIcon sx={{ fontSize: 16 }} aria-hidden="true" />
          <Link to="/courses" className="font-semibold text-sky-700 hover:underline">Courses</Link>
          {firstTopic && <>
            <ChevronRightIcon sx={{ fontSize: 16 }} aria-hidden="true" />
            <Link to={`/topics/${firstTopic.slug}`} className="font-semibold text-sky-700 hover:underline">{firstTopic.name}</Link>
          </>}
          <ChevronRightIcon sx={{ fontSize: 16 }} aria-hidden="true" />
          <span aria-current="page" className="truncate max-w-xs">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3 lg:items-center">
          <div className="lg:col-span-2 min-w-0">
            {course.publisher && (
              <Link to={`/c/${course.publisher.slug}`} className="inline-flex items-center gap-3 text-base font-bold text-text-primary hover:text-sky-700">
                <PublisherLogo logoUrl={course.publisher.logo_url} />
                {course.publisher.name}
                {course.publisher.verified && <VerifiedIcon sx={{ fontSize: 18 }} className="-ml-1.5 text-primary" titleAccess="Verified company" />}
              </Link>
            )}
            <h1 className="mt-3 mb-2.5 text-balance text-3xl font-extrabold leading-tight text-text-primary lg:text-4xl">{course.title}</h1>
            {course.summary && <p className="max-w-2xl text-base text-slate-700">{course.summary}</p>}

            {instructors.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-slate-700">
                <span className="flex -space-x-2">
                  {instructors.slice(0, 3).map(p => p.avatar_url
                    ? <img key={p.username} src={getMediaUrl(p.avatar_url)} alt="" className="size-8 rounded-full border-2 border-white object-cover" />
                    : <span key={p.username} className="size-8 rounded-full border-2 border-white bg-white text-xs font-bold text-text-muted flex items-center justify-center shadow-sm">{initials(p.display_name)}</span>)}
                </span>
                <span>
                  {instructors.length === 1 ? 'Instructor: ' : 'Instructors: '}
                  {instructors.map((p, i) => (
                    <span key={p.username}>
                      {i > 0 && (i === instructors.length - 1 ? ' and ' : ', ')}
                      <Link to={`/u/${p.username}`} className="font-bold text-sky-700 underline underline-offset-2 hover:text-sky-800">{p.display_name}</Link>
                    </span>
                  ))}
                  {instructors.length === 1 && instructors[0].role_title && <> · {instructors[0].role_title}{instructors[0].company ? `, ${instructors[0].company.name}` : ''}</>}
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {course.level && <span className="rounded border border-border bg-white px-1.5 py-0.5 font-bold text-slate-700">{LEVEL_LABEL[course.level]}</span>}
              <AccessBadge access={course.access} price={course.price} currency={course.currency} showFree />
              <span>{course.language}<span className="mx-1.5 opacity-60">·</span>Updated {monthYear(course.updated_at)}</span>
            </div>

            {course.my_relation ? (
              <div className="mt-6 max-w-xl rounded-xl border border-border bg-white p-4 shadow-sm flex flex-col gap-2">
                <p className="text-sm font-extrabold text-text-primary">{course.my_relation === 'owner' ? 'This is your course' : 'You teach this course'}</p>
                <p className="text-sm text-slate-700">
                  {course.enrolled_count > 0
                    ? <><b className="tabular-nums">{course.enrolled_count.toLocaleString('en-IN')}</b> {course.enrolled_count === 1 ? 'learner has' : 'learners have'} enrolled. </>
                    : 'No learners have enrolled yet. '}
                  {course.my_relation === 'owner' ? "You can't enroll in or review your own course." : "You can't enroll in or review a course you teach."}
                </p>
                {course.my_relation === 'owner' && (
                  <Link to={isCompany ? '/studio/courses' : '/account?tab=courses'} className={`${buttonVariants({ variant: 'secondary', size: 'md' })} self-start`}>
                    Manage your courses <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  </Link>
                )}
              </div>
            ) : enrolled && course.enrollment ? (
              <div className="mt-6 max-w-xl rounded-xl border border-border bg-white p-4 shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between gap-3 text-sm font-bold text-slate-700">
                  <span>Your progress</span>
                  <span className="tabular-nums">{course.enrollment.completed} of {plural(course.enrollment.total, 'lesson')} · {course.enrollment.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden" role="progressbar" aria-valuenow={course.enrollment.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
                  <div className="h-full bg-linear-to-r from-primary to-secondary transition-all duration-300" style={{ width: `${course.enrollment.percent}%` }} />
                </div>
                {nextItem ? (
                  <p className="flex items-center gap-2 text-sm text-slate-700">
                    <PlayCircleOutlinedIcon sx={{ fontSize: 18 }} className="text-sky-700 shrink-0" />
                    <span className="min-w-0">Up next: <b className="text-text-primary">{nextItem.title}</b> · {COURSE_ITEM_KINDS[nextItem.kind].label}{nextItem.minutes ? ` · ${formatMinutes(nextItem.minutes)}` : ''}</span>
                  </p>
                ) : finished ? <p className="text-sm font-semibold text-emerald-800">You&apos;ve completed this course.</p>
                  : course.enrollment.total > 0 && <p className="text-sm text-slate-700">The lessons you haven&apos;t opened are locked. Unlock them to complete the course and get your certificate.</p>}
                <div className="flex flex-wrap gap-2">
                  {course.enrollment.certificate_code && (
                    <Link to={`/certificates/${course.enrollment.certificate_code}`} className={buttonVariants({ size: 'md' })}>
                      <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} /> View your certificate
                    </Link>
                  )}
                  {nextItem && (
                    <Link to={nextItem.path} onClick={() => onOpen(nextItem)} className={buttonVariants({ size: 'md' })}>
                      {course.enrollment.completed ? 'Resume' : 'Start the course'} <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </Link>
                  )}
                  {course.my_review?.can_review && (
                    <Button variant="secondary" size="md" onClick={() => onJump('cp-reviews')}>
                      {course.my_review.review ? 'Edit your review' : 'Rate this course'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                  {enrollAction}
                  <SaveButton contentType="playlist" objectId={course.id} className="h-12 px-5" />
                </div>
                <p className="mt-2.5 text-sm text-slate-700">
                  {course.enrolled_count > 0 && <><b className="tabular-nums">{course.enrolled_count.toLocaleString('en-IN')}</b> {course.enrolled_count === 1 ? 'learner' : 'learners'} already enrolled · </>}
                  {accessNote}
                  {!signedIn && course.access !== 'paid' && <> · <Link to="/register" state={returnState(location)} className="font-semibold text-sky-700 hover:underline">Create an account</Link></>}
                </p>
              </>
            )}
            {message && <p role="alert" className="mt-2 text-sm font-semibold text-red-600">{message}</p>}

            {firstRole && (
              <p className="mt-3 text-sm text-slate-700">
                Part of the career path: <Link to={`/roles/${firstRole.slug}`} className="font-bold text-sky-700 hover:underline">{firstRole.name}</Link>
              </p>
            )}
          </div>

          <dl className="rounded-xl border border-border bg-white overflow-hidden divide-y divide-border" aria-label="Course at a glance">
            <Fact icon={<ViewModuleOutlinedIcon sx={{ fontSize: 17 }} />} label="Content">
              <button type="button" onClick={() => onJump('cp-lessons')} className="text-left text-sky-700 hover:underline">
                {course.modules.length > 0 && `${plural(course.modules.length, 'module')}, `}{plural(lessons, 'lesson')}
              </button>
              <span className={sub}>{lessonFormats(course.lesson_counts)}</span>
            </Fact>
            <Fact icon={<StarBorderIcon sx={{ fontSize: 17 }} />} label="Rating">
              {course.rating_summary ? (
                <>
                  <span className="inline-flex items-center gap-1"><StarIcon sx={{ fontSize: 18 }} className="text-amber-600" />{course.rating_summary.average.toFixed(1)}</span>
                  <button type="button" onClick={() => onJump('cp-reviews')} className={`${sub} text-left text-sky-700 hover:underline`}>
                    {plural(course.rating_summary.count, 'learner review')}
                  </button>
                </>
              ) : (
                <>Not rated yet<span className={sub}>Shown once 3 learners review it</span></>
              )}
            </Fact>
            {course.level && (
              <Fact icon={<SignalCellularAltIcon sx={{ fontSize: 17 }} />} label="Level">
                {LEVEL_LABEL[course.level]}
                {course.prerequisites[0] && <span className={sub}>{course.prerequisites[0]}</span>}
              </Fact>
            )}
            {course.total_minutes > 0 && (
              <Fact icon={<ScheduleIcon sx={{ fontSize: 17 }} />} label="Time">
                {aboutTime(course.total_minutes)}
                <span className={sub}>Self-paced, any order</span>
              </Fact>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
