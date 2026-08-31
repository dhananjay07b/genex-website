import type { ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import SpeedIcon from '@mui/icons-material/Speed'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CloudQueueIcon from '@mui/icons-material/CloudQueue'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageMeta } from '@/components/seo/PageMeta'
import { TechHighlightsSection } from '@/components/product/TechHighlightsSection'
import {
  INNOVATIONS,
  INNOVATION_BY_SLUG,
  CATEGORY_LABEL,
  INNOVATION_STAGE_LABEL,
  type InnovationStage,
} from '@/config/innovationsProducts'

// ── Capability icon set (cycles by index) ─────────────────────────────────────
const CAP_ICONS = [
  FlightTakeoffIcon,
  RemoveRedEyeOutlinedIcon,
  SpeedIcon,
  LocationOnOutlinedIcon,
  CloudQueueIcon,
  BuildOutlinedIcon,
]

// ── Stage config ──────────────────────────────────────────────────────────────
const STAGE_ICONS: Record<InnovationStage, ReactNode> = {
  research:  <ScienceOutlinedIcon style={{ fontSize: 14 }} />,
  prototype: <BiotechOutlinedIcon style={{ fontSize: 14 }} />,
  deployed:  <RocketLaunchOutlinedIcon style={{ fontSize: 14 }} />,
  scaled:    <VerifiedOutlinedIcon style={{ fontSize: 14 }} />,
}

const STAGE_PILL: Record<InnovationStage, string> = {
  research:  'bg-slate-100 text-slate-700 border-slate-200',
  prototype: 'bg-amber-50 text-amber-700 border-amber-200',
  deployed:  'bg-sky-50 text-sky-700 border-sky-200',
  scaled:    'bg-emerald-50 text-emerald-700 border-emerald-200',
}

// ── Stat value splitter ───────────────────────────────────────────────────────
function splitStat(value: string): { num: string; unit: string } {
  const m = value.match(/^([<>]?[\d,]+(?:\.\d+)?)([+%\s]*)(.*)$/)
  if (m) return { num: m[1], unit: (m[2] + m[3]).trim() }
  return { num: value, unit: '' }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function InnovationProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? INNOVATION_BY_SLUG[slug] : undefined

  if (!product) return <Navigate to="/innovations" replace />

  const related = INNOVATIONS.filter(p => p.slug !== product.slug).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={product.headline}
        description={product.subline}
        canonical={`/innovations/${product.slug}`}
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
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-full ${STAGE_PILL[product.stage]}`}>
                {STAGE_ICONS[product.stage]}
                {INNOVATION_STAGE_LABEL[product.stage]}
              </span>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-[#f0f4f8] text-[#62748e] rounded-full">
                {CATEGORY_LABEL[product.category]}
              </span>
              {product.badge && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#162456] leading-tight mb-5 max-w-3xl">
              {product.label}
            </h1>
            <p className="text-lg text-[#45556c] leading-relaxed max-w-2xl mb-10">
              {product.subline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request Early Access</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Talk to an Engineer</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OVERVIEW ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <h2 className="text-4xl font-bold text-[#162456] leading-tight capitalize mb-6">
              Overview
            </h2>
            <div className="space-y-5 max-w-4xl">
              {product.overview.map((para, i) => (
                <p key={i} className="text-lg text-[#45556c] leading-7.25">{para}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CAPABILITIES GRID ────────────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-[#e0e6ed] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10"
          >
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
          </motion.div>
        </div>
      </section>

      {/* ── TECHNICAL HIGHLIGHTS ─────────────────────────────────────────── */}
      <TechHighlightsSection highlights={product.techHighlights} />

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

      {/* ── MORE FROM OUR INNOVATIONS ────────────────────────────────────── */}
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
                More From Our Innovations
              </h2>
              <p className="text-lg text-[#45556c]">
                Explore our full pipeline of power intelligence platforms.
              </p>
            </motion.div>
            <Link
              to="/innovations"
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
                  to={`/innovations/${p.slug}`}
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
                      {CATEGORY_LABEL[p.category]}
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
              Get Early Access
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Interested in {product.label}?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Talk to our engineering team about pilots, early access, and deployment timelines.
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
