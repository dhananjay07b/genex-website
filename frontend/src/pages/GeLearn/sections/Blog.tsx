import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'

const TOPIC_STYLE: Record<string, string> = {
  'Policy & Regulation': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Engineering':         'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Industry Trends':     'bg-amber-50 text-amber-700 border-amber-200',
  'Operations':          'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Technology':          'bg-violet-50 text-violet-700 border-violet-200',
}

const FEATURED = {
  title: "India's Grid Modernisation Roadmap: What the 2030 Targets Mean for SCADA and EMS Vendors",
  topic: 'Policy & Regulation',
  date: 'April 2026',
  excerpt: "The Ministry of Power's 2030 transmission capacity targets require 500 GW of renewable integration — and the control room infrastructure to match. We break down what this means for the SCADA, EMS, and monitoring software ecosystem in India.",
  tags: ['SCADA', 'Grid Modernisation', 'Policy', 'Renewables'],
}

const POSTS = [
  {
    id: 1,
    title: 'Why PM Kusum Monitoring Is Harder Than It Looks — And How to Get It Right',
    topic: 'Engineering',
    date: 'March 2026',
    excerpt: "Distributed rural solar deployments have unique connectivity, power, and reporting challenges. The mistakes we've learned to avoid.",
  },
  {
    id: 2,
    title: 'The Hidden Costs of Proprietary SCADA: A Lifecycle Analysis',
    topic: 'Operations',
    date: 'February 2026',
    excerpt: 'Licensing, vendor lock-in, and support dependencies add up over a 15-year asset lifespan. An honest breakdown of what proprietary systems really cost.',
  },
  {
    id: 3,
    title: 'Drone Inspection for Solar: Where the Technology Actually Stands in 2026',
    topic: 'Technology',
    date: 'January 2026',
    excerpt: "Thermal drones are moving from pilot to production in India. We examine what's working, what's not, and what plant operators should ask before committing.",
  },
  {
    id: 4,
    title: 'EV Fleet Charging Demand: Planning Grid Impact Before It Becomes a Problem',
    topic: 'Industry Trends',
    date: 'December 2025',
    excerpt: 'Fleet operators often underestimate the grid impact of simultaneous charging. We outline a demand modelling approach that prevents expensive surprises.',
  },
  {
    id: 5,
    title: 'ISO 50001 in Practice: What Indian Industrial Sites Actually Find Useful',
    topic: 'Operations',
    date: 'November 2025',
    excerpt: "The standard is comprehensive but implementation varies widely. Here's what energy managers at manufacturing sites tell us they actually use — and what collects dust.",
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' as const },
  transition: { duration: 0.45, ease: 'easeOut' as const, delay },
})

export default function Blog() {
  return (
    <main>
      <PageHero
        label="Blog & Insights"
        headline="Perspectives From the Field"
        subline="Engineering commentary, industry analysis, and operational observations from the Genex team."
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-text-muted">
          <Link to="/gelearn" className="hover:text-primary transition-colors">GeLearn</Link>
          <span>/</span>
          <span className="font-semibold text-text-primary">Blog & Insights</span>
        </div>
      </div>

      <section className="bg-surface py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-6">

          {/* Featured post */}
          <motion.div {...fadeUp(0)}>
            <div className="bg-[#0A1628] rounded-2xl overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${TOPIC_STYLE[FEATURED.topic]}`}>
                    {FEATURED.topic}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/50">
                    <CalendarTodayOutlinedIcon style={{ fontSize: 12 }} />{FEATURED.date}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/30 bg-primary/10 rounded-full px-2.5 py-0.5 ml-auto">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-snug mb-4">{FEATURED.title}</h2>
                <p className="text-sm text-white/65 leading-relaxed mb-6 max-w-2xl">{FEATURED.excerpt}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {FEATURED.tags.map(t => (
                    <span key={t} className="px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-medium text-white/70">{t}</span>
                  ))}
                </div>
                <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                  Read Article <ArrowForwardIcon style={{ fontSize: 15 }} />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Regular posts grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post, i) => (
              <motion.div key={post.id} {...fadeUp(0.1 + i * 0.07)}>
                <div className="bg-white border border-border rounded-2xl p-6 h-full flex flex-col hover:border-primary hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${TOPIC_STYLE[post.topic]}`}>
                      {post.topic}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <CalendarTodayOutlinedIcon style={{ fontSize: 11 }} />{post.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-text-primary leading-snug mb-3 flex-1">{post.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">{post.excerpt}</p>
                  <Link to="/contact" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-auto">
                    Read <ArrowForwardIcon style={{ fontSize: 14 }} />
                  </Link>
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
            <h2 className="text-xl font-extrabold text-text-primary">We publish perspectives from engineers and operators.</h2>
          </div>
          <Link to="/contact" className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-sm font-semibold text-text-primary hover:border-primary hover:text-primary transition-all duration-200">
            Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
          </Link>
        </div>
      </section>
    </main>
  )
}
