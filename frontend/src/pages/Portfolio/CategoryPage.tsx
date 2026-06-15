import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CableIcon from '@mui/icons-material/Cable'
import CloudIcon from '@mui/icons-material/Cloud'
import RouterIcon from '@mui/icons-material/Router'
import SpeedIcon from '@mui/icons-material/Speed'
import SecurityIcon from '@mui/icons-material/Security'
import StorageIcon from '@mui/icons-material/Storage'
import ApiIcon from '@mui/icons-material/Api'
import MemoryIcon from '@mui/icons-material/Memory'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageMeta } from '@/components/seo/PageMeta'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  PORTFOLIO_PRODUCTS,
  PRODUCT_BY_SLUG,
  FAMILY_LABEL,
} from '@/config/portfolioProjects'

// Circuit board SVG geometry for hero backgrounds
function CircuitPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M0 40 H30 M50 40 H80 M40 0 V30 M40 50 V80" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="40" cy="40" r="4" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="0" cy="40" r="2" fill="white" />
          <circle cx="80" cy="40" r="2" fill="white" />
          <circle cx="40" cy="0" r="2" fill="white" />
          <circle cx="40" cy="80" r="2" fill="white" />
          <rect x="14" y="34" width="12" height="12" stroke="white" strokeWidth="0.75" fill="none" />
          <rect x="54" y="34" width="12" height="12" stroke="white" strokeWidth="0.75" fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  )
}

function techIcon(spec: string) {
  const s = spec.toLowerCase()
  if (s.includes('cloud') || s.includes('mqtt') || s.includes('rest')) return <CloudIcon fontSize="small" />
  if (s.includes('modbus') || s.includes('rs485') || s.includes('can') || s.includes('cable')) return <CableIcon fontSize="small" />
  if (s.includes('4g') || s.includes('lte') || s.includes('wifi') || s.includes('ethernet')) return <RouterIcon fontSize="small" />
  if (s.includes('speed') || s.includes('sub-') || s.includes('<1')) return <SpeedIcon fontSize="small" />
  if (s.includes('redundan') || s.includes('protect') || s.includes('security') || s.includes('failover')) return <SecurityIcon fontSize="small" />
  if (s.includes('storage') || s.includes('sqlite') || s.includes('buffer') || s.includes('histor')) return <StorageIcon fontSize="small" />
  if (s.includes('api') || s.includes('opc') || s.includes('dnp') || s.includes('iec')) return <ApiIcon fontSize="small" />
  return <MemoryIcon fontSize="small" />
}

const slideLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
}

export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>()
  const product = slug ? PRODUCT_BY_SLUG[slug] : undefined

  if (!product) return <Navigate to="/portfolio" replace />

  const related = PORTFOLIO_PRODUCTS.filter(p => p.slug !== product.slug).slice(0, 6)

  return (
    <main>
      <PageMeta
        title={product.headline}
        description={product.subline}
        canonical={`/portfolio/${product.slug}`}
      />
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative bg-dark-bg min-h-[62vh] flex items-center overflow-hidden">
        {/* gradient tint layer */}
        <div className={`absolute inset-0 bg-linear-to-br ${product.gradient} opacity-40 pointer-events-none`} />
        <CircuitPattern />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-32 lg:py-40">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">

            {/* Left */}
            <motion.div {...slideLeft}>
              <div className="flex items-center gap-3 mb-5">
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
                    {product.badge}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-white/70 border border-white/10">
                  {FAMILY_LABEL[product.family]}
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
                {product.label}
              </h1>
              <p className="text-base lg:text-lg text-white/70 leading-relaxed max-w-xl mb-10">
                {product.subline}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact#demo">
                  <Button variant="primary" size="lg">Request a Demo</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="dark" size="lg">Download Spec Sheet</Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: stat cards */}
            <div className="grid grid-cols-1 gap-4">
              {product.stats.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: 'easeOut' }}
                  className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-6 py-5 flex items-center gap-5"
                >
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-white leading-none">{value}</div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-white/55 mt-1">{label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OVERVIEW ─────────────────────────────────────────────────── */}
      <section id="overview" className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <SectionHeader label="Product Overview" heading="What It Does" />
              <div className="space-y-5 mt-8">
                {product.overview.map((para, i) => (
                  <p key={i} className="text-base text-text-muted leading-relaxed">{para}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="bg-surface rounded-2xl border border-border p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-6">Key Capabilities</p>
              <ul className="space-y-4">
                {product.capabilities.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircleOutlinedIcon className="text-primary mt-0.5 shrink-0" style={{ fontSize: 18 }} />
                    <span className="text-sm font-medium text-text-primary leading-snug">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE BLOCK ───────────────────────────────────────── */}
      <section id="architecture" className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label="Technical Architecture" heading="Under the Hood" />
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {product.techHighlights.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-white border border-border rounded-2xl px-6 py-5 flex items-start gap-4 hover:border-primary hover:shadow-sm transition-all duration-200"
              >
                <span className="text-primary mt-0.5 shrink-0">{techIcon(item)}</span>
                <span className="text-sm font-medium text-text-primary leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AT SCALE ─────────────────────────────────────────────────── */}
      <section id="scale" className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-10">
            Deployed Across India's Power Infrastructure
          </p>
          <div className="grid grid-cols-3 divide-x divide-white/20">
            {product.stats.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center py-4 px-4 lg:px-10">
                <AnimatedStat value={value} label={label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKS WITH ───────────────────────────────────────────────── */}
      <section id="integrations" className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label="Integrations" heading="Works With" subtext="This product connects natively with the protocols and platforms your infrastructure already uses." />
          <div className="flex flex-wrap gap-3 mt-8">
            {product.techHighlights.flatMap(h =>
              h.split(/and|,|with|for|via/).map(s => s.trim()).filter(s => s.length > 2 && s.length < 40)
            ).map((tag, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="px-4 py-2 bg-surface border border-border rounded-full text-sm font-medium text-text-primary hover:border-primary hover:text-primary transition-colors duration-200 cursor-default"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ── RELATED PRODUCTS ─────────────────────────────────────────── */}
      <section className="bg-surface py-16 lg:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeader label="Our Portfolio" heading="Related Products" />
            <Link
              to="/portfolio"
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Browse All <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <Link
                  to={`/portfolio/${p.slug}`}
                  className="group block bg-white border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className={`h-2 w-full bg-linear-to-r ${p.gradient}`} />
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-1">
                      {FAMILY_LABEL[p.family]}
                    </p>
                    <p className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors duration-200 leading-snug">
                      {p.label}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link to="/portfolio" className="flex items-center gap-1 text-sm font-semibold text-primary">
              Browse All Products <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Start a Project</p>
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
