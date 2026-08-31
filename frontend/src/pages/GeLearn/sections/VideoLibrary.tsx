import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'

// ── Data ─────────────────────────────────────────────────────────────────────

interface Video {
  id: number
  title: string
  category: string
  categoryColor: string
  categoryTextColor: string
  date: string
  duration: string
  excerpt: string
  image: string
}

const VIDEOS: Video[] = [
  {
    id: 1,
    title: 'SolarLive™ Dashboard — Full Product Walkthrough',
    category: 'Product Demo',
    categoryColor: '#eef2ff',
    categoryTextColor: '#432dd7',
    date: 'JUL 27 2025',
    duration: '14:32 min',
    excerpt: 'A complete tour of the SolarLive™ monitoring platform — from site onboarding to live PR tracking, fault alerts, and multi-site portfolio view.',
    image: '/images/videos/video-1.jpg',
  },
  {
    id: 2,
    title: 'Live SCADA Demo — 220 kV Substation Control Room View',
    category: 'Live System',
    categoryColor: '#ecfdf5',
    categoryTextColor: '#047857',
    date: 'AUG 05 2025',
    duration: '11:20 min',
    excerpt: 'A live screen recording from an operational substation SCADA deployment. IEC 61850 real-time data, alarm management, and remote switching in action.',
    image: '/images/videos/video-2.jpg',
  },
  {
    id: 3,
    title: 'Data Logger Commissioning — Step-by-Step Installation Guide',
    category: 'Installation',
    categoryColor: '#fffbeb',
    categoryTextColor: '#b45309',
    date: 'AUG 12 2025',
    duration: '08:45 min',
    excerpt: 'How to physically install and commission a Genex Data Logger at a solar site — DIN rail mounting, Modbus wiring, SIM setup, and cloud pairing.',
    image: '/images/videos/video-3.jpg',
  },
  {
    id: 4,
    title: 'EV Charging Network Management — Operator Training Module 1',
    category: 'Training',
    categoryColor: '#fdf2f8',
    categoryTextColor: '#9d174d',
    date: 'AUG 19 2025',
    duration: '18:05 min',
    excerpt: 'First module of the EV Software Management operator training series. Covers charger onboarding, session management, and alert configuration.',
    image: '/images/videos/video-4.jpg',
  },
  {
    id: 5,
    title: 'Genex at India Smart Grid Week 2025 — Panel & Demo Highlights',
    category: 'Event',
    categoryColor: '#f5f3ff',
    categoryTextColor: '#6d28d9',
    date: 'AUG 25 2025',
    duration: '22:10 min',
    excerpt: 'Highlights from the Genex booth and panel session at ISGW 2025. Includes demo footage of Advanced SCADA and EMS-BESS at the innovation showcase.',
    image: '/images/videos/video-5.jpg',
  },
  {
    id: 6,
    title: 'PM Kusum RMS — Government Compliance Reporting Workflow',
    category: 'Product Demo',
    categoryColor: '#eef2ff',
    categoryTextColor: '#432dd7',
    date: 'SEP 02 2025',
    duration: '09:50 min',
    excerpt: 'How the Genex RMS platform generates PM Kusum compliance reports automatically — report templates, state-specific formats, and bulk export.',
    image: '/images/videos/video-6.jpg',
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
      <div className="mx-6 mt-6 rounded-2xl overflow-hidden aspect-video relative bg-[#f3f4f6] shrink-0">
        <img
          src={video.image}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300" />
        {/* Play button */}
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
      </div>

      {/* Body */}
      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">
        {/* Category + meta */}
        <div className="flex items-center gap-4 mb-4">
          <span
            className="px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap"
            style={{ background: video.categoryColor, color: video.categoryTextColor }}
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
            {VIDEOS.map((video, i) => (
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
