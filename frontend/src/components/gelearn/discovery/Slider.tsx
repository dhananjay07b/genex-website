import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { cn } from '@/lib/utils'

interface SliderProps {
  /** Shown left of the arrows, e.g. a section heading. */
  heading?: ReactNode
  /** Accessible name for the scrolling region. */
  label: string
  children: ReactNode
  /** Width of each slide, as Tailwind basis classes. Default: 1 on phones, ~1.8 on tablets, ~3 (next one peeking) on desktop. */
  slideClassName?: string
  className?: string
}

/**
 * A horizontal row that scrolls one slide at a time with ‹ › buttons, and by
 * swipe or trackpad. The buttons dim at either end.
 */
export function Slider({ heading, label, children, slideClassName = 'basis-11/12 sm:basis-7/12 lg:basis-10/33', className }: SliderProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    setAtStart(rail.scrollLeft <= 2)
    setAtEnd(rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [sync, children])

  function step(direction: -1 | 1) {
    const rail = railRef.current
    const first = rail?.firstElementChild as HTMLElement | null
    if (!rail || !first) return
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: reduce ? 'auto' : 'smooth' })
  }

  const arrow = 'flex size-8 items-center justify-center rounded-full border border-border bg-white text-text-primary transition-colors hover:border-primary disabled:cursor-default disabled:opacity-35 disabled:hover:border-border'

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">{heading}</div>
        <div className="flex gap-2">
          <button type="button" className={arrow} onClick={() => step(-1)} disabled={atStart} aria-label={`Scroll ${label} left`}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </button>
          <button type="button" className={arrow} onClick={() => step(1)} disabled={atEnd} aria-label={`Scroll ${label} right`}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>
      <div
        ref={railRef}
        onScroll={sync}
        role="region"
        aria-label={label}
        className="scrollbar-hidden flex snap-x snap-mandatory gap-4 overflow-x-auto pb-0.5"
      >
        {Children.map(children, child => (
          <div className={cn('min-w-0 shrink-0 snap-start', slideClassName)}>{child}</div>
        ))}
      </div>
    </div>
  )
}
