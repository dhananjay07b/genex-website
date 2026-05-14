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
import { buttonVariants } from '../ui/Button'

const CATEGORIES = [
  { slug: 'how-we-work',   label: 'How We Work',            Icon: EngineeringOutlinedIcon },
  { slug: 'technology',    label: 'Technology Deep Dives',   Icon: MemoryOutlinedIcon },
  { slug: 'case-studies',  label: 'Case Studies',            Icon: DescriptionOutlinedIcon },
  { slug: 'tenders',       label: 'Tenders & Opportunities', Icon: GavelOutlinedIcon },
  { slug: 'whitepapers',   label: 'Whitepapers & Reports',   Icon: ArticleOutlinedIcon },
  { slug: 'videos',        label: 'Video Library',           Icon: PlayCircleOutlinedIcon },
  { slug: 'blog',          label: 'Blog & Insights',         Icon: RssFeedOutlinedIcon },
  { slug: 'faq',           label: 'FAQ',                     Icon: HelpOutlinedIcon },
  { slug: 'podcasts',      label: 'Podcasts & Interviews',   Icon: MicOutlinedIcon },
]

// Center-outward ripple delays (row-major, center=index 4 fires first)
const RIPPLE_DELAYS = [0.30, 0.20, 0.30, 0.20, 0.00, 0.20, 0.30, 0.20, 0.30]

const tileVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.0, 0.0, 0.2, 1] as const, delay },
  }),
}

export function GeLearnTeaser() {
  return (
    <section
      className="bg-brand-tint py-20 lg:py-28 overflow-hidden"
      aria-labelledby="gelearn-teaser-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[45fr_55fr] gap-12 lg:gap-20 items-center">

          {/* ── Left column ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Knowledge Hub
            </p>

            <h2
              id="gelearn-teaser-heading"
              className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight mb-6"
            >
              Engineering<br />Knowledge.<br className="hidden sm:block" /> On Demand.
            </h2>

            <p className="text-text-muted text-base leading-relaxed mb-8 max-w-sm">
              Deep technical content, case studies, and engineering insights from
              the team that runs India's power infrastructure.
            </p>

            <Link
              to="/gelearn"
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              Explore GeLearn
              <span aria-hidden="true">→</span>
            </Link>

            <p className="mt-6 text-xs text-text-muted tracking-wide">
              9 Content Sections &nbsp;·&nbsp; Case Studies &nbsp;·&nbsp; Whitepapers &nbsp;·&nbsp; Video Library
            </p>
          </motion.div>

          {/* ── Right column — 3×3 ripple grid ── */}
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map(({ slug, label, Icon }, i) => (
              <motion.div
                key={slug}
                custom={RIPPLE_DELAYS[i]}
                variants={tileVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                <Link
                  to={`/gelearn/${slug}`}
                  className="group flex flex-col items-center text-center gap-3 rounded-xl border border-border bg-white p-4 hover:border-primary/40 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={label}
                >
                  {/* Icon badge */}
                  <div className="relative overflow-hidden flex h-10 w-10 items-center justify-center rounded-lg gradient-brand shrink-0">
                    <Icon sx={{ fontSize: 20, color: '#fff' }} />
                    <div className="pointer-events-none absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <span className="text-[11px] font-semibold text-text-muted group-hover:text-primary leading-tight transition-colors duration-200">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
