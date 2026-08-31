import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Step {
  num: string
  title: string
  desc: string
  badgeColor: string
  dotColor: string
  connectorColor: string
  cardBorder: string
  image: string
  side: 'right' | 'left' // which side the CARD is on
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We analyse your site topology, hardware constraints, and protocol environment. Every project starts with a structured technical discovery — before any line of code is written.',
    badgeColor: '#1c398e',
    dotColor: '#155dfc',
    connectorColor: '#bedbff',
    cardBorder: '#eff6ff',
    image: '/images/how-we-work/how-1.jpg',
    side: 'right',
  },
  {
    num: '02',
    title: 'Architecture',
    desc: 'We design the data pipeline, protocol translation layer, and platform topology — edge, cloud, or hybrid. No ambiguity is left before development begins.',
    badgeColor: '#2ccefb',
    dotColor: '#2ccefb',
    connectorColor: '#b0eeff',
    cardBorder: '#b0eeff',
    image: '/images/how-we-work/how-2.jpg',
    side: 'left',
  },
  {
    num: '03',
    title: 'Development',
    desc: 'Our engineers build your SCADA platform, data loggers, dashboards, and integration adapters — iterating in short cycles with full client visibility throughout.',
    badgeColor: '#00bba7',
    dotColor: '#00bba7',
    connectorColor: '#78ede1',
    cardBorder: '#eff6ff',
    image: '/images/how-we-work/how-3.jpg',
    side: 'right',
  },
  {
    num: '04',
    title: 'Integration',
    desc: 'We connect your field hardware, RTUs, inverters, and legacy systems. Protocol bridges, OPC-UA servers, and API layers are built and validated against live field data.',
    badgeColor: '#1c398e',
    dotColor: '#1c398e',
    connectorColor: '#6686e6',
    cardBorder: '#b0eeff',
    image: '/images/how-we-work/how-2.jpg',
    side: 'left',
  },
  {
    num: '05',
    title: 'Deployment',
    desc: 'Go-live is a controlled cutover — not a handover. We commission on-site, validate every data point in production, and confirm SLA performance before we step back.',
    badgeColor: '#2ccefb',
    dotColor: '#2ccefb',
    connectorColor: '#b0eeff',
    cardBorder: '#eff6ff',
    image: '/images/how-we-work/how-3.jpg',
    side: 'right',
  },
  {
    num: '06',
    title: 'Support & Scale',
    desc: 'Ongoing firmware updates, dashboard enhancements, and 24×7 escalation paths are established from day one. We stay engaged as your asset base grows.',
    badgeColor: '#00bba7',
    dotColor: '#00bba7',
    connectorColor: '#78ede1',
    cardBorder: '#b0eeff',
    image: '/images/how-we-work/how-2.jpg',
    side: 'left',
  },
]

const PRINCIPLES = [
  {
    title: 'Protocol-Agnostic by Design',
    desc: 'We never lock clients to proprietary hardware. Every platform we build speaks Modbus, IEC 61850, DNP3, OPC-UA, MQTT, and REST — simultaneously where required.',
  },
  {
    title: 'Edge-First Connectivity',
    desc: 'Remote sites cannot rely on constant cloud connectivity. Our edge nodes buffer, process, and sync — so data loss from connectivity gaps is never a risk.',
  },
  {
    title: 'Real-Time Over Periodic',
    desc: 'Periodic reports miss critical events. We build for sub-second telemetry — fault detection, overcurrent alerts, SOC exceedance — so action happens before losses compound.',
  },
  {
    title: 'Security Without Compromise',
    desc: 'Role-based access, encrypted tunnels, certificate-based device authentication, and full audit logging are built in from day one — not added as afterthoughts.',
  },
]

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d, ease: 'easeOut' as const } }),
}

const slideFrom = (x: number) => ({
  hidden: { opacity: 0, x },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
})

// ── StepRow ───────────────────────────────────────────────────────────────────

function StepRow({ step, index }: { step: Step; index: number }) {
  const isRight = step.side === 'right' // card on right side
  const cardSlide = slideFrom(isRight ? 60 : -60)
  const imgSlide  = slideFrom(isRight ? -60 : 60)

  const image = (
    <motion.div
      variants={imgSlide}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' as const }}
      className="aspect-4/3 h-48 rounded-3xl overflow-hidden bg-[#f3f4f6] shadow-sm"
    >
      <motion.img
        src={step.image}
        alt={step.title}
        className="w-full h-full object-cover"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.div>
  )

  const card = (
    <motion.div
      variants={cardSlide}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' as const }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="relative rounded-3xl p-8 shadow-[0px_10px_15px_-3px_rgba(28,57,142,0.05),0px_4px_6px_-4px_rgba(28,57,142,0.05)] bg-white w-full"
      style={{ border: `1px solid ${step.cardBorder}` }}
    >
      {/* Number badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2, type: 'spring', bounce: 0.4 }}
        className={`absolute top-8 size-12 rounded-full flex items-center justify-center text-white text-lg font-bold z-10 ${
          isRight ? '-left-6' : '-right-6'
        }`}
        style={{ background: step.badgeColor }}
      >
        {step.num}
      </motion.div>

      <div className={isRight ? 'pl-8' : 'pr-8 text-right'}>
        <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
        <p className="text-sm text-[#949494] leading-6">{step.desc}</p>
      </div>
    </motion.div>
  )

  return (
    <div className="hidden lg:flex items-center w-full gap-0">
      {/* Left side */}
      <div className="flex-1 flex items-center justify-end pr-12">
        {isRight ? image : card}
      </div>

      {/* Center: dot + connector */}
      <div className="relative z-10 flex-none flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1, type: 'spring', bounce: 0.5 }}
          className="size-4 rounded-full bg-white border-4 relative"
          style={{ borderColor: step.dotColor }}
        >
          {/* Connector line to card side */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px w-12"
            style={{
              background: step.connectorColor,
              left: isRight ? '100%' : 'auto',
              right: isRight ? 'auto' : '100%',
            }}
          />
        </motion.div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex items-center pl-12">
        {isRight ? card : image}
      </div>
    </div>
  )
}

// ── Mobile StepRow ────────────────────────────────────────────────────────────

function MobileStep({ step }: { step: Step }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      className="flex gap-5"
    >
      {/* Left: number + vertical line */}
      <div className="flex flex-col items-center">
        <div
          className="size-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: step.badgeColor }}
        >
          {step.num}
        </div>
        <div className="flex-1 w-0.5 mt-3" style={{ background: step.connectorColor }} />
      </div>
      {/* Right: content */}
      <div className="pb-10 flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden aspect-video mb-4">
          <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
        </div>
        <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
        <p className="text-sm text-[#949494] leading-6">{step.desc}</p>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function HowWeWork() {
  return (
    <main>
      <PageMeta
        title="How We Work — Genex Technocrats"
        description="Six stages from site survey to long-term support — and the engineering principles that guide every Genex project."
        canonical="/gelearn/how-we-work"
      />
      <PageHero
        label="How We Work"
        headline="Engineering Delivered. Not Just Quoted."
        subline="Six stages from site survey to long-term support — and the principles that see every project through."
      />

      {/* ── PREPARING FOR YOUR SUCCESS ───────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Section heading */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' as const }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-4">Preparing For Your Success</h2>
            <p className="text-sm text-[#949494] max-w-lg mx-auto leading-6">
              Every Genex engagement follows a repeatable, transparent process — from the first discovery call to the final SLA handover.
            </p>
          </motion.div>

          {/* Desktop timeline */}
          <div className="relative hidden lg:block">
            {/* Vertical dashed line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{ originY: 0 }}
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px border-l-2 border-dashed border-[#bedbff]"
            />

            {/* Steps */}
            <div className="flex flex-col gap-24">
              {STEPS.map((step, i) => (
                <StepRow key={i} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="lg:hidden">
            {STEPS.map((step, i) => (
              <MobileStep key={i} step={step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ENGINEERING PRINCIPLES ───────────────────────────────────────── */}
      <section className="bg-white border-t border-[#e5e7eb] py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' as const }}
            className="mb-10"
          >
            <h2 className="text-4xl font-bold text-[#111827] mb-4">Engineering Principles</h2>
            <p className="text-base text-[#6b7280] max-w-2xl leading-6">
              We combine open protocol standards with smart monitoring tools to ensure long-term reliability and transparency across every deployment.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PRINCIPLES.map((p, i) => (
              <motion.div
                key={i}
                custom={i * 0.08}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' as const }}
                whileHover={{ y: -5, borderColor: '#1AAEE8', transition: { duration: 0.2, ease: 'easeOut' } }}
                className="bg-white/50 border border-[#e5e7eb] rounded-3xl p-8 cursor-default transition-shadow hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)]"
              >
                <h3 className="text-xl font-bold text-[#111827] mb-3">{p.title}</h3>
                <p className="text-sm text-[#6b7280] leading-6">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="bg-[#f0f9ff] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' as const }}
            className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-[#0f2930] leading-snug mb-2">
                Start Now.<br />Get Started For Free
              </h2>
              <p className="text-sm text-[#6b7280] max-w-md leading-6">
                Book a discovery call with our engineering team — no sales pitch, just an honest conversation about your project.
              </p>
            </div>
            <Link
              to="/contact#demo"
              className="shrink-0 gradient-brand text-white text-base font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Request a Demo <ArrowForwardIcon style={{ fontSize: 18 }} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
