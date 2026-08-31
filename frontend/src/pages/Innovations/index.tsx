import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'

// ── Animation presets ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ── Data ──────────────────────────────────────────────────────────────────────

interface Innovation {
  slug: string
  label: string
  description: string
  icon: string
}

const INNOVATIONS: Innovation[] = [
  {
    slug: 'solar-rooftop',
    label: 'Advanced SCADA',
    description:
      'Cloud-native, protocol-agnostic control layer supporting IEC 61850, DNP3, Modbus, and OPC-UA — with built-in AI anomaly detection across mixed-vendor field devices.',
    icon: '/images/innovations/icon-scada.svg',
  },
  {
    slug: 'solar-power-plants',
    label: 'Re-NMS',
    description:
      'Dedicated network management system for renewable energy infrastructure — monitoring edge devices, modems, and data loggers across hundreds of sites with automated outage detection.',
    icon: '/images/innovations/icon-renms.svg',
  },
  {
    slug: 'rms',
    label: 'AI-Based Remote Monitoring Systems',
    description:
      'Machine learning layer over conventional monitoring — shifting from reactive alerts to predictive operations with automated plain-language work orders for maintenance teams.',
    icon: '/images/innovations/icon-ai-rms.svg',
  },
  {
    slug: 'energy-storage',
    label: 'EMS - BESS',
    description:
      'AI-driven economic dispatch for battery storage — automatically optimizing charge/discharge against tariff schedules, grid signals, and battery degradation in real time.',
    icon: '/images/innovations/icon-ems-bess.svg',
  },
  {
    slug: 'wind-energy',
    label: 'Drone Monitoring',
    description:
      'Autonomous drone inspection for solar arrays and wind assets — AI-generated geo-tagged fault maps with severity classification from thermal and RGB aerial imagery.',
    icon: '/images/innovations/icon-drone.svg',
  },
  {
    slug: 'industrial-energy',
    label: 'Power Management Tools',
    description:
      'Industrial energy intelligence platform covering load profiling, power factor correction, harmonic analysis, and ISO 50001 EnPI reporting for industrial facilities.',
    icon: '/images/innovations/icon-power-tools.svg',
  },
  {
    slug: 'ai-health-checkup',
    label: 'AI-Plant Health Checkup',
    description:
      'Automated AI diagnostic for solar and storage plants — 12-month performance analysis, subsystem health scoring, and prioritized remediation with financial recovery estimates.',
    icon: '/images/innovations/icon-ai-health.svg',
  },
  {
    slug: 'smart-grid',
    label: 'Smart Grid & Utilities',
    description:
      'Unified operations platform for utilities and discoms — AMI integration, feeder automation, non-technical loss detection, and demand response orchestration.',
    icon: '/images/innovations/icon-smart-grid.svg',
  },
  {
    slug: 'ev-infrastructure',
    label: 'EV - Software Management',
    description:
      'AI-driven fleet charging intelligence with OCPP 2.0.1 and V2G readiness — optimizing schedules against tariff curves and vehicle telematics for enterprise operators.',
    icon: '/images/innovations/icon-ev.svg',
  },
  {
    slug: 'power-trading',
    label: 'Power Trading',
    description:
      'Algorithmic power trading platform for IEX Day-Ahead and Real-Time markets — generation forecasting, bid optimization, and demand flexibility aggregation.',
    icon: '/images/innovations/icon-trading.svg',
  },
  {
    slug: 'power-billing',
    label: 'Power Billing System',
    description:
      'Enterprise automated billing for utilities and discoms — multi-tariff engine, bulk bill generation, digital delivery, and discom MIS reconciliation at scale.',
    icon: '/images/innovations/icon-billing.svg',
  },
]

// ── Card ──────────────────────────────────────────────────────────────────────

function InnovationCard({ item }: { item: Innovation }) {
  return (
    <motion.div
      variants={staggerChild}
      className="flex flex-col p-10 bg-white border border-[#e2e8f0]"
      whileHover={{ y: -6, boxShadow: 'inset 0 3px 0 #1AAEE8, 0 16px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <img
        src={item.icon}
        alt=""
        aria-hidden="true"
        className="w-12 h-12 mb-6"
      />

      <p className="text-2xl font-bold text-[#1d293d] leading-tight mb-3">
        {item.label}
      </p>

      <p className="text-[15px] text-[#45556c] leading-7 flex-1">
        {item.description}
      </p>

      <Link
        to={`/innovations/${item.slug}`}
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200 self-start"
      >
        Read More &rarr;
      </Link>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Innovations() {
  return (
    <main>
      <PageMeta
        title="Innovations — Genex Technocrats"
        description="11 innovation platforms built for India's power sector — from Advanced SCADA and AI monitoring to drone inspection, EV management, and smart grid utilities."
        canonical="/innovations"
      />

      <PageHero
        label="Innovation"
        headline="Our Innovations"
        subline="Engineering platforms that push what's possible in India's energy infrastructure — built in-house, deployed at scale."
      />

      {/* ── INTRO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-4">
        <motion.div {...fadeUp(0)} className="max-w-150 mx-auto px-6 text-center">
          <h2 className="text-[36px] font-bold text-[#162456] leading-tight capitalize mb-4">
            Our Innovations
          </h2>
          <p className="text-[18px] text-[#45556c] leading-7.25">
            From real-time network management to AI-driven diagnostics and autonomous drone inspection — every platform is purpose-built for the complexity of India&apos;s power sector.
          </p>

        </motion.div>
      </section>

      {/* ── CARD GRID ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' as const }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-[#e2e8f0]"
          >
            {INNOVATIONS.map((item) => (
              <InnovationCard key={item.slug} item={item} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28 relative overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-md h-112 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-md h-112 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Partner With Genex
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Interested in early access or a pilot?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Our engineering team works directly with operators, utilities, and developers to scope, pilot, and deploy — from a single site to a national rollout.
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
