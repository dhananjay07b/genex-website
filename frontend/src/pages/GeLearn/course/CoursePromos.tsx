import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'

/** Two cross-links shown on every course page: teach on GeLearn, and GeLearn for Companies. */
export function CoursePromos() {
  const cards = [
    { to: '/for-professionals', tag: 'For Professionals', title: 'Work in the sector? Teach a course like this one',
      body: 'Verified Professionals publish courses from their own posts and videos, under their company name.',
      cta: 'How to become a Professional', icon: <EngineeringOutlinedIcon sx={{ fontSize: 44 }} />, tone: 'bg-emerald-50', ink: 'text-emerald-800' },
    { to: '/for-companies', tag: 'GeLearn for Companies', title: 'Publish your own courses from Company Studio',
      body: "Turn your company's articles, research and podcasts into courses, shown with a verified badge.",
      cta: 'See how it works', icon: <VerifiedOutlinedIcon sx={{ fontSize: 44 }} />, tone: 'bg-slate-50 border border-slate-200', ink: 'text-sky-700' },
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map(card => (
        <Link key={card.to} to={card.to} className={`group flex items-center justify-between gap-5 rounded-2xl p-6 ${card.tone}`}>
          <span className="flex flex-col gap-2 max-w-md">
            <span className={`text-xs font-extrabold uppercase tracking-widest ${card.ink}`}>{card.tag}</span>
            <span className="text-lg font-extrabold text-text-primary">{card.title}</span>
            <span className="text-sm text-slate-700">{card.body}</span>
            <span className="inline-flex items-center gap-0.5 text-sm font-bold text-sky-700">{card.cta} <ArrowForwardIcon sx={{ fontSize: 18 }} className="transition-transform group-hover:translate-x-0.5" /></span>
          </span>
          <span className={`hidden sm:flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white shadow-sm ${card.ink}`}>{card.icon}</span>
        </Link>
      ))}
    </div>
  )
}
