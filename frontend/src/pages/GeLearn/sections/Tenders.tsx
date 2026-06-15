import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const STATUSES = ['All', 'Open', 'Upcoming', 'Closed'] as const
type Status = typeof STATUSES[number]

const STATUS_STYLE: Record<string, string> = {
  Open:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  Upcoming: 'bg-amber-50 text-amber-700 border-amber-200',
  Closed:   'bg-slate-100 text-slate-500 border-slate-200',
}

const TENDERS = [
  {
    id: 1,
    title: 'Supply and Commissioning of SCADA System for 220/66 kV Substation',
    authority: 'State Power Transmission Corp., Uttar Pradesh',
    deadline: '30 June 2026',
    value: '₹1.2 Cr – ₹2.5 Cr',
    status: 'Open' as Status,
    sector: 'Grid & SCADA',
    description: 'RFP for SCADA, RTU, and communication system for a new 220/66 kV substation. IEC 61850 compliance mandatory. Contact Genex for pre-bid consultation.',
  },
  {
    id: 2,
    title: 'Remote Monitoring System for PM Kusum Component-A Solar Plants',
    authority: 'RRECL — Rajasthan Renewable Energy Corp.',
    deadline: '15 July 2026',
    value: '₹80 L – ₹1.5 Cr',
    status: 'Open' as Status,
    sector: 'Solar',
    description: 'RMS platform for 500+ PM Kusum Component-A solar pumping installations across Rajasthan. Must support PM Kusum reporting format and 4G/NB-IoT connectivity.',
  },
  {
    id: 3,
    title: 'EV Charging Management Software for State Transport Fleet',
    authority: 'Maharashtra State Road Transport Corp.',
    deadline: '20 August 2026',
    value: '₹50 L – ₹90 L',
    status: 'Upcoming' as Status,
    sector: 'EV',
    description: 'Software-only tender for OCPP-compliant EV fleet charging management platform. 200+ charge points across 6 depots. Pre-qualification round open from July 1.',
  },
  {
    id: 4,
    title: 'Energy Management System for 50 MWh Battery Storage Plant',
    authority: 'Gujarat Urja Vikas Nigam Ltd.',
    deadline: '12 March 2026',
    value: '₹1.8 Cr – ₹3 Cr',
    status: 'Closed' as Status,
    sector: 'Energy Storage',
    description: 'EMS-BESS platform for grid-tied BESS project. IEC 61850 grid interface and OPC-UA integration required. This tender has closed — contact us for future similar opportunities.',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Tenders & Opportunities</span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setActive(s)}
                className={['shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                  active === s ? 'gradient-brand text-white shadow-sm' : 'text-text-muted border border-border hover:text-primary hover:border-primary hover:bg-surface',
                ].join(' ')}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-4">
          {filtered.map((tender, i) => (
            <motion.div key={tender.id} {...fadeUp(i * 0.08)}>
              <div className={`bg-white border rounded-2xl p-7 hover:shadow-md transition-all duration-200 ${tender.status === 'Closed' ? 'opacity-60 border-border' : 'border-border hover:border-primary'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${STATUS_STYLE[tender.status]}`}>
                      {tender.status}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted border border-border rounded-full px-2.5 py-0.5">
                      {tender.sector}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-text-primary">{tender.value}</span>
                </div>

                <h3 className="text-base lg:text-lg font-extrabold text-text-primary leading-snug mb-3">{tender.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed mb-4">{tender.description}</p>

                <div className="flex flex-wrap items-center gap-5 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5"><BusinessOutlinedIcon style={{ fontSize: 14 }} />{tender.authority}</span>
                  <span className="flex items-center gap-1.5"><CalendarTodayOutlinedIcon style={{ fontSize: 14 }} />Deadline: {tender.deadline}</span>
                  {tender.status !== 'Closed' && (
                    <Link to="/contact" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      Enquire <ArrowForwardIcon style={{ fontSize: 14 }} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Pre-Bid Support</p>
            <h2 className="text-xl font-extrabold text-text-primary">Need technical support for a tender response?</h2>
            <p className="mt-1 text-sm text-text-muted">We provide pre-bid consultations and technical documentation for qualifying tenders.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
