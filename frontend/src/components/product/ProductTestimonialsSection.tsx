import { motion } from 'framer-motion'
import type { TestimonialApiValue } from '@/types/api'

interface ProductTestimonialsSectionProps {
  heading: string
  items: TestimonialApiValue[]
}

export function ProductTestimonialsSection({ heading, items }: ProductTestimonialsSectionProps) {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-bold text-[#162456] leading-tight mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading}
        </motion.h2>

        <div className={`grid gap-6 ${items.length >= 3 ? 'lg:grid-cols-3' : items.length === 2 ? 'lg:grid-cols-2' : 'max-w-xl'}`}>
          {items.map((t, i) => (
            <motion.div
              key={i}
              className="bg-white border border-[#e2e8f0] rounded-3xl p-8 flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' as const }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const }}
            >
              <p className="text-base text-[#0f2930] leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#eaf0f6] mt-auto">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-xs font-bold">{t.initials}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#162456]">{t.name}</p>
                  <p className="text-xs text-[#62748e]">
                    {[t.role, t.company].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
