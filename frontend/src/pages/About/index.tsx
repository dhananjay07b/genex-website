import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { Button } from '@/components/ui/Button'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { PageHero } from '@/components/ui/PageHero'

// ── Data ────────────────────────────────────────────────────────────────────

const MILESTONES = [
  { year: '2010', title: 'Founded in Jaipur',      description: 'Genex Technocrats started as a power electronics consultancy, providing engineering services to industrial and commercial clients in Rajasthan.' },
  { year: '2014', title: 'First SCADA Deployment', description: "Delivered the first industrial SCADA system for a 10 MW solar farm — the beginning of Genex's transition from services to products." },
  { year: '2017', title: 'SolarLive™ Launched',    description: "Launched SolarLive™, the flagship solar monitoring platform. Within 18 months, it was deployed across 50+ sites in 4 states." },
  { year: '2019', title: 'PM Kusum Rollout',        description: 'Won first state-level PM Kusum monitoring contract, deploying RMS across 500+ rural solar pumping installations in Rajasthan.' },
  { year: '2021', title: '500 MW Milestone',        description: 'Crossed 500 MW of renewable capacity under active monitoring across SolarLive™, SCADA, and RMS deployments nationwide.' },
  { year: '2024', title: 'AI & Innovation Division',description: 'Launched the AI research division — developing next-generation products including AI-RMS, Drone Monitoring, and Smart Grid platforms.' },
]

const STATS = [
  { value: '14+',    label: 'Years of Operation'  },
  { value: '120+',   label: 'Projects Delivered'  },
  { value: '500 MW', label: 'Capacity Monitored'  },
  { value: '10+',    label: 'States Covered'       },
]

const MISSION_POINTS = [
  { text: 'Build software-first solutions for energy infrastructure — not afterthoughts.' },
  { text: 'Ship products that work in the field, not just in demos.' },
  { text: 'Use open standards to prevent vendor lock-in for our customers.' },
  { text: 'Operate with the transparency and accountability of a trusted engineering partner.' },
]

const LEADERSHIP = [
  { title: 'Founder & CEO',        bio: 'Power systems engineer with 20+ years in industrial automation and renewable energy. Led the company from consultancy to a full-stack energy technology platform.', initials: 'G' },
  { title: 'Head of Engineering',  bio: 'Led SCADA and monitoring platform development across 80+ deployments. Expert in IEC 61850, OPC-UA, and distributed systems architecture.', initials: 'E' },
  { title: 'Head of AI & R&D',     bio: 'Data scientist specialising in time-series ML for energy systems. Leads the AI research division building next-generation predictive platforms.', initials: 'A' },
]

const PARTNERS = ['Siemens', 'Schneider Electric', 'ABB', 'Huawei Solar', 'SMA Solar', 'Delta Electronics', 'Fronius', 'Growatt']

const CERTIFICATIONS = [
  { name: 'ISO 9001:2015',   label: 'Quality Management System'             },
  { name: 'ISO 27001',       label: 'Information Security Management'       },
  { name: 'IEC 61850',       label: 'Power System Communication Standard'   },
  { name: 'MNRE Empanelled', label: 'Ministry of New & Renewable Energy'    },
]

// ── Concentric arcs SVG for section backgrounds ──────────────────────────────
function ArcsPattern() {
  return (
    <svg
      className="absolute right-0 top-0 h-full w-1/2 opacity-[0.04] pointer-events-none"
      viewBox="0 0 400 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMaxYMid slice"
    >
      {[80, 160, 240, 320, 400, 480].map((r) => (
        <circle key={r} cx="400" cy="300" r={r} stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.5, ease: 'easeOut' as const, delay },
})

// ── About Page ───────────────────────────────────────────────────────────────
export default function About() {
  return (
    <>
      <PageHero
        label="About Genex"
        headline="Engineering India's Energy Future"
        subline="We are a Jaipur-based energy technology company — building the software and systems that run India's renewable energy infrastructure, one platform at a time."
      />

      <div className="relative">

        {/* ── THE SPARK ─────────────────────────────────────────── */}
        <section className="bg-surface py-20 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left — image with overlaid quote card */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="relative rounded-2xl overflow-hidden min-h-85 lg:min-h-110"
              >
                <img
                  src="/images/edge/control-room.png"
                  alt="Genex engineering team at work"
                  className="w-full h-full object-cover absolute inset-0"
                />
                {/* Quote overlay card */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="bg-dark-bg/90 backdrop-blur-sm rounded-xl p-5">
                    <p className="text-white/40 text-3xl font-serif leading-none mb-2">"</p>
                    <p className="text-sm text-white/90 leading-relaxed italic">
                      [Founder quote placeholder]
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Right — text */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Our Origin</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-6">
                  The Spark That Ignited A Digital Revolution.
                </h2>
                <p className="text-base text-text-muted leading-relaxed">
                  Genex Technocrats was founded on a single premise: if the future of energy is decentralised, the software managing it must be flawless, scalable, and secure.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── OUR STORY ─────────────────────────────────────────── */}
        <section id="story" className="relative bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
          <div className="text-text-primary">
            <ArcsPattern />
          </div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div {...fadeUp()} className="mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Our Story</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
                A Timeline of Innovation.
              </h2>
              <p className="text-sm text-text-muted mt-3">
                Trace our path from a small Jaipur consultancy to a full-stack energy intelligence platform.
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Gradient spine */}
              <div
                className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-px lg:-translate-x-px"
                style={{ background: 'linear-gradient(to bottom, #1AAEE8, #00D97E)' }}
                aria-hidden="true"
              />

              <div className="space-y-10">
                {MILESTONES.map((m, i) => (
                  <motion.div
                    key={m.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                    className="relative pl-16 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-16"
                  >
                    {/* Node */}
                    <div
                      className="absolute left-3 lg:left-1/2 top-1.5 w-5 h-5 rounded-full border-2 border-primary bg-white lg:-translate-x-2.5 z-10 flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>

                    {/* Card — alternates side on desktop */}
                    <div className={i % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:col-start-2 lg:pl-16'}>
                      <div className="bg-white border border-border rounded-2xl px-6 py-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-200">
                        <span className="inline-block text-xs font-extrabold tracking-widest gradient-brand-text mb-2">{m.year}</span>
                        <h3 className="text-base font-extrabold text-text-primary mb-1.5">{m.title}</h3>
                        <p className="text-sm text-text-muted leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── VISION ────────────────────────────────────────────── */}
        <section id="vision" className="bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left — text + feature points */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Our Vision</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-5">
                  A world powered by clean, intelligent energy.
                </h2>
                <p className="text-sm text-text-muted leading-relaxed mb-10">
                  We look toward a horizon where reliance on fossil fuels is a relic of the past. In this future, energy is decentralised, intelligent, and resilient.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <LanguageOutlinedIcon className="text-primary" style={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-text-primary mb-1">Pan-India Scale</p>
                      <p className="text-sm text-text-muted leading-relaxed">Deploying platforms that operate at national grid scale, across every state.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <ShieldOutlinedIcon className="text-primary" style={{ fontSize: 20 }} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-text-primary mb-1">Absolute Reliability</p>
                      <p className="text-sm text-text-muted leading-relaxed">Systems engineered for 99.9%+ uptime in mission-critical energy environments.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right — image */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                className="rounded-2xl overflow-hidden aspect-4/3"
              >
                <img
                  src="/images/what-we-build/solar-rooftop.png"
                  alt="Solar rooftop installation"
                  className="w-full h-full object-cover"
                />
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── MISSION ───────────────────────────────────────────── */}
        <section id="mission" className="bg-brand-tint py-20 lg:py-28 scroll-mt-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left — image */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="rounded-2xl overflow-hidden aspect-4/3 order-2 lg:order-1"
              >
                <img
                  src="/images/projects/solar-rajasthan.png"
                  alt="Solar farm in Rajasthan"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Right — text */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
                className="order-1 lg:order-2"
              >
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Our Mission</p>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-6">
                  To make every megawatt perform at its peak — safely, reliably, and profitably.
                </h2>
                <ul className="space-y-4">
                  {MISSION_POINTS.map(({ text }, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircleOutlinedIcon className="text-primary shrink-0 mt-0.5" style={{ fontSize: 18 }} />
                      <span className="text-sm text-text-muted leading-relaxed">{text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── BY THE NUMBERS ────────────────────────────────────── */}
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

        {/* ── LEADERSHIP ────────────────────────────────────────── */}
        <section id="leadership" className="relative bg-white py-20 lg:py-28 scroll-mt-20 overflow-hidden">
          <div className="text-text-muted/30">
            <ArcsPattern />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...fadeUp()} className="mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Leadership</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
                The team behind the platform.
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LEADERSHIP.map((person, i) => (
                <motion.div
                  key={person.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group bg-surface border border-border rounded-2xl p-8 hover:-translate-y-1 hover:border-primary hover:shadow-md transition-all duration-200"
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
            </div>
          </div>
        </section>

        {/* ── PARTNERS & CERTIFICATIONS ─────────────────────────── */}
        <section id="partners" className="bg-surface py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...fadeUp()} className="mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Partners & Certifications</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
                Built with the industry's best.
              </h2>
            </motion.div>

            {/* Partners */}
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Technology Partners</p>
            <div className="flex flex-wrap gap-3 mb-14">
              {PARTNERS.map((p, i) => (
                <motion.span
                  key={p}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="px-5 py-2.5 rounded-xl bg-white border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-colors duration-200 cursor-default"
                >
                  {p}
                </motion.span>
              ))}
            </div>

            {/* Certifications */}
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Certifications & Accreditations</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CERTIFICATIONS.map((cert, i) => (
                <motion.div
                  key={cert.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-white border border-border rounded-2xl px-6 py-5 flex items-start gap-4 hover:border-primary hover:shadow-sm transition-all duration-200"
                >
                  <VerifiedOutlinedIcon className="text-primary shrink-0 mt-0.5" style={{ fontSize: 22 }} />
                  <div>
                    <p className="text-sm font-extrabold text-text-primary mb-0.5">{cert.name}</p>
                    <p className="text-xs text-text-muted">{cert.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

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

        {/* ── PARTNERS & ALLIANCES ──────────────────────────────── */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-white">
          {/* Background overlay image */}
          <img
            src="/data/partners-bg.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none select-none"
          />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div {...fadeUp()} className="mb-12 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Partners & Alliances</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
                Our values are the operating system of our company culture.
              </h2>
              <p className="text-sm text-text-muted mt-4 max-w-xl mx-auto">
                They dictate how we write code, how we treat our clients, and how we approach the monumental challenge of climate change.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {PARTNERS.map((name, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group bg-white rounded-2xl border border-border p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-md transition-all duration-200 aspect-3/2"
                >
                  {/* Logo placeholder */}
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-border/60" />
                  </div>
                  <p className="text-xs font-semibold text-text-muted group-hover:text-primary transition-colors duration-200 text-center">
                    {name}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section id="cta" className="bg-brand-tint py-20 lg:py-28 scroll-mt-20 relative overflow-hidden">
          {/* <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #1AAEE8 0%, transparent 60%, #00D97E 100%)' }}
          /> */}
          <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <motion.div {...fadeUp()}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Next Chapter</p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
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

      </div>
    </>
  )
}
