import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ChevronLeftIcon  from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const TESTIMONIALS = [
  {
    quote:
      'The SCADA system Genex deployed for our 50 MW plant reduced fault response time from 4 hours to under 15 minutes. The ROI was visible within the first quarter.',
    name: 'Arjun Sharma',
    role: 'Head of Operations',
    company: 'Greenko Group',
    initials: 'AS',
  },
  {
    quote:
      "What sets Genex apart is their deep domain expertise. They didn't just install a monitoring system — they understood our grid constraints and designed around them.",
    name: 'Priya Nair',
    role: 'Plant Manager',
    company: 'SECI',
    initials: 'PN',
  },
  {
    quote:
      "We've worked with several automation vendors. Genex's Re-NMS is the first system our operators actually trust. The UI is fast, reliable, and built for real field conditions.",
    name: 'Suresh Patel',
    role: 'CTO',
    company: 'Torrent Power',
    initials: 'SP',
  },
  {
    quote:
      'Their AI Plant Health Checkup predicted an inverter failure 3 weeks before it happened. That single alert saved us ₹40 lakh in unplanned downtime.',
    name: 'Meera Krishnan',
    role: 'VP Engineering',
    company: 'Adani Green Energy',
    initials: 'MK',
  },
]

const n = TESTIMONIALS.length

// x values are % of the card's own width, applied from left:50% anchor
// Active   → x='-50%'   : shifts left by half card width → perfectly centered
// Right    → x='60%'    : left edge at 50%+60% of card width (peeks from right)
// Left     → x='-160%'  : right edge at 50%-60% of card width (peeks from left)
function getCardState(i: number, active: number) {
  const raw    = ((i - active) % n + n) % n
  const offset = raw > n / 2 ? raw - n : raw

  if (offset === 0)  return { x: '-50%', scale: 1,    opacity: 1,   zIndex: 10, pointerEvents: 'auto' as const }
  if (offset === 1)  return { x: '10%', scale: 0.78, opacity: 0.6, zIndex: 5,  pointerEvents: 'none' as const }
  if (offset === -1) return { x: '-110%', scale: 0.78, opacity: 0.6, zIndex: 5,  pointerEvents: 'none' as const }
  return               { x: offset > 0 ? '100%' : '-200%', scale: 0.78, opacity: 0, zIndex: 1, pointerEvents: 'none' as const }
}

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 }

export function Testimonials() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next: number) => setActive(next), [])
  const prev = () => goTo((active - 1 + n) % n)
  const next = () => goTo((active + 1) % n)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive(a => (a + 1) % n), 4500)
    return () => clearInterval(id)
  }, [paused])

  return (
    <section
      className="bg-white py-20 lg:py-28 overflow-hidden"
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
            Client Voices
          </p>
          <h2
            id="testimonials-heading"
            className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight"
          >
            Trusted by Engineers,<br className="hidden sm:block" /> Operators &amp; Planners.
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="flex flex-col items-center">

          {/* Track — full section width, no overflow-hidden (section clips it) */}
          <div className="relative w-full" style={{ height: 340 }}>

            {TESTIMONIALS.map((t, i) => {
              const state = getCardState(i, active)
              return (
                <motion.div
                  key={i}
                  animate={{ x: state.x, scale: state.scale, opacity: state.opacity }}
                  transition={SPRING}
                  style={{ left: '50%', zIndex: state.zIndex, pointerEvents: state.pointerEvents }}
                  className="absolute top-0 h-full w-full max-w-2xl bg-white rounded-2xl border border-border shadow-sm p-8 lg:p-10"
                >
                  <span
                    className="block text-6xl font-black leading-none mb-4 gradient-brand-text select-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>

                  <p className="text-lg font-medium text-text-primary leading-relaxed mb-8">
                    {t.quote}
                  </p>

                  <div className="border-t border-border pt-6 flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gradient-brand">
                      <span className="text-xs font-bold text-white">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{t.name}</p>
                      <p className="text-xs text-text-muted">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-6">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200"
            >
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </button>

            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Testimonial ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-6 gradient-brand'
                      : 'w-2 bg-border hover:bg-text-muted'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200"
            >
              <ChevronRightIcon sx={{ fontSize: 20 }} />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
