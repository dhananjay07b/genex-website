import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined'
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined'
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined'
import MicOutlinedIcon from '@mui/icons-material/MicOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'

export const GELEARN_SECTIONS = [
  {
    slug: 'how-we-work',
    label: 'How We Work',
    Icon: EngineeringOutlinedIcon,
    gradient: 'from-indigo-500/30 via-blue-400/20 to-slate-400/10',
    iconBg: 'from-indigo-500 to-blue-500',
    count: '6 Methodology Steps',
    description: 'Our engineering process, delivery methodology, and quality standards across every project we undertake.',
  },
  {
    slug: 'technology',
    label: 'Technology Deep Dives',
    Icon: MemoryOutlinedIcon,
    gradient: 'from-cyan-500/30 via-teal-400/20 to-sky-400/10',
    iconBg: 'from-cyan-500 to-teal-500',
    count: '5 Articles',
    description: 'In-depth technical breakdowns of our SCADA, EMS, grid management, and IoT systems.',
  },
  {
    slug: 'case-studies',
    label: 'Case Studies',
    Icon: DescriptionOutlinedIcon,
    gradient: 'from-amber-500/30 via-orange-400/20 to-yellow-400/10',
    iconBg: 'from-amber-500 to-orange-500',
    count: '4 Projects',
    description: 'Real project outcomes with verified performance data, deployment scale, and client impact.',
  },
  {
    slug: 'tenders',
    label: 'Tenders & Opportunities',
    Icon: GavelOutlinedIcon,
    gradient: 'from-slate-500/30 via-gray-400/20 to-zinc-400/10',
    iconBg: 'from-slate-500 to-gray-600',
    count: '4 Active Listings',
    description: 'Active tenders, RFPs, and partnership opportunities in the energy and automation sector.',
  },
  {
    slug: 'whitepapers',
    label: 'Whitepapers & Reports',
    Icon: ArticleOutlinedIcon,
    gradient: 'from-violet-500/30 via-purple-400/20 to-indigo-400/10',
    iconBg: 'from-violet-500 to-purple-600',
    count: '4 Documents',
    description: 'Published research, regulatory analysis, and sector intelligence from our engineering team.',
  },
  {
    slug: 'videos',
    label: 'Video Library',
    Icon: PlayCircleOutlinedIcon,
    gradient: 'from-rose-500/30 via-pink-400/20 to-red-400/10',
    iconBg: 'from-rose-500 to-pink-600',
    count: '6 Videos',
    description: 'Product walkthroughs, installation guides, live system demos, and event coverage.',
  },
  {
    slug: 'blog',
    label: 'Blog & Insights',
    Icon: RssFeedOutlinedIcon,
    gradient: 'from-emerald-500/30 via-green-400/20 to-teal-400/10',
    iconBg: 'from-emerald-500 to-green-600',
    count: '6 Posts',
    description: 'Engineering perspectives, industry commentary, and technical articles from our team.',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    Icon: HelpOutlinedIcon,
    gradient: 'from-sky-500/30 via-blue-400/20 to-cyan-400/10',
    iconBg: 'from-sky-500 to-blue-500',
    count: '16 Questions',
    description: 'Common technical and commercial questions — answered clearly by our engineers.',
  },
  {
    slug: 'podcasts',
    label: 'Podcasts & Interviews',
    Icon: MicOutlinedIcon,
    gradient: 'from-orange-500/30 via-amber-400/20 to-yellow-400/10',
    iconBg: 'from-orange-500 to-amber-500',
    count: '4 Episodes',
    description: 'Conversations with engineers, plant operators, and sector leaders about the energy transition.',
  },
]

// Dots pattern for GeLearn cards
function DotsOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden="true">
      <defs>
        <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  )
}

const RIPPLE_DELAYS = [0.35, 0.15, 0.35, 0.15, 0, 0.15, 0.35, 0.15, 0.35]

export default function GeLearn() {
  return (
    <main>
      <PageHero
        label="Knowledge Hub"
        headline="GeLearn"
        subline="Deep engineering knowledge from the team that builds, operates, and innovates across India's power infrastructure."
      />

      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-10">Browse by Type</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GELEARN_SECTIONS.map((section, i) => {
              const { Icon } = section
              return (
                <motion.div
                  key={section.slug}
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, ease: 'easeOut', delay: RIPPLE_DELAYS[i] }}
                >
                  <Link
                    to={`/gelearn/${section.slug}`}
                    className="group flex flex-col h-full rounded-2xl border border-border bg-white overflow-hidden hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Gradient header with dots overlay */}
                    <div className={`relative h-32 bg-linear-to-br ${section.gradient}`}>
                      <DotsOverlay />
                      {/* Centered icon */}
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br ${section.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon sx={{ fontSize: 26, color: '#fff' }} />
                        </div>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-base font-extrabold text-text-primary group-hover:text-primary transition-colors duration-200 leading-snug">
                          {section.label}
                        </h3>
                        <span className="shrink-0 ml-2 text-[10px] font-bold uppercase tracking-widest text-text-muted border border-border rounded-full px-2.5 py-0.5 whitespace-nowrap">
                          {section.count}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted leading-relaxed flex-1">{section.description}</p>
                      <div className="mt-5 flex items-center gap-1.5 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 translate-x-0 transition-all duration-200">
                        Explore <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="bg-white border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Open Knowledge</p>
            <h2 className="text-xl font-extrabold text-text-primary">Have content to contribute or a topic to suggest?</h2>
            <p className="mt-1 text-sm text-text-muted">We collaborate with engineers, researchers, and operators across the energy sector.</p>
          </div>
          <Link
            to="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200"
          >
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
