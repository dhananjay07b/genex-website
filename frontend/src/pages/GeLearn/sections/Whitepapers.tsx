import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const TOPIC_STYLE: Record<string, string> = {
  'Grid Technology':   'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Solar':             'bg-amber-50 text-amber-700 border-amber-200',
  'Energy Storage':    'bg-sky-50 text-sky-700 border-sky-200',
  'Regulation':        'bg-violet-50 text-violet-700 border-violet-200',
}

const DOCS = [
  {
    id: 1,
    title: 'IEC 61850 Implementation Guide for Indian Substations',
    topic: 'Grid Technology',
    pages: '38 pages',
    year: '2025',
    description: 'A practical guide to deploying IEC 61850 in the Indian substation context — covering SCL file management, GOOSE configuration, and interoperability testing with common relay vendors.',
    tags: ['IEC 61850', 'SCADA', 'Substations', 'Grid'],
  },
  {
    id: 2,
    title: 'Solar Performance Ratio Degradation: Benchmarks from 300+ Indian Sites',
    topic: 'Solar',
    pages: '24 pages',
    year: '2025',
    description: 'Analysis of PR and CUF degradation trends across 300+ SolarLive™-monitored sites over 5 years. Includes regional breakdowns, inverter-type comparisons, and O&M impact data.',
    tags: ['Solar Analytics', 'Performance Ratio', 'O&M', 'Data'],
  },
  {
    id: 3,
    title: 'BESS Dispatch Optimisation Strategies for Indian Grid Conditions',
    topic: 'Energy Storage',
    pages: '31 pages',
    year: '2026',
    description: 'How battery dispatch algorithms need to adapt to India\'s grid conditions — frequency deviations, ToD tariff structures, and ancillary service opportunities under IEGC regulations.',
    tags: ['BESS', 'EMS', 'Grid', 'ToD Tariffs'],
  },
  {
    id: 4,
    title: 'Cybersecurity for Industrial Control Systems: A Practical Framework for Energy Operators',
    topic: 'Regulation',
    pages: '42 pages',
    year: '2026',
    description: 'An actionable cybersecurity framework for SCADA and EMS operators aligned with IEC 62443 and CERT-In guidance for critical infrastructure in the Indian energy sector.',
    tags: ['Cybersecurity', 'IEC 62443', 'SCADA', 'Compliance'],
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

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

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Whitepapers & Reports</span>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6">
            {DOCS.map((doc, i) => (
              <motion.div key={doc.id} {...fadeUp(i * 0.08)}>
                <div className="bg-white border border-border rounded-2xl p-7 flex flex-col h-full hover:border-primary hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-5 mb-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface border border-border">
                      <ArticleOutlinedIcon className="text-primary" style={{ fontSize: 24 }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${TOPIC_STYLE[doc.topic]}`}>
                          {doc.topic}
                        </span>
                        <span className="text-xs text-text-muted">{doc.pages} · {doc.year}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-text-primary leading-snug">{doc.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-text-muted leading-relaxed mb-5 flex-1">{doc.description}</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {doc.tags.map(t => (
                      <span key={t} className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-medium text-text-primary">{t}</span>
                    ))}
                  </div>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadOutlinedIcon style={{ fontSize: 16 }} /> Download PDF
                  </a>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Contribute</p>
            <h2 className="text-xl font-extrabold text-text-primary">Have research to publish or co-author?</h2>
            <p className="mt-1 text-sm text-text-muted">We collaborate with engineers, researchers, and institutions across the energy sector.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
