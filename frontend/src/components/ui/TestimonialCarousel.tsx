import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { TestimonialApiValue } from '@/types/api'

// x values are % of the card's own width, applied from left:50% anchor
// Active   → x='-50%'   : shifts left by half card width → perfectly centered
// Right    → x='60%'    : left edge at 50%+60% of card width (peeks from right)
// Left     → x='-160%'  : right edge at 50%-60% of card width (peeks from left)
function getCardState(i: number, active: number, n: number) {
  const raw    = ((i - active) % n + n) % n
  const offset = raw > n / 2 ? raw - n : raw

  if (offset === 0)  return { x: '-50%', scale: 1,    opacity: 1,   zIndex: 10, pointerEvents: 'auto' as const }
  if (offset === 1)  return { x: '10%', scale: 0.78, opacity: 0.6, zIndex: 5,  pointerEvents: 'none' as const }
  if (offset === -1) return { x: '-110%', scale: 0.78, opacity: 0.6, zIndex: 5,  pointerEvents: 'none' as const }
  return               { x: offset > 0 ? '100%' : '-200%', scale: 0.78, opacity: 0, zIndex: 1, pointerEvents: 'none' as const }
}

const SPRING = { type: 'spring' as const, stiffness: 260, damping: 30 }

interface TestimonialCarouselProps {
  testimonials: TestimonialApiValue[]
  /** Smaller cards/text/avatars — for use inside a page section rather than the homepage hero moment. */
  compact?: boolean
}

/**
 * The 3-card "peek" carousel — active card centered, neighbors peeking at the
 * sides, autoplay + prev/next + dots. Originally built for the homepage
 * (`components/home/Testimonials.tsx`); shared here so other testimonial
 * sections (e.g. product pages) get the same functionality at a smaller size.
 */
export function TestimonialCarousel({ testimonials, compact = false }: TestimonialCarouselProps) {
  const n = testimonials.length
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next: number) => setActive(next), [])
  const prev = () => goTo((active - 1 + n) % n)
  const next = () => goTo((active + 1) % n)

  useEffect(() => {
    if (paused || n <= 1) return
    const id = setInterval(() => setActive(a => (a + 1) % n), 4500)
    return () => clearInterval(id)
  }, [paused, n])

  const cardHeight = compact ? 260 : 340
  const cardMaxWidth = compact ? 'max-w-lg' : 'max-w-2xl'
  const cardPadding = compact ? 'p-6 lg:p-7' : 'p-8 lg:p-10'
  const quoteMarkSize = compact ? 'text-4xl' : 'text-6xl'
  const quoteTextSize = compact ? 'text-sm' : 'text-lg'
  const avatarSize = compact ? 'h-9 w-9' : 'h-11 w-11'
  const navBtnSize = compact ? 'h-8 w-8' : 'h-9 w-9'
  const navIconSize = compact ? 16 : 20

  return (
    <div
      className="flex flex-col items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track — full section width, no overflow-hidden (parent section clips it) */}
      <div className="relative w-full" style={{ height: cardHeight }}>
        {testimonials.map((t, i) => {
          const state = getCardState(i, active, n)
          return (
            <motion.div
              key={i}
              animate={{ x: state.x, scale: state.scale, opacity: state.opacity }}
              transition={SPRING}
              style={{ left: '50%', zIndex: state.zIndex, pointerEvents: state.pointerEvents }}
              className={`absolute top-0 h-full w-full ${cardMaxWidth} bg-white rounded-2xl border border-border shadow-sm ${cardPadding}`}
            >
              <span
                className={`block ${quoteMarkSize} font-black leading-none mb-4 gradient-brand-text select-none`}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <p className={`${quoteTextSize} font-medium text-text-primary leading-relaxed mb-8`}>
                {t.quote}
              </p>

              <div className="border-t border-border pt-6 flex items-center gap-4">
                <div className={`flex ${avatarSize} shrink-0 items-center justify-center rounded-full gradient-brand`}>
                  <span className="text-xs font-bold text-white">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{[t.role, t.company].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Navigation */}
      {n > 1 && (
        <div className="mt-8 flex items-center gap-6">
          <button
            onClick={prev}
            aria-label="Previous testimonial"
            className={`flex ${navBtnSize} items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200`}
          >
            <ChevronLeftIcon sx={{ fontSize: navIconSize }} />
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, i) => (
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
            className={`flex ${navBtnSize} items-center justify-center rounded-full border border-border text-text-muted hover:border-primary hover:text-primary transition-colors duration-200`}
          >
            <ChevronRightIcon sx={{ fontSize: navIconSize }} />
          </button>
        </div>
      )}
    </div>
  )
}
