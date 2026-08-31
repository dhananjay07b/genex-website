import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import DashboardIcon from '@mui/icons-material/Dashboard'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import BarChartIcon from '@mui/icons-material/BarChart'
import DeviceHubIcon from '@mui/icons-material/DeviceHub'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageMeta } from '@/components/seo/PageMeta'
import { TechHighlightsSection } from '@/components/product/TechHighlightsSection'
import {
  PORTFOLIO_PRODUCTS,
  PRODUCT_BY_SLUG,
  FAMILY_LABEL,
} from '@/config/portfolioProjects'

// ── Capability icon set (cycles by index) ─────────────────────────────────────
const CAP_ICONS = [
  CloudQueueIcon,
  NotificationsNoneIcon,
  DashboardIcon,
  BuildOutlinedIcon,
  BarChartIcon,
  DeviceHubIcon,
]

// ── Stat value splitter ───────────────────────────────────────────────────────
function splitStat(value: string): { num: string; unit: string } {
  const m = value.match(/^([<>]?[\d,]+(?:\.\d+)?)([+%\s]*)(.*)$/)
  if (m) return { num: m[1], unit: (m[2] + m[3]).trim() }
  return { num: value, unit: '' }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>()
  const product = slug ? PRODUCT_BY_SLUG[slug] : undefined

  if (!product) return <Navigate to="/portfolio" replace />

  const related = PORTFOLIO_PRODUCTS.filter(p => p.slug !== product.slug).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={product.headline}
        description={product.subline}
        canonical={`/portfolio/${product.slug}`}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#f0f8ff] border-b border-[#e5e7eb] py-20 lg:py-28 overflow-hidden">
        <div
          className={`absolute -top-40 -right-40 w-md h-112 rounded-full blur-3xl opacity-30 bg-linear-to-br ${product.gradient}`}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' as const }}
          >
            <div className="flex items-center gap-3 mb-6">
              {product.badge && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full">
                  {product.badge}
                </span>
              )}
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-[#f0f4f8] text-[#62748e] rounded-full">
                {FAMILY_LABEL[product.family]}
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#162456] leading-tight mb-5 max-w-3xl">
              {product.label}
            </h1>
            <p className="text-lg text-[#45556c] leading-relaxed max-w-2xl mb-10">
              {product.subline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request a Demo</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Download Spec Sheet</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            >
              <h2 className="text-4xl font-bold text-[#162456] leading-tight capitalize mb-6">
                Overview
              </h2>
              <div className="space-y-5">
                {product.overview.map((para, i) => (
                  <p key={i} className="text-lg text-[#45556c] leading-7.25">{para}</p>
                ))}
              </div>
            </motion.div>

            {/* Right: capability grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
              className="border-t border-b border-[#eaf0f6] py-10"
            >
              <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                {product.capabilities.map((cap, i) => {
                  const Icon = CAP_ICONS[i % CAP_ICONS.length]
                  return (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="bg-[#f0f4f8] size-12 rounded-2xl flex items-center justify-center shrink-0">
                        <Icon style={{ fontSize: 24 }} className="text-[#62748e]" />
                      </div>
                      <p className="text-sm text-[#62748e] leading-snug">{cap}</p>
                    </div>
                  )
                })}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── TECHNICAL HIGHLIGHTS ─────────────────────────────────────────── */}
      <TechHighlightsSection highlights={product.techHighlights.slice(0, 4)} />

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-[#e5e7eb] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[#e5e7eb]">
            {product.stats.map(({ value, label }, i) => {
              const { num, unit } = splitStat(value)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex flex-col items-center gap-1.5 py-4 px-4 lg:px-10"
                >
                  <div className="flex items-baseline gap-1.5 justify-center">
                    <span className="text-4xl font-bold text-[#1d4ed8] leading-tight">{num}</span>
                    {unit && (
                      <span className="text-xl font-medium text-[#111827]">{unit}</span>
                    )}
                  </div>
                  <span className="text-sm text-[#6b7280] text-center">{label}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── MORE FROM PORTFOLIO ───────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-start justify-between mb-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' as const }}
              transition={{ duration: 0.45, ease: 'easeOut' as const }}
            >
              <h2 className="text-4xl font-bold text-[#162456] capitalize mb-3">
                More From Our Portfolio
              </h2>
              <p className="text-lg text-[#45556c]">
                Explore our full range of power intelligence solutions.
              </p>
            </motion.div>
            <Link
              to="/portfolio"
              className="shrink-0 mt-2 flex items-center gap-1.5 px-6 py-3 bg-[#f0f4f8] text-[#0f2930] text-sm font-bold rounded-full hover:bg-[#e5ebf0] transition-colors duration-200"
            >
              View All <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const }}
              >
                <Link
                  to={`/portfolio/${p.slug}`}
                  className="group block relative h-72 rounded-3xl overflow-hidden"
                >
                  <img
                    src={p.image}
                    alt={p.label}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">
                      {FAMILY_LABEL[p.family]}
                    </p>
                    <p className="text-2xl font-bold text-white leading-tight">{p.label}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Start a Project
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
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
