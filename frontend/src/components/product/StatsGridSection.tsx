import { motion } from 'framer-motion'
import type { ProductStat } from '@/types/api'

interface StatsGridSectionProps {
  heading?: string | null
  bg?: string | null
  stats: ProductStat[]
}

function splitStat(value: string): { num: string; unit: string } {
  const m = value.match(/^([<>]?[\d,]+(?:\.\d+)?)([+%\s]*)(.*)$/)
  if (m) return { num: m[1], unit: (m[2] + m[3]).trim() }
  return { num: value, unit: '' }
}

export function StatsGridSection({ heading, bg, stats }: StatsGridSectionProps) {
  return (
    <section className={`${bg || 'bg-white'} border-t border-b border-[#e5e7eb] py-8`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {heading && (
          <h2 className="text-xl font-bold text-[#162456] text-center mb-6">{heading}</h2>
        )}
        <div className={`grid grid-cols-${stats.length} divide-x divide-[#e5e7eb]`}>
          {stats.map(({ value, suffix, label }, i) => {
            const display = `${value}${suffix ?? ''}`
            const { num, unit } = splitStat(display)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center gap-1.5 py-4 px-4 lg:px-10"
              >
                <div className="flex items-baseline gap-1.5 justify-center">
                  <span className="text-4xl font-bold text-[#1d4ed8] leading-tight">{num}</span>
                  {unit && <span className="text-xl font-medium text-[#111827]">{unit}</span>}
                </div>
                <span className="text-sm text-[#6b7280] text-center">{label}</span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
