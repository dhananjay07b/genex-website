import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import {
  PORTFOLIO_PRODUCTS,
  FAMILIES,
  FAMILY_LABEL,
  type FilterKey,
  type PortfolioProduct,
} from '@/config/portfolioProjects'

const STATS = [
  { value: '120+',   label: 'Projects Delivered'  },
  { value: '500 MW', label: 'Capacity Monitored'  },
  { value: '8',      label: 'States Covered'       },
  { value: '15+',    label: 'Years of Operation'   },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' as const },
  }),
}

function ProductCard({ product, index }: { product: PortfolioProduct; index: number }) {
  return (
    <Link
      to={`/portfolio/${product.slug}`}
      className="block group rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      <motion.div custom={index} variants={cardVariants} className="h-full flex flex-col">
        {/* Gradient header */}
        <div className={`relative h-44 bg-linear-to-br ${product.gradient} bg-surface`}>
          {product.badge && (
            <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-0.5">
              {product.badge}
            </span>
          )}
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/70 text-text-muted backdrop-blur-sm">
              {FAMILY_LABEL[product.family]}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-base font-extrabold text-text-primary leading-snug mb-3 group-hover:text-primary transition-colors duration-200">
            {product.label}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed flex-1">
            {product.capabilities[0]}
          </p>
          <span className="mt-5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200">
            View Product →
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered =
    activeFilter === 'all'
      ? PORTFOLIO_PRODUCTS
      : PORTFOLIO_PRODUCTS.filter(p => p.family === activeFilter)

  return (
    <main>
      <PageHero
        label="Our Products"
        headline="Software That Runs the Grid"
        subline="13 platforms and tools — built by Genex engineers, deployed across India's energy infrastructure."
      />

      {/* Filter bar */}
      <section className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
            {FAMILIES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={[
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                  activeFilter === key
                    ? 'gradient-brand text-white shadow-sm'
                    : 'text-text-muted border border-border hover:text-primary hover:bg-surface hover:border-primary',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {filtered.map((product, i) => (
                <ProductCard key={product.slug} product={product} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-primary py-16 lg:py-20" aria-label="Project statistics">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-8 lg:py-0 px-4 lg:px-10 text-center"
              >
                <span className="text-5xl lg:text-6xl font-extrabold text-white tabular-nums">
                  {value}
                </span>
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Start a Project
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              Have a project in mind?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Talk to our engineering team. We scope, plan, and deliver — from a single site to a national rollout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request a Demo</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
