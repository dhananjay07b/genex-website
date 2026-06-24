import { EVENT_CONFIG } from '@/config/eventConfig'

export function EventBanner() {
  const eventDateLabel = EVENT_CONFIG.date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <section
      className="relative overflow-hidden bg-surface py-16 lg:py-20"
      aria-label="Upcoming launch webinar"
    >
      {/* 4px brand gradient top border */}
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ background: 'linear-gradient(to right, #1AAEE8, #00C5B0, #00D97E)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">

          <div className="max-w-xl">
            <span className="gradient-brand-text text-xs font-bold uppercase tracking-widest">
              Upcoming Event
            </span>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-text-primary lg:text-4xl">
              Join Our Launch Webinar
            </h2>
            <p className="mt-3 text-base text-text-muted">
              Be the first to see what we&apos;ve been building.{' '}
              <span className="font-semibold text-text-primary">Live on {eventDateLabel}.</span>
            </p>
          </div>

          <a
            href={EVENT_CONFIG.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-14 shrink-0 rounded-lg px-10 font-heading text-base font-bold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] inline-flex items-center justify-center"
            style={{
              background: 'linear-gradient(to right, #1AAEE8, #00C5B0, #00D97E, #00C5B0, #1AAEE8)',
              backgroundSize: '200% 100%',
            }}
          >
            Register Now
          </a>
        </div>
      </div>
    </section>
  )
}
