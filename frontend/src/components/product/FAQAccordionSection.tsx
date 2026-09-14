import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AddIcon from '@mui/icons-material/Add'
import type { FAQItemValue } from '@/types/api'

interface FAQAccordionSectionProps {
  heading: string
  items: FAQItemValue[]
}

export function FAQAccordionSection({ heading, items }: FAQAccordionSectionProps) {
  const [open, setOpen] = useState<number | null>(0)

  // Group under each item's `section` label only when at least one item actually has one —
  // otherwise render as a single flat list.
  const hasSections = items.some(i => i.section)
  const groups = hasSections
    ? items.reduce<{ section: string; items: (FAQItemValue & { index: number })[] }[]>((acc, item, index) => {
        const label = item.section || 'General'
        const group = acc.find(g => g.section === label)
        const entry = { ...item, index }
        if (group) group.items.push(entry)
        else acc.push({ section: label, items: [entry] })
        return acc
      }, [])
    : [{ section: '', items: items.map((item, index) => ({ ...item, index })) }]

  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-4xl font-bold text-[#162456] leading-tight mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading}
        </motion.h2>

        <div className="flex flex-col gap-10">
          {groups.map(group => (
            <div key={group.section}>
              {group.section && (
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#9aa5b1] mb-4">
                  {group.section}
                </h3>
              )}
              <div className="flex flex-col divide-y divide-[#e2e8f0] border-t border-b border-[#e2e8f0]">
                {group.items.map(item => {
                  const isOpen = open === item.index
                  return (
                    <div key={item.index}>
                      <button
                        onClick={() => setOpen(isOpen ? null : item.index)}
                        className="w-full flex items-center justify-between gap-4 py-5 text-left"
                        aria-expanded={isOpen}
                      >
                        <span className="text-base font-semibold text-[#0f2930]">{item.q}</span>
                        <AddIcon
                          style={{ fontSize: 20 }}
                          className={`shrink-0 text-[#62748e] transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' as const }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-[#45556c] leading-relaxed pb-5">{item.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
