import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { LockedOverlay } from '@/components/gelearn/LockedOverlay'
import { apiFetch } from '@/lib/api/client'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Episode {
  id: number
  title: string
  category: string
  category_bg: string
  category_text: string
  date: string
  duration: string
  description: string
  guest: string
  guest_role: string
  audio_url: string | null
  is_locked: boolean
}

interface EpisodeListResponse {
  results: Episode[]
}

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
          style={{ background: ep.category_bg, color: ep.category_text }}
        >
          {ep.category}
        </span>
        <span className="text-xs font-medium text-[#62748e]">
          {ep.date}&nbsp;&nbsp;|&nbsp;&nbsp;{ep.duration}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className="w-full h-36 rounded-2xl overflow-hidden mb-5 shrink-0 relative"
        style={{ background: `linear-gradient(135deg, ${ep.category_bg}, #c5bebe)` }}
      >
        {ep.is_locked && <LockedOverlay />}
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
        <span className="text-xs font-medium text-[#62748e]">{ep.guest_role}</span>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Podcasts() {
  const [episodes, setEpisodes] = useState<Episode[]>([])

  useEffect(() => {
    apiFetch<EpisodeListResponse>('/api/snippets/podcasts/')
      .then(res => setEpisodes(res.results))
      .catch(() => setEpisodes([]))
  }, [])

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
            {episodes.map((ep, i) => (
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
