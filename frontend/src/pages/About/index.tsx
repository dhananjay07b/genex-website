import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import StarIcon from '@mui/icons-material/Star'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { Button } from '@/components/ui/Button'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ────────────────────────────────────────────────────────────────────

const MILESTONES = [
  {
    year: '2010',
    label: 'THE BEGINNING',
    title: 'Founded in Jaipur',
    description:
      'Genex Technocrats started as a power electronics consultancy, providing engineering services to industrial and commercial clients in Rajasthan.',
  },
  {
    year: '2014',
    label: 'FIRST DEPLOYMENT',
    title: 'First SCADA Deployment',
    description:
      "Delivered the first industrial SCADA system for a 10 MW solar farm — the beginning of Genex's transition from services to products.",
  },
  {
    year: '2017',
    label: 'PRODUCT LAUNCH',
    title: 'SolarLive™ Launched',
    description:
      'Launched SolarLive™, the flagship solar monitoring platform. Within 18 months, it was deployed across 50+ sites in 4 states.',
  },
  {
    year: '2019',
    label: 'PM KUSUM ROLLOUT',
    title: 'State-Level Contract',
    description:
      'Won first state-level PM Kusum monitoring contract, deploying RMS across 500+ rural solar pumping installations in Rajasthan.',
  },
  {
    year: '2021',
    label: '500 MW MILESTONE',
    title: '500 MW Under Monitoring',
    description:
      'Crossed 500 MW of renewable capacity under active monitoring across SolarLive™, SCADA, and RMS deployments nationwide.',
  },
  {
    year: '2024',
    label: 'AI & BEYOND',
    title: 'AI & Innovation Division',
    description:
      'Launched the AI research division — developing next-generation products including AI-RMS, Drone Monitoring, and Smart Grid platforms.',
    isCurrent: true,
  },
]

const STATS = [
  { value: '14+',    label: 'Years of Operation' },
  { value: '120+',   label: 'Projects Delivered' },
  { value: '500 MW', label: 'Capacity Monitored' },
  { value: '10+',    label: 'States Covered'      },
]

const VISION_CARDS = [
  {
    icon: LanguageOutlinedIcon,
    title: 'Pan-India Scale',
    text: 'Interconnected state grids sharing power seamlessly — monitored from a single platform.',
  },
  {
    icon: ShieldOutlinedIcon,
    title: 'Absolute Reliability',
    text: 'Systems engineered for 99.9%+ uptime in mission-critical energy environments.',
  },
]

const MISSION_POINTS = [
  {
    icon: BoltOutlinedIcon,
    title: 'Optimise Efficiency',
    text: 'Build software-first solutions that reduce energy waste by intelligently routing power exactly where it is needed.',
  },
  {
    icon: SecurityOutlinedIcon,
    title: 'Protect Infrastructure',
    text: 'Defending national power grids against sophisticated cyber attacks — ISO 27001 certified, field-tested.',
  },
  {
    icon: CheckCircleOutlinedIcon,
    title: 'Ensure Reliability',
    text: 'Ship products that work in the field, not just in demos — built on open standards to prevent vendor lock-in.',
  },
]

const LEADERSHIP = [
  {
    title: 'Founder & CEO',
    bio: 'Power systems engineer with 20+ years in industrial automation and renewable energy. Led the company from consultancy to a full-stack energy technology platform.',
    initials: 'G',
  },
  {
    title: 'Head of Engineering',
    bio: 'Led SCADA and monitoring platform development across 80+ deployments. Expert in IEC 61850, OPC-UA, and distributed systems architecture.',
    initials: 'E',
  },
  {
    title: 'Head of AI & R&D',
    bio: 'Data scientist specialising in time-series ML for energy systems. Leads the AI research division building next-generation predictive platforms.',
    initials: 'A',
  },
]

const PARTNERS = [
  'Siemens',
  'Schneider Electric',
  'ABB',
  'Huawei Solar',
  'SMA Solar',
  'Delta Electronics',
  'Fronius',
  'Growatt',
]

const CERTIFICATIONS = [
  { name: 'ISO 9001:2015',   label: 'Quality Management System'           },
  { name: 'ISO 27001',       label: 'Information Security Management'     },
  { name: 'IEC 61850',       label: 'Power System Communication Standard' },
  { name: 'MNRE Empanelled', label: 'Ministry of New & Renewable Energy'  },
]

// ── Animation helpers ────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.6, ease: 'easeOut' as const, delay },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

// ── About Page ───────────────────────────────────────────────────────────────

export default function About() {
  return (
    <>
      <PageMeta
        title="About Genex Technocrats — India's Energy Intelligence Platform"
        description="Founded in Jaipur in 2010, Genex Technocrats has grown from a power electronics consultancy to a full-stack energy intelligence platform. 500 MW monitored."
        canonical="/about"
      />
      <PageHero
        label="About Genex"
        headline="Engineering India's Energy Future"
        subline="We are a Jaipur-based energy technology company — building the software and systems that run India's renewable energy infrastructure, one platform at a time."
      />

      {/* ── THE SPARK ───────────────────────────────────────────────────── */}
      <section className="bg-surface py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — image + floating quote card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative pb-10 pr-8 lg:pb-12 lg:pr-10"
            >
              {/* Tilted background decoration */}
              <div
                className="absolute inset-[-26px_-24px_-18px_0] rounded-3xl -rotate-2 pointer-events-none"
                style={{ background: '#f0fdfa' }}
                aria-hidden="true"
              />
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden border border-[#e2e8f0] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_8px_10px_-6px_rgba(0,0,0,0.10)]">
                <img
                  src="/images/edge/control-room.png"
                  alt="Genex engineering team at work"
                  className="w-full aspect-4/3 object-cover"
                  loading="lazy"
                  width="800"
                  height="600"
                />
              </div>
              {/* Floating quote card — bottom right, outside image */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35, ease: 'easeOut' }}
                className="absolute bottom-0 right-0 max-w-70 bg-[#1AAEE8] rounded-xl p-5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.18)]"
              >
                <FormatQuoteIcon className="text-white/50 mb-2" style={{ fontSize: 26 }} />
                <p className="text-white font-bold text-sm leading-relaxed">
                  "If the future of energy is decentralised, the software managing it must be flawless, scalable, and secure."
                </p>
              </motion.div>
            </motion.div>

            {/* Right — text */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Our Origin</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-6">
                The Spark That Ignited A Digital Revolution.
              </h2>
              <p className="text-base text-text-muted leading-relaxed mb-6">
                The software managing decentralised power sources was fragmented, insecure, and incapable of handling real-time data at scale. Utility companies were running 21st-century energy infrastructure on 1990s tools.
              </p>
              {/* Highlighted pull quote */}
              <div className="bg-[rgba(240,249,255,0.6)] border-l-4 border-[#00C5B0] pl-5 py-3 rounded-r-lg">
                <p className="text-sm font-semibold text-[#1c398e] leading-relaxed">
                  Genex was founded on a single premise: build software that is flawless, scalable, and secure — for India's energy future.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── TIMELINE OF INNOVATION ──────────────────────────────────────── */}
      <section id="story" className="bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-16 text-center">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-3">
              A Timeline of Innovation
            </h2>
            <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
              Trace our path from a small Jaipur consultancy to a full-stack energy intelligence platform covering 500 MW across India.
            </p>
          </motion.div>

          <div className="relative">
            {/* Vertical spine */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ originY: 0, background: 'linear-gradient(to bottom, #96f7e4, #1AAEE8)' }}
              className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-1 rounded-full lg:-translate-x-0.5"
              aria-hidden="true"
            />

            <div className="space-y-12">
              {MILESTONES.map((m, i) => {
                const isLeft = i % 2 === 0
                return (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.55, delay: 0.05 }}
                    className="relative pl-16 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 items-center"
                  >
                    {/* Timeline node */}
                    <div
                      className={[
                        'absolute left-2 top-8 lg:top-1/2 lg:left-1/2 z-10',
                        'flex items-center justify-center rounded-full border-4 border-solid',
                        '-translate-y-1/2 lg:-translate-x-1/2',
                        m.isCurrent
                          ? 'w-10 h-10 bg-[#00bba7] border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.12)]'
                          : 'w-8 h-8 bg-white border-[#00bba7] shadow-md',
                      ].join(' ')}
                      aria-hidden="true"
                    >
                      {m.isCurrent
                        ? <StarIcon style={{ fontSize: 14, color: 'white' }} />
                        : <div className="w-2 h-2 rounded-full bg-[#00bba7]" />
                      }
                    </div>

                    {/* Year block — desktop only */}
                    <div
                      className={[
                        'hidden lg:flex flex-col gap-1',
                        isLeft ? 'items-end pr-14' : 'items-start pl-14 col-start-2 row-start-1',
                      ].join(' ')}
                    >
                      <span
                        className="font-extrabold leading-none text-5xl"
                        style={{ color: m.isCurrent ? '#96f7e4' : '#dbeafe' }}
                      >
                        {m.year}
                      </span>
                      <span className="text-xs font-bold uppercase tracking text-[#009689]">
                        {m.label}
                      </span>
                    </div>

                    {/* Card */}
                    <div
                      className={[
                        isLeft ? 'lg:col-start-2 lg:pl-14' : 'lg:col-start-1 lg:pr-14 lg:row-start-1',
                      ].join(' ')}
                    >
                      {/* Mobile year label */}
                      <div className="lg:hidden mb-2 flex items-baseline gap-3">
                        <span className="text-xl font-extrabold text-primary">{m.year}</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-[#009689]">{m.label}</span>
                      </div>
                      <motion.div
                        whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.13)' }}
                        transition={{ duration: 0.2 }}
                        className={[
                          'rounded-2xl px-6 py-5 transition-all duration-200',
                          m.isCurrent
                            ? 'bg-[#f0fff9] border border-[#00d783] shadow-[0_0_0_2px_rgba(0,187,167,0.15)]'
                            : 'bg-white border border-[#e2e8f0] shadow-sm hover:border-primary/40',
                        ].join(' ')}
                      >
                        <h3 className="text-base font-extrabold text-[#162456] mb-2">{m.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{m.description}</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION ──────────────────────────────────────────────────────── */}
      <section id="vision" className="bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — text + feature cards */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-3xl bg-[#f0fdfa] border border-[#cbfbf1] flex items-center justify-center shrink-0">
                  <LanguageOutlinedIcon style={{ fontSize: 22, color: '#00bba7' }} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456]">Our Vision</h2>
              </div>
              <h3 className="text-xl font-bold text-[#00786f] leading-snug mb-4">
                A world powered by clean, intelligent energy.
              </h3>
              <p className="text-base text-text-muted leading-relaxed mb-8">
                We look toward a horizon where reliance on fossil fuels is a relic of the past. In this future, energy is decentralised, intelligent, and resilient — managed by software that never sleeps.
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {VISION_CARDS.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    variants={staggerChild}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,174,232,0.10)', borderColor: '#1AAEE8' }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-5 transition-all duration-200"
                  >
                    <Icon style={{ fontSize: 24, color: '#009689' }} />
                    <p className="mt-3 text-sm font-bold text-[#1c398e]">{title}</p>
                    <p className="mt-1 text-xs text-text-muted leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — image with gradient decoration */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="relative"
            >
              <div
                className="absolute inset-[-16px_-1px_-25px_-26px] rounded-2xl rotate-3 pointer-events-none"
                style={{ background: 'linear-gradient(45.8deg, #cbfbf1 0%, #eff6ff 100%)' }}
                aria-hidden="true"
              />
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
                <img
                  src="/images/what-we-build/solar-rooftop.png"
                  alt="Solar rooftop installation"
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-[1.03]"
                  loading="lazy"
                  width="600"
                  height="600"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── MISSION ─────────────────────────────────────────────────────── */}
      <section id="mission" className="bg-surface py-20 lg:py-28 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — image */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative order-2 lg:order-1"
            >
              <div
                className="absolute inset-[-17px_-36px_-27px_-8px] rounded-2xl -rotate-3 pointer-events-none"
                style={{ background: 'linear-gradient(225.1deg, #dbeafe 0%, #f0fdfa 100%)' }}
                aria-hidden="true"
              />
              <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
                <img
                  src="/images/projects/solar-rajasthan.png"
                  alt="Solar farm in Rajasthan"
                  className="w-full aspect-square object-cover transition-transform duration-500 hover:scale-[1.03]"
                  loading="lazy"
                  width="600"
                  height="600"
                />
              </div>
            </motion.div>

            {/* Right — text + card bullets */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-3xl bg-[#dbeafe] border border-[#bedbff] flex items-center justify-center shrink-0">
                  <CheckCircleOutlinedIcon style={{ fontSize: 22, color: '#193cb8' }} />
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456]">Our Mission</h2>
              </div>
              <h3 className="text-xl font-bold text-[#193cb8] leading-snug mb-4">
                To make every megawatt perform at its peak — safely, reliably, profitably.
              </h3>
              <p className="text-base text-text-muted leading-relaxed mb-8">
                While our vision defines where we are going, our mission defines what we do every single day. We are an engineering powerhouse dedicated to building software that powers India's clean energy transition.
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {MISSION_POINTS.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    variants={staggerChild}
                    whileHover={{ x: 4, boxShadow: '0 4px 16px rgba(26,174,232,0.08)', borderColor: '#1AAEE8' }}
                    transition={{ duration: 0.2 }}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-4 flex gap-4 items-start shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200"
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon style={{ fontSize: 18, color: '#1AAEE8' }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#162456] mb-1">{title}</p>
                      <p className="text-sm text-text-muted leading-relaxed">{text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── BY THE NUMBERS ──────────────────────────────────────────────── */}
      <section id="numbers" className="bg-primary py-16 lg:py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/60 mb-10">
            Genex in Numbers
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
            {STATS.map(({ value, label }) => (
              <div key={label} className="flex flex-col items-center justify-center py-8 lg:py-0 px-4">
                <AnimatedStat value={value} label={label} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP ──────────────────────────────────────────────────── */}
      <section id="leadership" className="bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Leadership</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight">
              The team behind the platform.
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {LEADERSHIP.map((person) => (
              <motion.div
                key={person.title}
                variants={staggerChild}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.12)', borderColor: '#1AAEE8' }}
                transition={{ duration: 0.22 }}
                className="group bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-8 transition-all duration-200"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white mb-5 group-hover:scale-105 transition-transform duration-200"
                  style={{ background: 'linear-gradient(135deg, #1AAEE8, #00D97E)' }}
                  aria-hidden="true"
                >
                  {person.initials}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2">{person.title}</p>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{person.bio}</p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn profile of ${person.title}`}
                >
                  <LinkedInIcon style={{ fontSize: 16 }} /> LinkedIn
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PARTNERS & CERTIFICATIONS ───────────────────────────────────── */}
      <section id="partners" className="bg-[#f8fafc] py-20 lg:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Partners & Certifications</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight">
              Built with the industry's best.
            </h2>
          </motion.div>

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Technology Partners</p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mb-14"
          >
            {PARTNERS.map((p) => (
              <motion.span
                key={p}
                variants={staggerChild}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.15 }}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-sm font-semibold text-[#162456] hover:border-primary hover:text-primary transition-colors duration-200 cursor-default"
              >
                {p}
              </motion.span>
            ))}
          </motion.div>

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Certifications & Accreditations</p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {CERTIFICATIONS.map(({ name, label }) => (
              <motion.div
                key={name}
                variants={staggerChild}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,174,232,0.10)', borderColor: '#1AAEE8' }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[#e2e8f0] rounded-2xl px-6 py-5 flex items-start gap-4 transition-all duration-200"
              >
                <VerifiedOutlinedIcon className="text-primary shrink-0 mt-0.5" style={{ fontSize: 22 }} />
                <div>
                  <p className="text-sm font-extrabold text-[#162456] mb-0.5">{name}</p>
                  <p className="text-xs text-text-muted">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 flex justify-end">
            <Link
              to="/about/media"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              View Media & Achievements <ArrowForwardIcon style={{ fontSize: 14 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNERS & ALLIANCES ────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div {...fadeUp()} className="mb-14 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Partners & Alliances
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              Our values are the operating system of our company culture — dictating how we write code, how we treat our clients, and how we approach India's energy transition.
            </p>
          </motion.div>

          {/* Row 1 */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4"
          >
            {PARTNERS.slice(0, 4).map((name) => (
              <motion.div
                key={name}
                variants={staggerChild}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(26,174,232,0.12)', borderColor: '#1AAEE8' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#e7edf4] p-6 flex flex-col items-center justify-center gap-3 aspect-3/2 transition-all duration-200 cursor-default"
              >
                <div className="w-14 h-12 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
                  <div className="w-8 h-4 rounded bg-[#e2e8f0]" />
                </div>
                <p className="text-xs font-semibold text-text-muted text-center group-hover:text-primary transition-colors">{name}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Row 2 — offset right on desktop */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:translate-x-16"
          >
            {PARTNERS.slice(4).map((name) => (
              <motion.div
                key={name}
                variants={staggerChild}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(26,174,232,0.12)', borderColor: '#1AAEE8' }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-[#e7edf4] p-6 flex flex-col items-center justify-center gap-3 aspect-3/2 transition-all duration-200 cursor-default"
              >
                <div className="w-14 h-12 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center">
                  <div className="w-8 h-4 rounded bg-[#e2e8f0]" />
                </div>
                <p className="text-xs font-semibold text-text-muted text-center">{name}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section id="cta" className="bg-brand-tint py-20 lg:py-28 scroll-mt-20 relative overflow-hidden">
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp()}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Next Chapter</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Ready to work with us?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Whether you're a developer, discom, or enterprise — we'd like to understand your project and show you what Genex can deliver.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="primary" size="lg">Contact Us</Button>
              </Link>
              <Link to="/portfolio">
                <Button variant="secondary" size="lg">
                  See Our Work <ArrowForwardIcon style={{ fontSize: 16, marginLeft: 4 }} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
