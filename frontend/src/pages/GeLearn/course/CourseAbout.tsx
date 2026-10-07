import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CheckIcon from '@mui/icons-material/Check'
import PlayLessonOutlinedIcon from '@mui/icons-material/PlayLessonOutlined'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ChecklistIcon from '@mui/icons-material/Checklist'
import TranslateIcon from '@mui/icons-material/Translate'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { cn, formatPrice } from '@/lib/utils'
import { returnState } from '@/lib/authRedirect'
import type { CourseDetail } from '@/types/learning'
import { lessonFormats } from './format'

function Detail({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="size-10 shrink-0 rounded-xl bg-brand-tint text-sky-700 flex items-center justify-center">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-text-primary">{title}</p>
        <p className="text-sm text-text-muted">{children}</p>
      </div>
    </div>
  )
}

const H3 = 'mt-7 mb-3 text-base font-extrabold text-text-primary'

/** What you'll learn, skills, details to know, and the long description. */
export function CourseAbout({ course, signedIn }: { course: CourseDetail; signedIn: boolean }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const long = course.description.length > 420
  const access = course.access === 'members'
    ? <>Free with a GeLearn account.{!signedIn && <> <Link to="/register" state={returnState(location)} className="font-bold text-sky-700 hover:underline">Sign up</Link></>}</>
    : course.access === 'free' ? 'Open to everyone, no account needed.' : <>{course.price ? formatPrice(course.price, course.currency) : 'Paid'}. Checkout is coming soon.</>
  const instructorCount = course.instructors.length

  return (
    <div className="max-w-4xl">
      {course.outcomes.length > 0 && (
        <>
          <h2 className="mb-3.5 text-xl font-extrabold text-text-primary lg:text-2xl">What you&apos;ll learn</h2>
          <ul className="grid gap-3 rounded-xl border border-border bg-white p-5 sm:grid-cols-2 sm:gap-x-8">
            {course.outcomes.map(outcome => (
              <li key={outcome} className="flex gap-2.5 text-sm text-slate-700">
                <CheckIcon sx={{ fontSize: 20 }} className="text-emerald-700 shrink-0" />{outcome}
              </li>
            ))}
          </ul>
        </>
      )}

      {course.topics.length > 0 && (
        <>
          <h3 className={cn(H3, course.outcomes.length === 0 && 'mt-0')}>Skills you&apos;ll gain</h3>
          <div className="flex flex-wrap gap-2">
            {course.topics.map(topic => (
              <Link key={topic.id} to={`/topics/${topic.slug}`}
                className="rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:border-primary hover:text-text-primary transition-colors">
                {topic.name}
              </Link>
            ))}
          </div>
        </>
      )}

      <h3 className={H3}>Details to know</h3>
      <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-8">
        <Detail icon={<PlayLessonOutlinedIcon sx={{ fontSize: 20 }} />} title="Lesson formats">
          {lessonFormats(course.lesson_counts) || 'Lessons are being added.'}
          {instructorCount > 0 && `, from ${instructorCount === 1 ? 'one instructor' : `${instructorCount} instructors`}`}
        </Detail>
        <Detail icon={<LockOpenOutlinedIcon sx={{ fontSize: 20 }} />} title={course.access === 'members' ? 'Members course' : course.access === 'free' ? 'Free course' : 'Paid course'}>
          {access}
        </Detail>
        {course.roles.length > 0 && (
          <Detail icon={<BadgeOutlinedIcon sx={{ fontSize: 20 }} />} title="Who it's for">
            {course.roles.map((role, i) => (
              <span key={role.id}>
                {i > 0 && (i === course.roles.length - 1 ? ' and ' : ', ')}
                <Link to={`/roles/${role.slug}`} className="font-semibold text-sky-700 hover:underline">{role.name}s</Link>
              </span>
            ))}
          </Detail>
        )}
        {course.prerequisites.length > 0 && (
          <Detail icon={<ChecklistIcon sx={{ fontSize: 20 }} />} title="Before you start">{course.prerequisites.join('; ')}</Detail>
        )}
        <Detail icon={<TranslateIcon sx={{ fontSize: 20 }} />} title={`Taught in ${course.language}`}>Self-paced; take the lessons in any order.</Detail>
        <Detail icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 20 }} />} title="Certificate">Not yet. Completion certificates are planned.</Detail>
      </div>

      {course.description.trim() && (
        <>
          <h3 className={H3}>About this course</h3>
          <div id="cp-desc" className={cn('max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-700', long && !open && 'max-h-32 overflow-hidden mask-b-from-60%')}>
            {course.description}
          </div>
          {long && (
            <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="cp-desc"
              className="mt-1.5 inline-flex items-center gap-0.5 text-sm font-bold text-sky-700 hover:text-sky-800">
              {open ? 'Show less' : 'Show more'}
              <ExpandMoreIcon sx={{ fontSize: 20 }} className={cn('transition-transform', open && 'rotate-180')} />
            </button>
          )}
        </>
      )}
    </div>
  )
}
