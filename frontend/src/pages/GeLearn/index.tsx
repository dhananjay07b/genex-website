import { useLocation, Link } from 'react-router-dom'
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

const sections = [
  {
    slug: 'how-we-work',
    label: 'How We Work',
    Icon: EngineeringOutlinedIcon,
    description:
      'Our engineering process, delivery methodology, and quality standards across every project we undertake.',
  },
  {
    slug: 'technology',
    label: 'Technology Deep Dives',
    Icon: MemoryOutlinedIcon,
    description:
      'In-depth technical breakdowns of our SCADA, EMS, grid management, and IoT systems.',
  },
  {
    slug: 'case-studies',
    label: 'Case Studies',
    Icon: DescriptionOutlinedIcon,
    description:
      'Real project outcomes with verified performance data, deployment scale, and client impact.',
  },
  {
    slug: 'tenders',
    label: 'Tenders & Opportunities',
    Icon: GavelOutlinedIcon,
    description:
      'Active tenders, RFPs, and partnership opportunities in the energy and automation sector.',
  },
  {
    slug: 'whitepapers',
    label: 'Whitepapers & Reports',
    Icon: ArticleOutlinedIcon,
    description:
      'Published research, regulatory analysis, and sector intelligence from our engineering team.',
  },
  {
    slug: 'videos',
    label: 'Video Library',
    Icon: PlayCircleOutlinedIcon,
    description:
      'Product walkthroughs, installation guides, live system demos, and event coverage.',
  },
  {
    slug: 'blog',
    label: 'Blog & Insights',
    Icon: RssFeedOutlinedIcon,
    description:
      'Engineering perspectives, industry commentary, and technical articles from our team.',
  },
  {
    slug: 'faq',
    label: 'FAQ',
    Icon: HelpOutlinedIcon,
    description:
      'Common technical and commercial questions — answered clearly by our engineers.',
  },
  {
    slug: 'podcasts',
    label: 'Podcasts & Interviews',
    Icon: MicOutlinedIcon,
    description:
      'Conversations with engineers, plant operators, and sector leaders about the energy transition.',
  },
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.07 },
  }),
}

function HubGrid() {
  return (
    <section className="py-20 lg:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, i) => {
            const { Icon } = section
            return (
              <motion.div
                key={section.slug}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
              >
                <Link
                  to={`/gelearn/${section.slug}`}
                  className="group flex flex-col h-full rounded-xl border border-border bg-white p-7 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  aria-label={section.label}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg gradient-brand">
                      <Icon sx={{ fontSize: 22, color: '#fff' }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted border border-border rounded-full px-2.5 py-1">
                      Coming Soon
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-primary transition-colors duration-150">
                    {section.label}
                  </h3>

                  <p className="text-sm text-text-muted leading-relaxed flex-1">
                    {section.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
                    Explore
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function SectionComingSoon({ slug }: { slug: string }) {
  const section = sections.find((s) => s.slug === slug)

  if (!section) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center py-32 text-center px-6">
        <p className="text-text-muted text-sm mb-4">This section doesn't exist.</p>
        <Link to="/gelearn" className="text-primary text-sm font-semibold hover:underline">
          ← Back to GeLearn
        </Link>
      </section>
    )
  }

  const { Icon } = section

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center py-32 px-6 bg-surface">
      <motion.div
        className="flex flex-col items-center text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-brand mb-6">
          <Icon sx={{ fontSize: 30, color: '#fff' }} />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
          GeLearn
        </span>

        <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary mb-4 leading-tight">
          {section.label}
        </h2>

        <p className="text-text-muted text-base leading-relaxed mb-8">{section.description}</p>

        <div className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text-muted mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Content launching soon
        </div>

        <Link
          to="/gelearn"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          ← All GeLearn sections
        </Link>
      </motion.div>
    </section>
  )
}

export default function GeLearn() {
  const { pathname } = useLocation()
  const subPath = pathname.replace(/^\/gelearn\/?/, '').split('/')[0]
  const isIndex = !subPath

  return (
    <>
      <PageHero
        label={isIndex ? 'Knowledge Hub' : 'GeLearn'}
        headline={isIndex ? 'GeLearn' : (sections.find((s) => s.slug === subPath)?.label ?? 'GeLearn')}
        subline={
          isIndex
            ? "Deep engineering knowledge from the team that builds, operates, and innovates across India's power infrastructure."
            : undefined
        }
      />
      {isIndex ? <HubGrid /> : <SectionComingSoon slug={subPath} />}
    </>
  )
}
