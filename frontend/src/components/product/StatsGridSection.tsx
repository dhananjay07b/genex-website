import { motion } from 'framer-motion'
import type { ProductStat } from '@/types/api'

interface StatsGridSectionProps {
  heading?: string | null
  stats: ProductStat[]
}

export function StatsGridSection({ heading, stats }: StatsGridSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {heading && (
          <h2 className="text-xl font-bold text-[#162456] text-center mb-10">{heading}</h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(({ value, suffix, label }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: 'easeOut' as const }}
              className="flex flex-col items-center text-center gap-2 rounded-2xl bg-surface px-6 py-10"
            >
              <span className="gradient-brand-text text-5xl lg:text-6xl font-extrabold leading-none tracking-tight">
                {value}{suffix ?? ''}
              </span>
              <span className="text-sm font-semibold text-[#6b7280]">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
