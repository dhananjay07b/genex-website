import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageMeta } from '@/components/seo/PageMeta'
import { buttonVariants } from '@/components/ui/Button'
import { isGeLearnHost } from '@/lib/host'

interface Suggestion {
  label: string
  description: string
  to: string
}

// Shared by both sites, so the way out depends on which site this is.
const MARKETING = {
  secondary: { label: 'Contact Us', to: '/contact' },
  suggestions: [
    { label: 'Portfolio', description: 'Monitoring, SCADA, storage and EV software in service today.', to: '/portfolio' },
    { label: 'Innovations', description: 'What our engineers are building next.', to: '/innovations' },
    { label: 'About Genex', description: 'How we work, our team and our track record.', to: '/about' },
  ] satisfies Suggestion[],
}

const GELEARN = {
  secondary: { label: 'Search GeLearn', to: '/search' },
  suggestions: [
    { label: 'Courses', description: 'Structured learning from industry experts.', to: '/courses' },
    { label: 'Topics', description: 'Browse everything by subject.', to: '/topics' },
    { label: 'GeAcademy', description: 'Technical articles from the field.', to: '/geacademy' },
  ] satisfies Suggestion[],
}

export default function NotFound() {
  const { secondary, suggestions } = isGeLearnHost() ? GELEARN : MARKETING

  return (
    <main className="min-h-screen bg-brand-tint flex items-center px-6 pt-32 pb-20 lg:px-8">
      <PageMeta title="Page Not Found" description="This page doesn't exist." noIndex />
      <div className="w-full max-w-5xl mx-auto text-center">
        <p className="gradient-brand-text text-8xl lg:text-9xl font-extrabold leading-none tracking-tight">404</p>
        <h1 className="mt-6 text-3xl lg:text-4xl font-extrabold text-text-primary">Page not found</h1>
        <p className="mt-4 mx-auto max-w-lg text-base lg:text-lg text-text-muted leading-relaxed">
          The page you're looking for doesn't exist, or the link you followed may be out of date.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>Back to Home</Link>
          <Link to={secondary.to} className={buttonVariants({ variant: 'secondary', size: 'lg' })}>{secondary.label}</Link>
        </div>

        <div className="mt-16 lg:mt-20">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">You might be looking for</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3 text-left">
            {suggestions.map(s => (
              <Link
                key={s.to}
                to={s.to}
                className="group flex flex-col rounded-2xl border border-border bg-white/80 p-6 transition-all duration-200 hover:border-primary hover:shadow-md"
              >
                <span className="flex items-center justify-between text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
                  {s.label}
                  <ArrowForwardIcon sx={{ fontSize: 18 }} className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="mt-2 text-sm text-text-muted leading-relaxed">{s.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
