import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import MicOutlinedIcon from '@mui/icons-material/MicOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

const TOPIC_STYLE: Record<string, string> = {
  'Grid & SCADA':     'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Solar':            'bg-amber-50 text-amber-700 border-amber-200',
  'Energy Policy':    'bg-violet-50 text-violet-700 border-violet-200',
  'EV':               'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const EPISODES = [
  {
    id: 1,
    episode: 'EP 01',
    title: 'The State of SCADA in India — Where Are We and Where Are We Going?',
    guest: 'Rajesh Kumar',
    role: 'Head of Grid Automation, State Transmission Utility',
    topic: 'Grid & SCADA',
    duration: '48 min',
    description: 'A frank conversation about the state of SCADA adoption at Indian utilities — the gap between aspiration and ground reality, and what it will take to close it.',
  },
  {
    id: 2,
    title: 'Solar O&M at Scale: Lessons from 500 MW Under Management',
    episode: 'EP 02',
    guest: 'Priya Menon',
    role: 'O&M Director, Renewable Energy Developer',
    topic: 'Solar',
    duration: '41 min',
    description: 'What changes when you go from managing 10 solar sites to 300? Data quality, team structure, alarm fatigue, and the tools that actually help.',
  },
  {
    id: 3,
    title: "India's Energy Storage Policy in 2026: What Operators Need to Know",
    episode: 'EP 03',
    guest: 'Amit Sharma',
    role: 'Energy Policy Analyst, Independent Consultant',
    topic: 'Energy Policy',
    duration: '55 min',
    description: 'The BESS policy landscape has shifted significantly in the past two years. We break down what the changes mean for project developers, utilities, and software vendors.',
  },
  {
    id: 4,
    title: 'Fleet Electrification: The Infrastructure Reality Behind the Headlines',
    episode: 'EP 04',
    guest: 'Deepa Nair',
    role: 'Fleet Electrification Lead, State Road Transport Corp.',
    topic: 'EV',
    duration: '37 min',
    description: 'Fleet operators are moving faster than the charging infrastructure ecosystem. An honest conversation about what\'s working, what isn\'t, and what software needs to do better.',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function Podcasts() {
  return (
    <main>
      <PageMeta
        title="Podcasts & Interviews — Genex GeLearn"
        description="Conversations on India's energy transition, renewable infrastructure, and technology from the Genex Technocrats team."
        canonical="/gelearn/podcasts"
      />
      <PageHero
        label="Podcasts & Interviews"
        headline="Conversations That Matter"
        subline="Engineers, plant operators, and sector leaders talk honestly about India's energy infrastructure."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Podcasts & Interviews</span>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-5">
          {EPISODES.map((ep, i) => (
            <motion.div key={ep.id} {...fadeUp(i * 0.08)}>
              <div className="bg-white border border-border rounded-2xl p-7 flex gap-6 items-start hover:border-primary hover:shadow-md transition-all duration-200">
                {/* Episode number + play */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border">
                    <MicOutlinedIcon className="text-primary" style={{ fontSize: 22 }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{ep.episode}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${TOPIC_STYLE[ep.topic]}`}>
                      {ep.topic}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <AccessTimeOutlinedIcon style={{ fontSize: 12 }} />{ep.duration}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-text-primary leading-snug mb-2">{ep.title}</h3>
                  <p className="text-xs font-semibold text-primary mb-3">{ep.guest} — <span className="text-text-muted font-normal">{ep.role}</span></p>
                  <p className="text-sm text-text-muted leading-relaxed mb-4">{ep.description}</p>
                  <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <PlayCircleOutlinedIcon style={{ fontSize: 18 }} /> Listen
                  </Link>
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Be a Guest</p>
            <h2 className="text-xl font-extrabold text-text-primary">Want to share your perspective?</h2>
            <p className="mt-1 text-sm text-text-muted">We talk to engineers, operators, and policy experts across India's energy sector.</p>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
