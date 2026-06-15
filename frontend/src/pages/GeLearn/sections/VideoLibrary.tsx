import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const TOPIC_STYLE: Record<string, string> = {
  'Product Demo':    'bg-sky-50 text-sky-700 border-sky-200',
  'Installation':    'bg-amber-50 text-amber-700 border-amber-200',
  'Live System':     'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Event':           'bg-violet-50 text-violet-700 border-violet-200',
  'Training':        'bg-rose-50 text-rose-700 border-rose-200',
}

const GRADIENT_BG = [
  'from-indigo-500/30 via-blue-400/20 to-slate-400/10',
  'from-amber-500/30 via-orange-400/20 to-yellow-400/10',
  'from-emerald-500/30 via-teal-400/20 to-green-400/10',
  'from-cyan-500/30 via-sky-400/20 to-blue-400/10',
  'from-violet-500/30 via-purple-400/20 to-indigo-400/10',
  'from-rose-500/30 via-pink-400/20 to-red-400/10',
]

const VIDEOS = [
  { id: 1, title: 'SolarLive™ Dashboard — Full Product Walkthrough', topic: 'Product Demo', duration: '14:32', description: 'A complete tour of the SolarLive™ monitoring platform — from site onboarding to live PR tracking, fault alerts, and multi-site portfolio view.' },
  { id: 2, title: 'Data Logger Commissioning — Step-by-Step Installation Guide', topic: 'Installation', duration: '08:45', description: 'How to physically install and commission a Genex Data Logger at a solar site. Covers DIN rail mounting, Modbus wiring, SIM setup, and cloud pairing.' },
  { id: 3, title: 'Live SCADA Demo — 220 kV Substation Control Room View', topic: 'Live System', duration: '11:20', description: 'A live screen recording from an operational substation SCADA deployment. IEC 61850 real-time data, alarm management, and remote switching in action.' },
  { id: 4, title: 'Genex at India Smart Grid Week 2025 — Panel and Demo Highlights', topic: 'Event', duration: '22:10', description: 'Highlights from the Genex booth and panel session at ISGW 2025. Includes demo footage of Advanced SCADA and EMS-BESS at the innovation showcase.' },
  { id: 5, title: 'EV Charging Network Management — Operator Training Module 1', topic: 'Training', duration: '18:05', description: 'First module of the EV Software Management operator training series. Covers charger onboarding, session management, and alert configuration.' },
  { id: 6, title: 'PM Kusum RMS — Government Compliance Reporting Workflow', topic: 'Product Demo', duration: '09:50', description: 'How the Genex RMS platform generates PM Kusum compliance reports automatically. Covers report templates, state-specific formats, and bulk export.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function VideoLibrary() {
  return (
    <main>
      <PageMeta
        title="Video Library — Genex GeLearn"
        description="Product walkthroughs, deployment case studies, and technical explanations — video content from the Genex Technocrats engineering team."
        canonical="/gelearn/videos"
      />
      <PageHero
        label="Video Library"
        headline="See It In Action"
        subline="Product walkthroughs, installation guides, live system demos, and event coverage from the Genex team."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Video Library</span>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VIDEOS.map((video, i) => (
              <motion.div key={video.id} {...fadeUp(i * 0.07)}>
                <div className="group bg-white border border-border rounded-2xl overflow-hidden hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className={`relative h-44 bg-linear-to-br ${GRADIENT_BG[i % GRADIENT_BG.length]} flex items-center justify-center`}>
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <PlayCircleOutlinedIcon style={{ fontSize: 32, color: 'white' }} />
                    </div>
                    <span className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <AccessTimeOutlinedIcon style={{ fontSize: 12 }} />{video.duration}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border mb-3 ${TOPIC_STYLE[video.topic]}`}>
                      {video.topic}
                    </span>
                    <h3 className="text-sm font-extrabold text-text-primary leading-snug mb-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed flex-1">{video.description}</p>
                    <Link to="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Watch <ArrowForwardIcon style={{ fontSize: 14 }} />
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Have content to contribute?</p>
            <h2 className="text-xl font-extrabold text-text-primary">Want a live demo instead?</h2>
            <p className="mt-1 text-sm text-text-muted">Book a personalised session with our engineering team.</p>
          </div>
          <Link to="/contact#demo" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Request a Demo <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
