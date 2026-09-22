import { motion } from 'framer-motion'
import { InnovationCard } from './InnovationCard'
import type { InnovationsSectionValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

export function InnovationsSection({ value }: { value: InnovationsSectionValue }) {
  return (
    <>
      {(value.heading || value.description) && (
        <section className="bg-white pt-16 lg:pt-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            {value.heading && (
              <h2 className="text-3xl lg:text-4xl font-bold text-[#162456] leading-tight mb-4 capitalize">{value.heading}</h2>
            )}
            {value.description && (
              <p className="text-lg text-[#45556c] leading-relaxed">{value.description}</p>
            )}
          </div>
        </section>
      )}

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' as const }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-[#e2e8f0]"
          >
            {(value.items ?? []).map((item) => (
              <InnovationCard key={item.id} item={item} />
            ))}
          </motion.div>
        </div>
      </section>
    </>
  )
}
