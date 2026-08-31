import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Whitepaper {
  id: number
  title: string
  category: string
  categoryBg: string
  categoryText: string
  date: string
  pages: string
  description: string
}

const DOCS: Whitepaper[] = [
  {
    id: 1,
    title: 'IEC 61850 Implementation Guide for Indian Substations',
    category: 'Grid Technology',
    categoryBg: '#eef2ff',
    categoryText: '#432dd7',
    date: 'MAR 14 2026',
    pages: '38 pages',
    description: 'A practical guide to deploying IEC 61850 in the Indian substation context — covering SCL file management, GOOSE configuration, and interoperability testing with common relay vendors.',
  },
  {
    id: 2,
    title: 'Solar PR Degradation: Benchmarks from 300+ Indian Sites',
    category: 'Solar',
    categoryBg: '#fffbeb',
    categoryText: '#b45309',
    date: 'JAN 28 2026',
    pages: '24 pages',
    description: 'Analysis of PR and CUF degradation trends across 300+ SolarLive™-monitored sites over 5 years. Includes regional breakdowns, inverter-type comparisons, and O&M impact data.',
  },
  {
    id: 3,
    title: 'BESS Dispatch Optimisation for Indian Grid Conditions',
    category: 'Energy Storage',
    categoryBg: '#f5f3ff',
    categoryText: '#6d28d9',
    date: 'DEC 10 2025',
    pages: '31 pages',
    description: 'How battery dispatch algorithms must adapt to Indian grid conditions — frequency deviations, ToD tariff structures, and ancillary service opportunities under IEGC regulations.',
  },
  {
    id: 4,
    title: 'Cybersecurity for ICS: A Framework for Energy Operators',
    category: 'Regulation',
    categoryBg: '#fdf2f8',
    categoryText: '#9d174d',
    date: 'NOV 02 2025',
    pages: '42 pages',
    description: 'An actionable cybersecurity framework for SCADA and EMS operators aligned with IEC 62443 and CERT-In guidance for critical infrastructure in the Indian energy sector.',
  },
  {
    id: 5,
    title: 'PM Kusum Phase II: Technical Monitoring & Compliance',
    category: 'Solar',
    categoryBg: '#fffbeb',
    categoryText: '#b45309',
    date: 'SEP 18 2025',
    pages: '28 pages',
    description: 'Technical requirements and monitoring architecture for PM Kusum Phase II deployments — GSM data loggers, state portal integration, and compliance report generation workflows.',
  },
  {
    id: 6,
    title: 'EV Fleet Charging Infrastructure: Planning & Specification',
    category: 'EV',
    categoryBg: '#ecfdf5',
    categoryText: '#047857',
    date: 'AUG 07 2025',
    pages: '35 pages',
    description: 'A technical planning guide for depot-scale EV charging — charger sizing, load balancing algorithms, OCPP integration, and smart scheduling for municipal and commercial fleets.',
  },
]

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: d, ease: 'easeOut' as const },
  }),
}

// ── WhitepaperCard ────────────────────────────────────────────────────────────

function WhitepaperCard({ doc, index }: { doc: Whitepaper; index: number }) {
  return (
    <motion.div
      custom={index * 0.08}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e9e9e9] rounded-3xl p-8 flex flex-col shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] group hover:border-primary/30 hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)] transition-shadow duration-300"
    >
      {/* Category + date */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{ background: doc.categoryBg, color: doc.categoryText }}
        >
          {doc.category}
        </span>
        <span className="text-xs font-medium text-[#62748e]">{doc.date}</span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-black leading-7 mb-4 flex-1">
        {doc.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#62748e] leading-5 mb-8">
        {doc.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <Link
          to="/contact"
          className="flex items-center gap-2 bg-[#f7f7f7] hover:bg-primary/10 text-[#6a6a6a] hover:text-primary text-sm font-bold px-4 py-2 rounded-full transition-colors duration-200"
        >
          <DownloadOutlinedIcon style={{ fontSize: 15 }} />
          Download
        </Link>
        <span className="text-xs font-medium text-[#62748e]">{doc.pages}</span>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Whitepapers() {
  return (
    <main>
      <PageMeta
        title="Whitepapers & Reports — Genex GeLearn"
        description="In-depth technical whitepapers on energy monitoring, grid reliability, and software architecture from Genex Technocrats."
        canonical="/gelearn/whitepapers"
      />
      <PageHero
        label="Whitepapers & Reports"
        headline="Research You Can Act On"
        subline="Published technical research, regulatory analysis, and sector intelligence from the Genex engineering team."
      />

<section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Section heading */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' as const }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14"
          >
            <h2 className="text-4xl font-bold text-black capitalize leading-tight max-w-lg">
              Our Insights On Trends,<br />Technologies, And<br />Transformation
            </h2>
            <p className="text-base text-[#949494] max-w-xs lg:text-right leading-6">
              Bring to the table win-win survival strategies to ensure proactive domination at the end of the day.
            </p>
          </motion.div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOCS.map((doc, i) => (
              <WhitepaperCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
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
                Our AI-monitored solar grids distribute power intelligently — book a personalised demo with our engineering team.
              </p>
            </div>
            <Link
              to="/contact#demo"
              className="shrink-0 bg-[#18afdf] text-white text-base font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
            >
              Request a Demo
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
