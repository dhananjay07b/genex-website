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
  research:  'bg-slate-100 text-slate-600 border-slate-200',
  prototype: 'bg-amber-50 text-amber-700 border-amber-200',
  deployed:  'bg-sky-50 text-sky-700 border-sky-200',
  scaled:    'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const STAGE_BAR: Record<string, string> = {
  research:  'bg-slate-400',
  prototype: 'bg-amber-400',
  deployed:  'bg-primary',
  scaled:    'bg-secondary',
}

const STAGES_ORDERED = ['research', 'prototype', 'deployed', 'scaled'] as const
const STAGE_PROGRESS: Record<string, number> = { research: 25, prototype: 50, deployed: 75, scaled: 100 }

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: 'easeOut' as const },
  }),
}

function HexOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden="true">
      <defs>
        <pattern id="card-hex" x="0" y="0" width="28" height="24" patternUnits="userSpaceOnUse">
          <polygon points="14,1 25,7 25,19 14,25 3,19 3,7" stroke="white" strokeWidth="0.7" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#card-hex)" />
    </svg>
  )
}

function InnovationCard({ product, index }: { product: InnovationProduct; index: number }) {
  return (
    <Link
      to={`/innovations/${product.slug}`}
      className="block group rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:-translate-y-1 hover:border-primary transition-all duration-300 bg-white"
    >
      <motion.div custom={index} variants={cardVariants} className="h-full flex flex-col">
        {/* Gradient header + hex overlay */}
        <div className={`relative h-40 bg-linear-to-br ${product.gradient}`}>
          <HexOverlay />
          <span className="absolute top-4 left-4 z-10 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5">
            {product.badge}
          </span>
          <div className="absolute bottom-4 left-4 z-10">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/80 text-text-muted backdrop-blur-sm">
              {CATEGORY_LABEL[product.category]}
            </span>
          </div>
        </div>

        {/* Stage progress bar */}
        <div className="h-1 bg-border">
          <div
            className={`h-full ${STAGE_BAR[product.stage]} transition-all duration-500`}
            style={{ width: `${STAGE_PROGRESS[product.stage]}%` }}
          />
        </div>

        {/* Card body */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-extrabold text-text-primary leading-snug group-hover:text-primary transition-colors duration-200">
              {product.label}
            </h3>
            <span className={`shrink-0 ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${STAGE_PILL[product.stage]}`}>
              {INNOVATION_STAGE_LABEL[product.stage]}
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed flex-1">
            {product.capabilities[0]}
          </p>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 translate-x-0 transition-all duration-200">
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
      <section className="bg-surface py-12 lg:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-8">Innovation Stages — How We Classify Our R&D</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES_ORDERED.map((stage, i) => (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="bg-white border border-border rounded-2xl overflow-hidden"
              >
                <div className={`h-1.5 w-full ${STAGE_BAR[stage]}`} style={{ width: `${STAGE_PROGRESS[stage]}%` }} />
                <div className="px-5 py-4">
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-2 ${STAGE_PILL[stage]}`}>
                    {INNOVATION_STAGE_LABEL[stage]}
                  </span>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {stage === 'research'  && 'Active R&D — not yet fielded at customer sites'}
                    {stage === 'prototype' && 'Pilot deployments underway with select partners'}
                    {stage === 'deployed'  && 'Commercially available — contact us to deploy'}
                    {stage === 'scaled'    && 'Live at 100+ sites across India'}
                  </p>
                </div>
              </motion.div>
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
