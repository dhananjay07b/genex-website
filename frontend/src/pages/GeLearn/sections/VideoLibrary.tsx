import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { LockedOverlay } from '@/components/gelearn/LockedOverlay'
import { apiFetch } from '@/lib/api/client'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Video {
  id: number
  title: string
  category: string
  category_color: string
  category_text_color: string
  date: string
  duration: string
  excerpt: string
  video_url: string | null
  is_locked: boolean
}

interface VideoListResponse {
  results: Video[]
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

// ── VideoCard ─────────────────────────────────────────────────────────────────

function VideoCard({ video, index }: { video: Video; index: number }) {
  return (
    <motion.div
      custom={index * 0.09}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white rounded-3xl shadow-[0px_4px_16px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col group"
    >
      {/* Thumbnail */}
      <div
        className="mx-6 mt-6 rounded-2xl overflow-hidden aspect-video relative shrink-0"
        style={{ background: `linear-gradient(135deg, ${video.category_color}, #f3f4f6)` }}
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
        {/* Play button */}
        {!video.is_locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{
                scale: 1.2,
                boxShadow: '0px 0px 0px 10px rgba(26,174,232,0.2), 0px 16px_48px_rgba(26,174,232,0.75)',
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="size-16 gradient-brand rounded-full flex items-center justify-center cursor-pointer"
              style={{ boxShadow: '0px 8px 28px rgba(26,174,232,0.55)' }}
            >
              <PlayArrowIcon style={{ fontSize: 30, color: '#fff', marginLeft: 3 }} />
            </motion.div>
          </div>
        )}
        {video.is_locked && <LockedOverlay />}
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
        {/* Category + meta */}
        <div className="flex items-center gap-4 mb-4">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap"
            style={{ background: video.category_color, color: video.category_text_color }}
          >
            {video.category}
          </span>
          <span className="text-base font-medium text-[#62748e] whitespace-nowrap">
            {video.date}&nbsp;&nbsp;|&nbsp;&nbsp;{video.duration}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-black leading-normal mb-3">
          {video.title}
        </h3>

        {/* Excerpt */}
        <p className="text-base text-[#62748e] leading-6 flex-1">
          {video.excerpt}
        </p>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function VideoLibrary() {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    apiFetch<VideoListResponse>('/api/snippets/videos/')
      .then(res => setVideos(res.results))
      .catch(() => setVideos([]))
  }, [])

  return (
    <main>
      <PageMeta
        title="Video Library — Genex GeLearn"
        description="Product walkthroughs, installation guides, live system demos, and event coverage from the Genex Technocrats engineering team."
        canonical="/gelearn/videos"
      />
      <PageHero
        label="Video Library"
        headline="See It In Action"
        subline="Product walkthroughs, installation guides, live system demos, and event coverage from the Genex team."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[1.2px] text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-[#62748e]">&rsaquo;</span>
          <span className="text-[#1d293d]">Video Library</span>
        </div>
      </div>

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

          {/* 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((video, i) => (
              <VideoCard key={video.id} video={video} index={i} />
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
