import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Episode {
  id: number
  title: string
  category: string
  categoryBg: string
  categoryText: string
  date: string
  duration: string
  description: string
  guest: string
  role: string
  image: string
}

const EPISODES: Episode[] = [
  {
    id: 1,
    title: 'The State of SCADA in India — Where Are We and Where Are We Going?',
    category: 'Grid & SCADA',
    categoryBg: '#eef2ff',
    categoryText: '#432dd7',
    date: 'JUL 27 2025',
    duration: '48 min',
    description: 'A frank conversation about the state of SCADA adoption at Indian utilities — the gap between aspiration and ground reality, and what it will take to close it.',
    guest: 'Rajesh Kumar',
    role: 'Head of Grid Automation, STU',
    image: '/images/podcasts/podcast-thumb.jpg',
  },
  {
    id: 2,
    title: 'Solar O&M at Scale: Lessons from 500 MW Under Management',
    category: 'Solar',
    categoryBg: '#fffbeb',
    categoryText: '#b45309',
    date: 'AUG 05 2025',
    duration: '41 min',
    description: 'What changes when you go from managing 10 solar sites to 300? Data quality, team structure, alarm fatigue, and the tools that actually help.',
    guest: 'Priya Menon',
    role: 'O&M Director, RE Developer',
    image: '/images/podcasts/podcast-thumb.jpg',
  },
  {
    id: 3,
    title: "India's Energy Storage Policy in 2026: What Operators Need to Know",
    category: 'Energy Policy',
    categoryBg: '#f5f3ff',
    categoryText: '#6d28d9',
    date: 'AUG 19 2025',
    duration: '55 min',
    description: 'The BESS policy landscape has shifted significantly in the past two years. We break down what the changes mean for developers, utilities, and software vendors.',
    guest: 'Amit Sharma',
    role: 'Energy Policy Analyst',
    image: '/images/podcasts/podcast-thumb.jpg',
  },
  {
    id: 4,
    title: 'Fleet Electrification: The Infrastructure Reality Behind the Headlines',
    category: 'EV',
    categoryBg: '#ecfdf5',
    categoryText: '#047857',
    date: 'SEP 02 2025',
    duration: '37 min',
    description: "Fleet operators are moving faster than the charging infrastructure ecosystem. An honest conversation about what's working, what isn't, and what software needs to do better.",
    guest: 'Deepa Nair',
    role: 'Fleet Electrification Lead, SRTC',
    image: '/images/podcasts/podcast-thumb.jpg',
  },
  {
    id: 5,
    title: 'IEC 61850 in Practice: Commissioning Lessons from the Field',
    category: 'Grid & SCADA',
    categoryBg: '#eef2ff',
    categoryText: '#432dd7',
    date: 'SEP 16 2025',
    duration: '44 min',
    description: 'Moving from theory to deployed substations — a practitioner walkthrough of GOOSE configuration, SCL files, vendor interoperability, and what the standard still does not tell you.',
    guest: 'Vikram Patel',
    role: 'Senior Protection Engineer',
    image: '/images/podcasts/podcast-thumb.jpg',
  },
  {
    id: 6,
    title: 'RTC Power Trading: Data and Decisions on the IEX',
    category: 'Grid & SCADA',
    categoryBg: '#eef2ff',
    categoryText: '#432dd7',
    date: 'OCT 01 2025',
    duration: '39 min',
    description: 'How analytics platforms are changing real-time trading decisions on Indian exchanges — bid optimisation signals, settlement data, and the tools traders actually use.',
    guest: 'Neha Singh',
    role: 'Power Trading Analyst, IEX',
    image: '/images/podcasts/podcast-thumb.jpg',
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

// ── EpisodeCard ───────────────────────────────────────────────────────────────

function EpisodeCard({ ep, index }: { ep: Episode; index: number }) {
  return (
    <motion.div
      custom={index * 0.08}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e9e9e9] rounded-3xl p-8 flex flex-col shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-primary/30 hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)] transition-shadow duration-300 group cursor-pointer"
    >
      {/* Category + date/duration */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{ background: ep.categoryBg, color: ep.categoryText }}
        >
          {ep.category}
        </span>
        <span className="text-xs font-medium text-[#62748e]">
          {ep.date}&nbsp;&nbsp;|&nbsp;&nbsp;{ep.duration}
        </span>
      </div>

      {/* Thumbnail */}
      <div className="w-full h-36 rounded-2xl overflow-hidden bg-[#c5bebe] mb-5 shrink-0">
        <img
          src={ep.image}
          alt={ep.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-black leading-7 mb-4 flex-1 group-hover:text-primary transition-colors duration-200">
        {ep.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#62748e] leading-5 mb-6">
        {ep.description}
      </p>

      {/* Guest */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-[#314158]">{ep.guest}</span>
        <span className="text-[#62748e] text-xs">•</span>
        <span className="text-xs font-medium text-[#62748e]">{ep.role}</span>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

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
            {EPISODES.map((ep, i) => (
              <EpisodeCard key={ep.id} ep={ep} index={i} />
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
