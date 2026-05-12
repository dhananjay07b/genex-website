import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import {
  INNOVATIONS,
  INNOVATION_CATEGORIES,
  CATEGORY_LABEL,
  INNOVATION_STAGE_LABEL,
  type InnovationFilterKey,
  type InnovationProduct,
} from '@/config/innovationsProducts'

const STAGE_PILL: Record<string, string> = {
  research:  'bg-slate-100 text-slate-600',
  prototype: 'bg-amber-100 text-amber-700',
  deployed:  'bg-sky-100 text-sky-700',
  scaled:    'bg-emerald-100 text-emerald-700',
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' as const },
  }),
}

function InnovationCard({ product, index }: { product: InnovationProduct; index: number }) {
  return (
    <Link
      to={`/innovations/${product.slug}`}
      className="block group rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-white"
    >
      <motion.div custom={index} variants={cardVariants} className="h-full flex flex-col">
        {/* Gradient header */}
        <div className={`relative h-40 bg-linear-to-br ${product.gradient} bg-surface`}>
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 bg-white/80 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            {product.badge}
          </span>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/70 text-text-muted backdrop-blur-sm">
              {CATEGORY_LABEL[product.category]}
            </span>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm ${STAGE_PILL[product.stage]}`}
            >
              {INNOVATION_STAGE_LABEL[product.stage]}
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
            Explore →
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

export default function Innovations() {
  const [activeFilter, setActiveFilter] = useState<InnovationFilterKey>('all')

  const filtered =
    activeFilter === 'all'
      ? INNOVATIONS
      : INNOVATIONS.filter(p => p.category === activeFilter)

  return (
    <main>
      <PageHero
        label="Product Innovations"
        headline="Built in India. Engineered for Scale."
        subline="11 products at the frontier of energy intelligence — from AI-driven diagnostics to smart grid management and autonomous drone inspection."
      />

      {/* Filter bar */}
      <section className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
            {INNOVATION_CATEGORIES.map(({ key, label }) => (
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
                <InnovationCard key={product.slug} product={product} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stage legend */}
      <section className="bg-surface py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
            Innovation Stages
          </p>
          <div className="flex flex-wrap gap-4">
            {(['research', 'prototype', 'deployed', 'scaled'] as const).map(stage => (
              <div key={stage} className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${STAGE_PILL[stage]}`}
                >
                  {INNOVATION_STAGE_LABEL[stage]}
                </span>
                <span className="text-xs text-text-muted">
                  {stage === 'research' && '— Active R&D, not yet fielded'}
                  {stage === 'prototype' && '— Pilot deployments underway'}
                  {stage === 'deployed' && '— Commercially available'}
                  {stage === 'scaled' && '— Live at 100+ sites nationwide'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-link to Portfolio */}
      <section className="bg-white py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Already Deployed?
            </p>
            <h2 className="text-xl lg:text-2xl font-extrabold text-text-primary">
              See what Genex has already delivered across India.
            </h2>
            <p className="mt-2 text-sm text-text-muted max-w-lg">
              Our Portfolio section covers 13 platforms and tools currently live at customer sites — from SolarLive™ to SCADA systems and data loggers.
            </p>
          </div>
          <Link to="/portfolio" className="shrink-0">
            <Button variant="secondary" size="lg">View Portfolio →</Button>
          </Link>
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
              Partner with Genex
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              Interested in early access or a pilot?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              We work with energy companies, utilities, and developers to pilot innovations before general availability. Reach out to explore what's possible.
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
