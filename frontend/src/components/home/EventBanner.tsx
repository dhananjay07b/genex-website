import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import KeyboardArrowUpIcon   from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { EventBannerApiValue } from '@/types/api'

interface EventBannerProps {
  events: EventBannerApiValue[]
}

const VARIANTS = {
  enter: (dir: number) => ({ y: dir > 0 ? '60%' : '-60%', opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit:  (dir: number) => ({ y: dir > 0 ? '-60%' : '60%', opacity: 0 }),
}

const TRANSITION = { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const }

export function EventBanner({ events }: EventBannerProps) {
  const n = events.length
  const [[active, dir], setPage] = useState([0, 0])
  const [paused, setPaused] = useState(false)

  const go = useCallback((next: number, d: number) => {
    setPage([((next % n) + n) % n, d])
  }, [n])

  const prev = () => go(active - 1, -1)
  const next = () => go(active + 1,  1)

  useEffect(() => {
    if (paused || n <= 1) return
    const id = setInterval(() => go(active + 1, 1), 5000)
    return () => clearInterval(id)
  }, [active, paused, n, go])

  const event = events[active]

  const dateLabel = new Date(event.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  return (
    <section
      className="relative overflow-hidden bg-surface"
      aria-label="Upcoming events"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* top gradient bar */}
      <div
        className="absolute inset-x-0 top-0 h-0.75"
        style={{ background: 'linear-gradient(to right, #1AAEE8, #00C5B0, #00D97E)' }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex items-stretch gap-6 lg:gap-10">

          {/* ── Timeline rail (hidden on mobile) ── */}
          {n > 1 && (
            <div className="hidden sm:flex flex-col items-center gap-0 py-1 shrink-0">
              {/* top connector */}
              <div className="w-px flex-1 bg-border" />

              {/* dots */}
              <div className="flex flex-col gap-3">
                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i, i > active ? 1 : -1)}
                    aria-label={`Event ${i + 1}`}
                    className="relative flex items-center justify-center"
                  >
                    <span
                      className={`block rounded-full transition-all duration-300 ${
                        i === active
                          ? 'h-3 w-3 gradient-brand shadow-sm'
                          : 'h-2 w-2 bg-border hover:bg-text-muted'
                      }`}
                    />
                    {/* connecting line between dots */}
                    {i < n - 1 && (
                      <span className="absolute top-full left-1/2 -translate-x-1/2 w-px bg-border"
                        style={{ height: 12 }} />
                    )}
                  </button>
                ))}
              </div>

              {/* bottom connector */}
              <div className="w-px flex-1 bg-border" />
            </div>
          )}

          {/* ── Sliding content — fixed height so section never resizes ── */}
          <div className="relative flex-1 h-44">
            <AnimatePresence custom={dir} mode="wait">
              <motion.div
                key={active}
                custom={dir}
                variants={VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={TRANSITION}
                className="w-full"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                  {/* text block */}
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="gradient-brand-text text-xs font-bold uppercase tracking-widest">
                        Upcoming Event
                      </span>
                      {n > 1 && (
                        <span className="text-xs text-text-muted font-medium tabular-nums">
                          {active + 1} / {n}
                        </span>
                      )}
                    </div>

                    <h2 className="font-heading text-2xl font-extrabold text-text-primary lg:text-3xl leading-snug">
                      {event.title}
                    </h2>

                    <p className="mt-2 text-sm text-text-muted leading-relaxed">
                      {event.tagline}{' '}
                      <span className="font-semibold text-text-primary">Live on {dateLabel}.</span>
                    </p>

                    {event.description && (
                      <p className="mt-1.5 text-xs text-text-muted line-clamp-4">{event.description}</p>
                    )}
                  </div>

                  {/* CTA */}
                  <a
                    href={event.registration_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="self-start lg:self-center shrink-0 h-12 rounded-lg px-8 font-heading text-sm font-bold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] inline-flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(to right, #1AAEE8, #00C5B0, #00D97E, #00C5B0, #1AAEE8)',
                      backgroundSize: '200% 100%',
                    }}
                  >
                    Register Now
                  </a>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Up / Down nav (only when multiple events) ── */}
          {n > 1 && (
            <div className="flex flex-col items-center justify-center gap-2 shrink-0">
              <button
                onClick={prev}
                aria-label="Previous event"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200"
              >
                <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
              </button>
              <button
                onClick={next}
                aria-label="Next event"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200"
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
