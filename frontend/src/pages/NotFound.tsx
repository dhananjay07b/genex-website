import { Link, useRouteError } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'

export default function NotFound() {
  const error = useRouteError()
  if (import.meta.env.DEV && error) console.error('Route error:', error)

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <PageMeta title="Page Not Found" description="This page doesn't exist." noIndex />
      <div className="text-center max-w-md">
        <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3">404</p>
        <h1 className="text-3xl font-extrabold text-text-primary mb-4">Page not found</h1>
        <p className="text-text-muted mb-8">
          The page you're looking for doesn't exist, or the link you followed may be out of date.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
