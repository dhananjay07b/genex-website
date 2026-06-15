import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const SECTORS = ['All', 'Solar', 'Grid & SCADA', 'EV', 'Energy Storage'] as const
type Sector = typeof SECTORS[number]

const SECTOR_COLOR: Record<string, string> = {
  Solar:           'bg-amber-50 text-amber-700 border-amber-200',
  'Grid & SCADA':  'bg-indigo-50 text-indigo-700 border-indigo-200',
  EV:              'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Energy Storage':'bg-sky-50 text-sky-700 border-sky-200',
}

const SECTOR_BAR: Record<string, string> = {
  Solar:           'bg-amber-400',
  'Grid & SCADA':  'bg-indigo-500',
  EV:              'bg-emerald-500',
  'Energy Storage':'bg-sky-500',
}

const CASE_STUDIES = [
  {
    id: 1,
    title: 'SolarLive™ Deployment — 200 MW Rooftop Portfolio',
    sector: 'Solar' as Sector,
    state: 'Rajasthan',
    capacity: '200 MW',
    metric: '↓ 34%',
    metricLabel: 'O&M Response Time',
    outcome: 'Centralised monitoring of 400+ rooftop sites eliminated manual site visits for routine diagnostics. Fault detection time dropped from 4 hours to under 20 minutes with automated alerts.',
    tags: ['SolarLive™', 'Modbus TCP', 'Cloud Sync', '4G LTE'],
  },
  {
    id: 2,
    title: 'SCADA Upgrade — 220 kV Substation Modernisation',
    sector: 'Grid & SCADA' as Sector,
    state: 'Uttar Pradesh',
    capacity: '220 kV',
    metric: '<1s',
    metricLabel: 'Data Acquisition Cycle',
    outcome: 'Legacy SCADA replaced with Genex Advanced SCADA across 3 substations. IEC 61850 integration with existing protection relays reduced engineering time by 60% versus proprietary alternatives.',
    tags: ['Advanced SCADA', 'IEC 61850', 'DNP3', 'Hot Standby'],
  },
  {
    id: 3,
    title: 'EV Fleet Charging Network — 150-Charger Enterprise Campus',
    sector: 'EV' as Sector,
    state: 'Maharashtra',
    capacity: '150 Chargers',
    metric: '99.2%',
    metricLabel: 'Charger Uptime',
    outcome: 'Full OCPP-compliant charging infrastructure deployed across 3 campuses in 6 weeks. Demand management cut peak energy draw by 28% while maintaining full fleet availability.',
    tags: ['EV Software', 'OCPP 2.0.1', 'Load Balancing', 'RFID Auth'],
  },
  {
    id: 4,
    title: 'EMS-BESS Integration — 50 MWh Grid-Tied Storage',
    sector: 'Energy Storage' as Sector,
    state: 'Gujarat',
    capacity: '50 MWh',
    metric: '↓ 30%',
    metricLabel: 'Peak Demand Charges',
    outcome: 'Genex EMS-BESS platform deployed for a utility-scale BESS project. Revenue dispatch optimisation reduced peak demand charges by 30% in first operational quarter.',
    tags: ['EMS-BESS', 'IEC 61850', 'OPC-UA', 'Dispatch Optimisation'],
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function CaseStudies() {
  const [active, setActive] = useState<Sector>('All')
  const filtered = active === 'All' ? CASE_STUDIES : CASE_STUDIES.filter(c => c.sector === active)

  return (
    <main>
      <PageMeta
        title="Case Studies — Genex GeLearn"
        description="Real-world deployments: how Genex platforms have performed across solar, BESS, wind, and grid projects across India."
        canonical="/gelearn/case-studies"
      />
      <PageHero
        label="Case Studies"
        headline="Projects That Prove the Point"
        subline="Real deployments, verified outcomes, and the engineering decisions that made them work."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Case Studies</span>
        </div>
      </div>

      {/* Filter */}
      <section className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4">
            {SECTORS.map(s => (
              <button
                key={s}
                onClick={() => setActive(s)}
                className={['shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                  active === s ? 'gradient-brand text-white shadow-sm' : 'text-text-muted border border-border hover:text-primary hover:border-primary hover:bg-surface',
                ].join(' ')}
              >{s}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.map((cs, i) => (
              <motion.div key={cs.id} {...fadeUp(i * 0.08)}>
                <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <div className={`h-1.5 w-full ${SECTOR_BAR[cs.sector]}`} />
                  <div className="p-7">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${SECTOR_COLOR[cs.sector]}`}>
                        {cs.sector}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-text-muted shrink-0">
                        <span className="flex items-center gap-1"><LocationOnOutlinedIcon style={{ fontSize: 13 }} />{cs.state}</span>
                        <span className="flex items-center gap-1"><BoltOutlinedIcon style={{ fontSize: 13 }} />{cs.capacity}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-extrabold text-text-primary leading-snug mb-3">{cs.title}</h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-extrabold text-primary">{cs.metric}</span>
                      <span className="text-xs font-semibold uppercase tracking-widest text-text-muted">{cs.metricLabel}</span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed mb-5">{cs.outcome}</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {cs.tags.map(t => (
                        <span key={t} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-primary">{t}</span>
                      ))}
                    </div>
                    <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                      Discuss a Similar Project <ArrowForwardIcon style={{ fontSize: 15 }} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Your Project</p>
            <h2 className="text-xl font-extrabold text-text-primary">Have content to contribute?</h2>
            <p className="mt-1 text-sm text-text-muted">We publish verified case studies with client permission.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
