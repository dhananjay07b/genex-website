import { motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { CapabilityItemValue } from '@/types/api'

interface CapabilitiesSectionProps {
  heading: string
  items: CapabilityItemValue[]
}

export function CapabilitiesSection({ heading, items }: CapabilitiesSectionProps) {
  return (
    <section className="bg-white border-t border-b border-[#e0e6ed] py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-2xl font-bold text-[#162456] mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
          {items.map((item, i) => {
            const Icon = getMuiIcon(item.icon)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: 'easeOut' as const }}
                className="group flex items-center gap-4 py-6 border-b border-[#e2e8f0]"
              >
                <div className="bg-[#f0f4f8] group-hover:bg-primary/10 size-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200">
                  <Icon style={{ fontSize: 22 }} className="text-[#62748e] group-hover:text-primary transition-colors duration-200" />
                </div>
                <p className="text-base font-semibold text-[#162456] leading-snug">{item.text}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
