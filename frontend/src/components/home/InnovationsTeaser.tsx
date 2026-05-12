import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

interface Product {
  name: string
  tagline: string
  href: string
  badge?: string
  index: number
}

const PRODUCTS: Product[] = [
  {
    name: 'Advanced SCADA',
    tagline: 'End-to-end supervisory control and data acquisition for commercial & industrial assets',
    href: '/innovations/solar-rooftop',
    badge: 'Flagship',
    index: 1,
  },
  {
    name: 'Re-NMS',
    tagline: 'Utility-scale ground-mount solar EPC and network monitoring system',
    href: '/innovations/solar-power-plants',
    index: 2,
  },
  {
    name: 'AI-based Remote Monitoring',
    tagline: 'Real-time remote monitoring for distributed energy assets powered by AI',
    href: '/innovations/rms',
    index: 3,
  },
  {
    name: 'EMS - BESS',
    tagline: 'Energy management systems for battery energy storage projects',
    href: '/innovations/energy-storage',
    index: 4,
  },
  {
    name: 'AI-Plant Health Checkup',
    tagline: 'AI-driven predictive maintenance and performance optimisation for energy assets',
    href: '/innovations/ai-health-checkup',
    index: 5,
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] as const } },
}

function ProductCard({ product }: { product: Product }) {
  const num = String(product.index).padStart(2, '0')
  return (
    <motion.div variants={cardVariants} className="group relative">
      <Link
        to={product.href}
        className="flex flex-col h-full min-h-55 p-6 rounded-xl border border-border bg-white hover:border-primary hover:bg-surface transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`${product.name} — ${product.tagline}`}
      >
        {/* Index number — decorative */}
        <span
          className="absolute top-4 right-5 text-5xl font-extrabold text-text-primary/5 leading-none select-none pointer-events-none group-hover:text-primary/10 transition-colors duration-300"
          aria-hidden="true"
        >
          {num}
        </span>

        {/* Badge */}
        {product.badge && (
          <span className="self-start mb-4 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/40 rounded-full px-2.5 py-0.5">
            {product.badge}
          </span>
        )}

        <div className={product.badge ? '' : 'mt-6'}>
          <h3 className="text-lg font-extrabold text-text-primary leading-snug group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-text-muted leading-relaxed">
            {product.tagline}
          </p>
        </div>

        {/* Arrow — appears on hover */}
        <span
          className="mt-auto pt-6 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-200"
          aria-hidden="true"
        >
          Explore →
        </span>
      </Link>
    </motion.div>
  )
}

export function InnovationsTeaser() {
  return (
    <section className="bg-surface py-20 lg:py-28 overflow-hidden" aria-labelledby="innovations-teaser-heading">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Our Products
            </p>
            <h2
              id="innovations-teaser-heading"
              className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight"
            >
              Built On Our<br />Own Technology.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Link
              to="/innovations"
              className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline hidden sm:block"
            >
              Explore All Products →
            </Link>
          </motion.div>
        </div>

        {/* Product grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {PRODUCTS.map(product => (
            <ProductCard key={product.href} product={product} />
          ))}
        </motion.div>

        {/* Mobile CTA */}
        <div className="mt-8 sm:hidden text-center">
          <Link
            to="/innovations"
            className="text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline"
          >
            Explore All Products →
          </Link>
        </div>
      </div>
    </section>
  )
}
