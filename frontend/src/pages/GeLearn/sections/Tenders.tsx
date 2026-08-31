import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ─────────────────────────────────────────────────────────────────────

const STATUSES = ['All', 'Open', 'Upcoming', 'Closed'] as const
type Status = typeof STATUSES[number]

interface Tender {
  id: number
  title: string
  authority: string
  deadline: string
  value: string
  status: Status
  sector: string
  description: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Open:     { bg: '#e9ffe8', text: '#2c8502' },
  Upcoming: { bg: '#ffffe8', text: '#858302' },
  Closed:   { bg: '#ffe8e8', text: '#8b0000' },
}

const TENDERS: Tender[] = [
  {
    id: 1,
    title: 'Supply & Commissioning of SCADA System for 220/66 kV Substation',
    authority: 'State Power Transmission Corp., Uttar Pradesh',
    deadline: '30 / 06 / 2026',
    value: '₹1.2 Cr – ₹2.5 Cr',
    status: 'Open',
    sector: 'Grid & SCADA',
    description: 'RFP for SCADA, RTU, and communication system for a new 220/66 kV substation. IEC 61850 compliance mandatory. Contact Genex for pre-bid consultation and documentation support.',
  },
  {
    id: 2,
    title: 'Remote Monitoring System for PM Kusum Component-A Solar Plants',
    authority: 'RRECL — Rajasthan Renewable Energy Corp.',
    deadline: '15 / 07 / 2026',
    value: '₹80 L – ₹1.5 Cr',
    status: 'Open',
    sector: 'Solar',
    description: 'RMS platform for 500+ PM Kusum Component-A solar pumping installations across Rajasthan. Must support PM Kusum reporting format and 4G/NB-IoT connectivity.',
  },
  {
    id: 3,
    title: 'EV Charging Management Software for State Transport Fleet',
    authority: 'Maharashtra State Road Transport Corp.',
    deadline: '20 / 08 / 2026',
    value: '₹50 L – ₹90 L',
    status: 'Upcoming',
    sector: 'EV Software',
    description: 'Software-only tender for OCPP-compliant EV fleet charging management platform. 200+ charge points across 6 depots. Pre-qualification round opens July 1.',
  },
  {
    id: 4,
    title: 'Energy Management System for 50 MWh Battery Storage Plant',
    authority: 'Gujarat Urja Vikas Nigam Ltd.',
    deadline: '12 / 03 / 2026',
    value: '₹1.8 Cr – ₹3 Cr',
    status: 'Closed',
    sector: 'BESS',
    description: 'EMS-BESS platform for grid-tied battery storage project. IEC 61850 grid interface and OPC-UA integration required. This tender has closed — contact us for future similar opportunities.',
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

// ── TenderCard ────────────────────────────────────────────────────────────────

function TenderCard({ tender, index }: { tender: Tender; index: number }) {
  const st = STATUS_STYLE[tender.status]
  const isClosed = tender.status === 'Closed'

  return (
    <motion.div
      custom={index * 0.09}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className={`relative bg-white border border-[#ececec] rounded-2xl overflow-hidden shadow-[0px_10px_15px_-3px_rgba(226,232,240,0.4),0px_4px_6px_-4px_rgba(226,232,240,0.4)] flex flex-col transition-shadow duration-300 ${isClosed ? 'opacity-70' : 'hover:shadow-[0px_16px_32px_rgba(26,174,232,0.1)]'}`}
    >
      {/* Top badges — absolute over the card */}
      <div className="absolute left-8 top-4 flex items-center gap-2 z-10">
        <span
          className="px-3 py-1.5 rounded text-sm font-medium"
          style={{ background: st.bg, color: st.text }}
        >
          {tender.status}
        </span>
        <span className="bg-[#f7f7f7] text-[#3f3f3f] text-sm font-medium px-3 py-1.5 rounded flex items-center gap-1.5">
          <BusinessOutlinedIcon style={{ fontSize: 13 }} />
          {tender.sector}
        </span>
      </div>

      {/* Card body */}
      <div className="pt-16 px-8 pb-8 flex flex-col flex-1 gap-5">
        {/* Issuer */}
        <div className="flex items-center gap-2 text-sm text-[#62748e]">
          <BusinessOutlinedIcon style={{ fontSize: 15 }} />
          <span>{tender.authority}</span>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-[#62748e]">
          <CalendarTodayOutlinedIcon style={{ fontSize: 15 }} />
          <span>Deadline : {tender.deadline}</span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-[#0f172b] leading-8 capitalize">
          {tender.title}
        </h3>

        {/* Description */}
        <p className="text-[15px] text-[#45556c] leading-[1.52] flex-1">
          {tender.description}
        </p>

        {/* Budget */}
        <p className="text-base font-semibold text-[#0f172b]">{tender.value}</p>

        {/* Enquire button */}
        {!isClosed ? (
          <Link
            to="/contact"
            className="self-start flex items-center gap-2 text-base font-semibold text-primary hover:underline transition-colors pt-2"
          >
            Enquire <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        ) : (
          <span className="self-start flex items-center gap-2 text-base font-semibold text-[#9ca3af] pt-2 cursor-not-allowed">
            Closed
          </span>
        )}
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Tenders() {
  const [active, setActive] = useState<Status>('All')
  const filtered = active === 'All' ? TENDERS : TENDERS.filter(t => t.status === active)

  return (
    <main>
      <PageMeta
        title="Tenders & Opportunities — Genex GeLearn"
        description="Active tenders and partnership opportunities in solar monitoring, SCADA, and energy management from Genex Technocrats."
        canonical="/gelearn/tenders"
      />
      <PageHero
        label="Tenders & Opportunities"
        headline="Active & Upcoming Opportunities"
        subline="Tenders, RFPs, and partnership opportunities in the energy and automation sector where Genex platforms are relevant."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Section heading */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' as const }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-10"
          >
            <h2 className="text-4xl font-bold text-black capitalize leading-tight max-w-lg">
              Our Insights On Trends,<br />Technologies, And<br />Transformation
            </h2>
            <p className="text-base text-[#949494] max-w-xs lg:text-right leading-6">
              Bring to the table win-win survival strategies to ensure proactive domination at the end of the day.
            </p>
          </motion.div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={[
                  'px-5 py-2 rounded-full text-sm font-bold transition-all duration-200',
                  active === s
                    ? 'gradient-brand text-white shadow-sm'
                    : 'bg-[#f7f7f7] text-[#3f3f3f] hover:bg-primary/10 hover:text-primary',
                ].join(' ')}
              >
                {s}
              </button>
            ))}
          </div>

          {/* 2-column grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {filtered.map((tender, i) => (
              <TenderCard key={tender.id} tender={tender} index={i} />
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
                Need pre-bid consultation or technical documentation support for a tender response? Our engineering team is ready.
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
