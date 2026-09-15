import { motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { CapabilityItemValue } from '@/types/api'

interface CapabilitiesSectionProps {
  heading: string
  items: CapabilityItemValue[]
}

export function CapabilitiesSection({ heading, items }: CapabilitiesSectionProps) {
  return (
    <section className="bg-white border-t border-b border-[#e0e6ed] py-14">
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' as const }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10"
        >
          {items.map((item, i) => {
            const Icon = getMuiIcon(item.icon)
            return (
              <div key={i} className="flex flex-col gap-3">
                <div className="bg-[#f0f4f8] size-12 rounded-2xl flex items-center justify-center shrink-0">
                  <Icon style={{ fontSize: 24 }} className="text-[#62748e]" />
                </div>
                <p className="text-sm text-[#62748e] leading-snug">{item.text}</p>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
