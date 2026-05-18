import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  INNOVATIONS,
  INNOVATION_BY_SLUG,
  CATEGORY_LABEL,
  INNOVATION_STAGE_LABEL,
  type InnovationCategory,
  type InnovationStage,
} from '@/config/innovationsProducts'

// ── Category gradients ──────────────────────────────────────────────────────
const CATEGORY_GRADIENT: Record<InnovationCategory, string> = {
  monitoring: 'from-cyan-500/30 via-sky-400/20 to-blue-500/10',
  ai:         'from-violet-500/30 via-purple-400/20 to-indigo-500/10',
  storage:    'from-amber-500/30 via-orange-400/20 to-yellow-500/10',
  grid:       'from-indigo-500/30 via-blue-400/20 to-slate-500/10',
  ev:         'from-emerald-500/30 via-teal-400/20 to-green-500/10',
}

// ── Stage config ────────────────────────────────────────────────────────────
const STAGES: InnovationStage[] = ['research', 'prototype', 'deployed', 'scaled']

const STAGE_COLORS: Record<InnovationStage, { dot: string; pill: string; desc: string }> = {
  research:  { dot: 'bg-slate-400',   pill: 'bg-slate-100 text-slate-700 border-slate-200',   desc: 'Active R&D' },
  prototype: { dot: 'bg-amber-400',   pill: 'bg-amber-50 text-amber-700 border-amber-200',    desc: 'Pilot deployments' },
  deployed:  { dot: 'bg-primary',     pill: 'bg-sky-50 text-sky-700 border-sky-200',          desc: 'Commercially available' },
  scaled:    { dot: 'bg-secondary',   pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', desc: 'Live at 100+ sites' },
}

const STAGE_ICONS: Record<InnovationStage, React.ReactNode> = {
  research:  <ScienceOutlinedIcon style={{ fontSize: 18 }} />,
  prototype: <BiotechOutlinedIcon style={{ fontSize: 18 }} />,
  deployed:  <RocketLaunchOutlinedIcon style={{ fontSize: 18 }} />,
  scaled:    <VerifiedOutlinedIcon style={{ fontSize: 18 }} />,
}

// ── Hex mesh SVG background ─────────────────────────────────────────────────
function HexPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="hex" x="0" y="0" width="56" height="48" patternUnits="userSpaceOnUse">
          <polygon
            points="28,2 50,14 50,38 28,50 6,38 6,14"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex)" />
    </svg>
  )
}

// ── Inline Stage Bar (for hero) ─────────────────────────────────────────────
function HeroStageBar({ stage }: { stage: InnovationStage }) {
  const currentIdx = STAGES.indexOf(stage)
  return (
    <div className="flex items-center gap-0 w-full max-w-sm">
      {STAGES.map((s, i) => {
        const isActive = i === currentIdx
        const isPast   = i < currentIdx
        return (
          <div key={s} className="flex-1 flex flex-col items-center">
            <div className="w-full flex items-center">
              <div className={`flex-1 h-px ${i === 0 ? 'invisible' : isPast || isActive ? 'bg-white/40' : 'bg-white/15'}`} />
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                className={[
                  'w-3 h-3 rounded-full shrink-0',
                  isActive
                    ? `${STAGE_COLORS[stage].dot} ring-2 ring-white/30 ring-offset-1 ring-offset-transparent animate-pulse`
                    : isPast
                    ? 'bg-white/40'
                    : 'bg-white/15',
                ].join(' ')}
              />
              <div className={`flex-1 h-px ${i === STAGES.length - 1 ? 'invisible' : isPast ? 'bg-white/40' : 'bg-white/15'}`} />
            </div>
            <span className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/35'}`}>
              {INNOVATION_STAGE_LABEL[s]}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function InnovationProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const product = slug ? INNOVATION_BY_SLUG[slug] : undefined

  if (!product) return <Navigate to="/innovations" replace />

  const related = INNOVATIONS.filter(p => p.slug !== product.slug).slice(0, 5)
  const challengeSentence = product.overview[0]?.split('. ')[0] + '.' || ''
  const approachText = product.overview.slice(1).join(' ') || product.overview[0] || ''

  return (
    <main>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative bg-dark-bg min-h-[65vh] flex items-center overflow-hidden">
        <div className={`absolute inset-0 bg-linear-to-br ${CATEGORY_GRADIENT[product.category]} pointer-events-none`} />
        <HexPattern />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-32 lg:py-44">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${STAGE_COLORS[product.stage].pill}`}>
                {STAGE_ICONS[product.stage]}
                {INNOVATION_STAGE_LABEL[product.stage]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-white/70 border border-white/15">
                {CATEGORY_LABEL[product.category]}
              </span>
              {product.badge && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-4">
              {product.label}
            </h1>
            <p className="text-base lg:text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
              {product.subline}
            </p>

            {/* Stage bar */}
            <HeroStageBar stage={product.stage} />

            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request Early Access</Button>
              </Link>
              <Link to="/contact">
                <Button variant="dark" size="lg">Talk to an Engineer</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CHALLENGE → SOLUTION ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid lg:grid-cols-[9fr_11fr]">
          {/* Left: The Challenge (dark) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="bg-dark-bg px-8 lg:px-14 py-16 lg:py-24 flex flex-col justify-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">The Challenge</p>
            <p className="text-xl lg:text-2xl font-bold text-white leading-relaxed">
              {challengeSentence}
            </p>
          </motion.div>

          {/* Right: Our Approach (light) */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            className="bg-surface px-8 lg:px-14 py-16 lg:py-24 flex flex-col justify-center"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Our Approach</p>
            <p className="text-base text-text-muted leading-relaxed mb-6">{approachText}</p>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              See deployed projects <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── KEY CAPABILITIES ───────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label="What It Does" heading="Key Capabilities" />
          <div className="grid sm:grid-cols-2 gap-4 mt-10">
            {product.capabilities.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-4 bg-surface border border-border rounded-2xl px-6 py-5 hover:border-primary hover:shadow-sm transition-all duration-200"
              >
                <CheckCircleOutlinedIcon className="text-primary shrink-0 mt-0.5" style={{ fontSize: 20 }} />
                <span className="text-sm font-medium text-text-primary leading-snug">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNDER THE HOOD ─────────────────────────────────────────────── */}
      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeader label="Technical Architecture" heading="Under the Hood" />
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-0 mt-10 divide-y divide-border sm:divide-y-0">
            {product.techHighlights.map((item, i) => {
              const [label, ...rest] = item.split(/[:—–]/)
              const value = rest.join(' — ').trim() || label.trim()
              const specLabel = rest.length ? label.trim() : `Spec ${i + 1}`
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-border last:border-0"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted shrink-0 sm:w-36">
                    {rest.length ? specLabel : `Highlight ${i + 1}`}
                  </span>
                  <span className="font-mono text-sm font-semibold text-text-primary">{rest.length ? value : item}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── DEPLOYMENT STATS ───────────────────────────────────────────── */}
      <section className="bg-primary py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-10">
            Deployment Metrics
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

      {/* ── RELATED INNOVATIONS ────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <SectionHeader label="Our R&D Pipeline" heading="More Innovations" />
            <Link to="/innovations" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0">
              View All <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </div>

          {/* Horizontal scroll on mobile, wrap on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
            {related.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="shrink-0 snap-start w-52 lg:w-auto"
              >
                <Link
                  to={`/innovations/${p.slug}`}
                  className="group flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all duration-200 h-full"
                >
                  <div className={`h-1.5 w-full bg-linear-to-r ${p.gradient}`} />
                  <div className="p-4 flex-1 flex flex-col gap-2">
                    <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${STAGE_COLORS[p.stage].pill}`}>
                      {INNOVATION_STAGE_LABEL[p.stage]}
                    </span>
                    <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                      {p.label}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORY CONTEXT ───────────────────────────────────────────── */}
      <section className="bg-surface py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-wrap items-center gap-3 text-sm text-text-muted">
          <span className="font-semibold text-text-primary">Category:</span>
          <span className="px-3 py-1 rounded-full bg-white border border-border font-medium">
            {CATEGORY_LABEL[product.category]}
          </span>
          <span className="mx-1">·</span>
          <Link to="/portfolio" className="inline-flex items-center gap-1 hover:text-primary transition-colors duration-200">
            See our delivery portfolio <ArrowForwardIcon style={{ fontSize: 14 }} />
          </Link>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Get Early Access</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
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
