import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { marketingPath } from '@/lib/host'
import type { CourseDetail } from '@/types/learning'

/** GeLearn's standard questions, worded for this course's access. */
function standardFaqs(course: CourseDetail): [string, string][] {
  const access: [string, string] = course.access === 'members'
    ? ['Is this course free?', 'It is a Members course: free once you sign in with a GeLearn account. Lessons marked Preview are open to everyone.']
    : course.access === 'free'
      ? ['Is this course free?', 'Yes. It is open to everyone; you only need an account to enroll and track your progress.']
      : ['How do I buy this course?', 'Checkout is coming soon. Lessons marked Preview are open to everyone in the meantime.']
  return [
    access,
    ['Do I have to take the lessons in order?', 'No. Open the lessons in any order from this page. Each one counts as done once you have opened it here, and your progress is saved to your account.'],
    ['Will I get a certificate?', 'Yes. Open every lesson from this page and you get a GeLearn certificate of completion, with your name, the course and its instructors. You can share it on LinkedIn and anyone can check it with its link. It is not an accredited qualification.'],
    ['Can my company enroll a team?', 'Team enrolment is planned. Contact Genex if you want to train a group now.'],
  ]
}

/** The course author's questions first, then the standard ones; a help box beside them. */
export function CourseFaq({ course }: { course: CourseDetail }) {
  const faqs: [string, string, boolean][] = [
    ...course.faqs.map(f => [f.question, f.answer, true] as [string, string, boolean]),
    ...standardFaqs(course).map(([q, a]) => [q, a, false] as [string, string, boolean]),
  ]
  return (
    <div>
      <h2 className="mb-4 text-xl font-extrabold text-text-primary lg:text-2xl">Frequently asked questions</h2>
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-2 border-t border-border">
          {faqs.map(([question, answer, own]) => (
            <details key={question} className="group border-b border-border">
              <summary className="flex cursor-pointer list-none details-marker-hidden items-center gap-2.5 px-1 py-3.5 text-sm font-bold text-text-primary">
                <ExpandMoreIcon sx={{ fontSize: 20 }} className="text-sky-700 transition-transform group-open:rotate-180" />
                {question}
              </summary>
              <p className="px-1 pb-4 pl-8 text-sm text-slate-700 max-w-3xl whitespace-pre-line">
                {answer}{own && <span className="text-text-muted"> (from the course author)</span>}
              </p>
            </details>
          ))}
        </div>
        <aside className="rounded-xl border border-border bg-white p-5 flex flex-col gap-2.5">
          <HelpOutlineIcon sx={{ fontSize: 26 }} className="text-sky-700" />
          <h3 className="text-base font-extrabold text-text-primary">More questions?</h3>
          <p className="text-sm text-slate-700">Ask Genex about team access, payments or anything else about this course.</p>
          <a href={marketingPath('/contact')} className="inline-flex items-center gap-1 text-sm font-bold text-sky-700 hover:text-sky-800">
            Contact Genex <ArrowForwardIcon sx={{ fontSize: 18 }} />
          </a>
        </aside>
      </div>
    </div>
  )
}
