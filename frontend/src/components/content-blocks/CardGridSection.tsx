import { motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { CardGridSectionValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function CardGridSection({ value }: { value: CardGridSectionValue }) {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {(value.heading || value.description) && (
          <div className="max-w-2xl mx-auto text-center mb-12">
            {value.heading && (
              <h2 className="text-3xl lg:text-4xl font-bold text-[#162456] leading-tight mb-4">{value.heading}</h2>
            )}
            {value.description && (
              <p className="text-base text-text-muted leading-relaxed">{value.description}</p>
            )}
          </div>
        )}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' as const }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {value.cards.map((card, i) => {
            const Icon = getMuiIcon(card.icon)
            return (
              <motion.div
                key={i}
                variants={staggerChild}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(26,174,232,0.10)' }}
                transition={{ duration: 0.2 }}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 transition-all duration-200"
              >
                <div className="size-11 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center mb-4">
                  <Icon style={{ fontSize: 22 }} className="text-primary" />
                </div>
                <h3 className="text-base font-bold text-[#162456] mb-2">{card.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{card.description}</p>
                {card.note && <p className="text-xs text-text-muted/70 mt-3">{card.note}</p>}
                {card.link && (
                  <a href={card.link} className="inline-block mt-4 text-xs font-bold text-primary hover:underline">
                    Learn more →
                  </a>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
