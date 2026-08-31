import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { TECH_ARTICLES } from '@/config/technologyArticles'

// ── Styles ────────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#e9ffe8', text: '#2c8502' },
  Intermediate: { bg: '#fff8e8', text: '#855a02' },
  Advanced:     { bg: '#ffe8e8', text: '#8b0000' },
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

// ── ArticleCard ───────────────────────────────────────────────────────────────

function ArticleCard({ article, index }: { article: (typeof TECH_ARTICLES)[number]; index: number }) {
  const diff = DIFFICULTY_STYLE[article.difficulty]
  return (
    <motion.div
      custom={index * 0.08}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e9e9e9] rounded-3xl flex flex-col shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-primary/40 hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)] transition-shadow duration-300 overflow-hidden"
    >
      {/* Featured tab */}
      {article.featured && (
        <div className="bg-white px-8 pt-4 pb-0">
          <span className="inline-block text-[13px] font-semibold text-primary bg-primary/8 px-4 py-1.5 rounded-t-xl border border-b-0 border-primary/20">
            Featured
          </span>
        </div>
      )}

      {/* Card body */}
      <div className={`px-8 pb-8 flex flex-col flex-1 ${article.featured ? 'pt-4' : 'pt-8'}`}>
        {/* Difficulty + topic badges */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: diff.bg, color: diff.text }}
          >
            {article.difficulty}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f7f7f7] text-[#3f3f3f]">
            {article.topic}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[22px] font-semibold text-[#0f172b] leading-[1.35] mb-4 flex-1">
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[15px] text-[#45556c] leading-[1.6] mb-6">
          {article.excerpt}
        </p>

        {/* Arrow button */}
        <div className="flex justify-end mb-6">
          <Link
            to={`/gelearn/technology/${article.id}`}
            className="bg-secondary flex items-center justify-center rounded-full size-10 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:opacity-85 transition-opacity"
          >
            <ArrowForwardIcon
              style={{ fontSize: 18, transform: 'rotate(-45deg)', color: '#fff' }}
            />
          </Link>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e8e8e8] pt-5 flex items-center justify-between gap-4">
          {/* Tags */}
          <p className="text-sm font-semibold text-[#0f172b] leading-5">
            {article.tags.join(', ')}
          </p>

          {/* Read time */}
          <span className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-[#62748e] border border-[#e4e4e4] rounded-full px-3 py-1 whitespace-nowrap">
            <AccessTimeOutlinedIcon style={{ fontSize: 14 }} />
            {article.readTime}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Technology() {
  return (
    <main>
      <PageMeta
        title="Technology Deep Dives — Genex GeLearn"
        description="IEC 61850, OPC-UA, MQTT, Modbus, AI/ML for energy — technical articles from Genex engineers on the protocols and architectures powering the energy transition."
        canonical="/gelearn/technology"
      />
      <PageHero
        label="Technology Deep Dives"
        headline="Under the Hood"
        subline="In-depth technical articles from engineers who build, commission, and operate these systems in the field."
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
              Engineering analysis and field lessons from the teams who build and operate India's energy infrastructure.
            </p>
          </motion.div>

          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TECH_ARTICLES.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
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
