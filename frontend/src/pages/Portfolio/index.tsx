import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import {
  PORTFOLIO_PRODUCTS,
  FAMILIES,
  type FilterKey,
  type PortfolioProduct,
} from '@/config/portfolioProjects'

// ── Animation presets ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
})

// ── Category tag per product ──────────────────────────────────────────────────

const PRODUCT_TAG: Record<string, string> = {
  'solarlive':         'Monitoring',
  'energy-storage':    'Monitoring',
  'wind-network':      'Monitoring',
  'bms':               'Monitoring',
  'rms':               'Monitoring',
  'scada':             'AI & Analytics',
  'ev-infrastructure': 'Monitoring',
  'power-billing':     'Monitoring',
  'zero-export':       'AI & Analytics',
  'carbon-credit':     'Monitoring',
  'iot-gateway':       'Monitoring',
  'power-cloud':       'Monitoring',
  'rtc-power-tools':   'Monitoring',
}

// ── Stats strip ───────────────────────────────────────────────────────────────

const STATS = [
  { value: '120+',   label: 'Projects Delivered' },
  { value: '500 MW', label: 'Capacity Monitored'  },
  { value: '8',      label: 'States Covered'      },
  { value: '15+',    label: 'Years of Operation'  },
]

// ── Card ──────────────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: PortfolioProduct; index: number }) {
  const tag = PRODUCT_TAG[product.slug] ?? 'Monitoring'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' as const }}
      className="group flex flex-col lg:flex-row h-auto lg:h-[400px] overflow-hidden border border-border hover:border-primary hover:shadow-[0_8px_32px_rgba(26,174,232,0.12)] transition-all duration-300"
    >
      {/* Image — left, fills available space */}
      <div className="relative w-full lg:flex-1 h-56 lg:h-auto overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.label}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
          loading={index < 3 ? 'eager' : 'lazy'}
        />
        {product.badge && (
          <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/50 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 z-10">
            {product.badge}
          </span>
        )}
      </div>

      {/* Info panel — right, fixed width */}
      <div className="bg-[#f1f5f8] w-full lg:w-[335px] shrink-0 flex flex-col p-10">
        {/* Name */}
        <p className="text-[24px] font-bold text-[#1d293d] leading-tight mb-2">
          {product.label}
        </p>

        {/* Category tag */}
        <p className="text-[14px] uppercase font-normal text-[#62748e] tracking-wide mb-6">
          {tag}
        </p>

        {/* Description — first capability as excerpt */}
        <p className="text-[16px] text-[#45556c] leading-[30px] flex-1">
          {product.capabilities[0]}
        </p>

        {/* See More link */}
        <Link
          to={`/portfolio/${product.slug}`}
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#1d293d] hover:text-primary transition-colors duration-200 self-start"
        >
          See More
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered =
    activeFilter === 'all'
      ? PORTFOLIO_PRODUCTS
      : PORTFOLIO_PRODUCTS.filter(p => p.family === activeFilter)

  return (
    <main>
      <PageMeta
        title="Software Products for Power & Energy"
        description="13 production-grade software products for solar, BESS, wind, SCADA, EV, and grid — engineered by Genex Technocrats for India's energy sector."
        canonical="/portfolio"
      />

      <PageHero
        label="Our Products"
        headline="See Our Work"
        subline="13 platforms and tools built by Genex engineers and deployed across India's energy infrastructure."
      />

      {/* ── INTRO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-4">
        <motion.div {...fadeUp(0)} className="max-w-[556px] mx-auto px-6 text-center">
          <h2 className="text-[36px] font-bold text-[#162456] leading-tight capitalize mb-4">
            See our work
          </h2>
          <p className="text-[18px] text-[#45556c] leading-[29px]">
            From real-time solar monitoring to SCADA platforms and EV infrastructure — every product is built for the demands of India&apos;s power sector.
          </p>
        </motion.div>
      </section>

      {/* ── FILTER BAR ─────────────────────────────────────────────────────── */}
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

      {/* ── PRODUCT LIST ───────────────────────────────────────────────────── */}
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
              {filtered.map((product, i) => (
                <ProductCard key={product.slug} product={product} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 lg:py-20" aria-label="Project statistics">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-8 lg:py-0 px-4 lg:px-10">
                <AnimatedStat value={value} label={label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28 relative overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Start a Project
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Interested in early access or a pilot?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Talk to our engineering team. We scope, plan, and deliver — from a single site to a national rollout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">
                  Request a Demo <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Button>
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
