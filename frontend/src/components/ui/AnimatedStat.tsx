import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface AnimatedStatProps {
  value: string
  label: string
  accent?: string
}

function parseNumeric(value: string): { prefix: string; number: number; suffix: string } {
  const match = value.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return { prefix: '', number: 0, suffix: value }
  return { prefix: match[1], number: parseFloat(match[2]), suffix: match[3] }
}

export function AnimatedStat({ value, label, accent }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [display, setDisplay] = useState('0')
  const { prefix, number, suffix } = parseNumeric(value)

  useEffect(() => {
    if (!inView) return
    const duration = 1400
    const start = performance.now()
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * number)
      setDisplay(current.toString())
      if (progress < 1) requestAnimationFrame(frame)
      else setDisplay(number % 1 === 0 ? number.toString() : number.toFixed(1))
    }
    requestAnimationFrame(frame)
  }, [inView, number])

  return (
    <div ref={ref} className="text-center">
      <div className={`text-4xl lg:text-5xl font-extrabold mb-1 ${accent ?? 'text-white'}`}>
        {prefix}{display}{suffix}
      </div>
      <div className="text-sm uppercase tracking-widest text-white/60 font-medium">{label}</div>
    </div>
  )
}
