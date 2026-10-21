/**
 * Placeholder for a marketing page while its code or CMS content loads.
 * Shaped like a PageHero over a card row and at least one screen tall, so the
 * footer never jumps up into view during navigation.
 */
export function PageSkeleton() {
  return (
    <main className="min-h-screen" aria-busy="true" aria-label="Loading page">
      <section className="bg-brand-tint bg-brand-tint-static pt-36 pb-20 lg:pt-44 lg:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 motion-safe:animate-pulse" aria-hidden="true">
          <div className="h-3 w-28 rounded bg-primary/20" />
          <div className="mt-5 h-10 lg:h-12 w-full max-w-2xl rounded-lg bg-slate-200/80" />
          <div className="mt-3 h-10 lg:h-12 w-2/3 max-w-xl rounded-lg bg-slate-200/80" />
          <div className="mt-6 h-4 w-full max-w-xl rounded bg-slate-200/70" />
          <div className="mt-2 h-4 w-3/4 max-w-lg rounded bg-slate-200/70" />
        </div>
      </section>
      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 motion-safe:animate-pulse" aria-hidden="true">
          <div className="mx-auto h-8 w-72 max-w-full rounded-lg bg-slate-100" />
          <div className="mx-auto mt-4 h-4 w-96 max-w-full rounded bg-slate-100" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map(i => <div key={i} className="h-56 rounded-2xl bg-slate-100" />)}
          </div>
        </div>
      </section>
    </main>
  )
}
