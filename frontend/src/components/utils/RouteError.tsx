import { useEffect } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'
import NotFound from '@/pages/NotFound'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button, buttonVariants } from '@/components/ui/Button'
import { canReloadForNewBuild, isStaleBuildError, reloadForNewBuild } from '@/lib/staleBuild'

/**
 * Shown when a page fails to render. Bundled with the app (never lazy-loaded),
 * so it still works when the failure is a code file that couldn't be fetched.
 */
export function RouteError() {
  const error = useRouteError()
  // A tab left open across a deploy: reload into the new build (blank meanwhile, so
  // nothing flashes). If that already happened a moment ago, show the error instead.
  const reloading = isStaleBuildError(error) && canReloadForNewBuild()

  useEffect(() => {
    if (import.meta.env.DEV) console.error('Route error:', error)
    if (reloading) reloadForNewBuild()
  }, [error, reloading])

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  if (reloading) return <main className="min-h-[60vh]" aria-busy="true" />

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <PageMeta title="Something Went Wrong" description="This page couldn't be displayed." noIndex />
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-extrabold text-text-primary mb-4">Something went wrong</h1>
        <p className="text-text-muted mb-8">
          This page couldn't be displayed. Reloading usually fixes it; if it doesn't, please try again in a few minutes.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => window.location.reload()}>Reload page</Button>
          <Link to="/" className={buttonVariants({ variant: 'secondary' })}>Back to Home</Link>
        </div>
      </div>
    </main>
  )
}
