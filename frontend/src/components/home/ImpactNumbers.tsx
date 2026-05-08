import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'

interface Stat {
  value: number
  suffix: string
  label: string
}

const STATS: Stat[] = [
  { value: 500, suffix: ' MW', label: 'Monitored' },
  { value: 120, suffix: '+',   label: 'Projects Delivered' },
  { value: 8,   suffix: '',    label: 'States' },
  { value: 15,  suffix: '+',   label: 'Years in Operation' },
]

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function CountUp({ value, suffix, duration = 1800 }: { value: number; suffix: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.round(easeOutCubic(progress) * value))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [isInView, value, duration])

  return (
    <span ref={ref} className="gradient-brand-text text-6xl lg:text-7xl font-extrabold tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

export function ImpactNumbers() {
  return (
    <section className="bg-brand-tint py-20 lg:py-24" aria-label="Key metrics">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-10 lg:py-0 px-4 lg:px-10 text-center"
            >
              <CountUp value={stat.value} suffix={stat.suffix} />
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
