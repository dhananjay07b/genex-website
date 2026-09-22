import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PortfolioCard } from './PortfolioCard'
import type { PortfolioSectionValue } from '@/types/api'

export function PortfolioSection({ value }: { value: PortfolioSectionValue }) {
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const items = value.items ?? []
  const availableTags = Array.from(new Set(items.map(i => i.tag).filter((t): t is string => Boolean(t))))
  const filtered = activeFilter === 'all' ? items : items.filter(i => i.tag === activeFilter)

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

      {availableTags.length > 0 && (
        <section className="bg-white border-b border-border sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
              <button
                onClick={() => setActiveFilter('all')}
                className={[
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                  activeFilter === 'all'
                    ? 'gradient-brand text-white shadow-sm'
                    : 'text-text-muted border border-border hover:text-primary hover:bg-surface hover:border-primary',
                ].join(' ')}
              >
                All Products
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={[
                    'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                    activeFilter === tag
                      ? 'gradient-brand text-white shadow-sm'
                      : 'text-text-muted border border-border hover:text-primary hover:bg-surface hover:border-primary',
                  ].join(' ')}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-col gap-9"
            >
              {filtered.map((item, i) => (
                <PortfolioCard key={item.id} item={item} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
