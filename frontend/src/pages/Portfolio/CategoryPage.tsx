import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import {
  PORTFOLIO_PRODUCTS,
  PRODUCT_BY_SLUG,
  FAMILY_LABEL,
} from '@/config/portfolioProjects'

export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>()
  const product = slug ? PRODUCT_BY_SLUG[slug] : undefined

  if (!product) return <Navigate to="/portfolio" replace />

  const related = PORTFOLIO_PRODUCTS.filter(p => p.slug !== product.slug).slice(0, 5)

  return (
    <main>
      <PageHero
        label={product.badge ?? FAMILY_LABEL[product.family]}
        headline={product.label}
        subline={product.subline}
      />

      {/* Overview */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">
            {/* Left: prose */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            >
              <h2 className="text-2xl lg:text-3xl font-extrabold text-text-primary mb-6">
                Overview
              </h2>
              <div className="space-y-4">
                {product.overview.map((para, i) => (
                  <p key={i} className="text-base text-text-muted leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>

            {/* Right: capabilities */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' as const }}
              className="bg-surface rounded-2xl border border-border p-8"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5">
                Key Capabilities
              </p>
              <ul className="space-y-4">
                {product.capabilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M10.28 2.28a.75.75 0 00-1.06 0L4.5 6.94 2.78 5.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l5.25-5.25a.75.75 0 000-1.06z" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-text-primary leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Highlights */}
      <section className="bg-surface py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6 pb-6 border-b border-border">
            Technical Highlights
          </p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {product.techHighlights.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-border rounded-xl px-5 py-4 text-sm font-medium text-text-primary leading-snug"
              >
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Deployment Stats */}
      <section className="bg-primary py-16 lg:py-20" aria-label="Deployment statistics">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {product.stats.map(({ value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center py-4 lg:py-0 px-4 lg:px-10 text-center"
              >
                <span className="text-4xl lg:text-5xl font-extrabold text-white tabular-nums leading-none">
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

      {/* Related Products */}
      <section className="bg-white py-16 lg:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">
            More from Our Portfolio
          </p>
          <div className="flex flex-wrap gap-3">
            {related.map(p => (
              <Link
                key={p.slug}
                to={`/portfolio/${p.slug}`}
                className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-text-muted hover:text-primary hover:border-primary hover:bg-surface transition-all duration-200"
              >
                {p.label}
              </Link>
            ))}
            <Link
              to="/portfolio"
              className="px-4 py-2 rounded-full border border-border text-sm font-semibold text-text-muted hover:text-primary hover:border-primary hover:bg-surface transition-all duration-200"
            >
              All Products →
            </Link>
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
              Want to see {product.label} in action?
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
