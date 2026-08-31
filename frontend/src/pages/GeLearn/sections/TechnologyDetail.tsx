import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageMeta } from '@/components/seo/PageMeta'
import { TECH_ARTICLES } from '@/config/technologyArticles'

// ── Difficulty styles ─────────────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#e9ffe8', text: '#2c8502' },
  Intermediate: { bg: '#fff8e8', text: '#855a02' },
  Advanced:     { bg: '#ffe8e8', text: '#8b0000' },
}

// ── Related article mini-card ─────────────────────────────────────────────────

function RelatedCard({ article }: { article: (typeof TECH_ARTICLES)[number] }) {
  const diff = DIFFICULTY_STYLE[article.difficulty]
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden flex flex-col shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08)] group hover:border-primary/30 hover:shadow-[0px_10px_24px_rgba(26,174,232,0.08)] transition-shadow duration-300"
    >
      {/* Colour bar */}
      <div className="h-1 gradient-brand w-full shrink-0" />

      {/* Thumbnail */}
      <div className="mx-5 mt-4 rounded-2xl overflow-hidden bg-[#f3f4f6] aspect-video shrink-0">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
            style={{ background: diff.bg, color: diff.text }}
          >
            {article.difficulty}
          </span>
          <span className="text-[11px] font-semibold text-[#62748e] bg-[#f7f7f7] px-2.5 py-0.5 rounded-full">
            {article.topic}
          </span>
        </div>

        <h3 className="text-base font-semibold text-[#0f172b] leading-snug mb-3 flex-1 group-hover:text-primary transition-colors duration-200">
          {article.title}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#ebebeb]">
          <span className="flex items-center gap-1 text-xs text-[#62748e]">
            <AccessTimeOutlinedIcon style={{ fontSize: 13 }} />
            {article.readTime}
          </span>
          <Link
            to={`/gelearn/technology/${article.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Read <ArrowForwardIcon style={{ fontSize: 13 }} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TechnologyDetail() {
  const { id } = useParams<{ id: string }>()
  const articleId = Number(id)
  const article = TECH_ARTICLES.find(a => a.id === articleId)

  if (!article) return <Navigate to="/gelearn/technology" replace />

  const diff = DIFFICULTY_STYLE[article.difficulty]
  const related = TECH_ARTICLES.filter(a => a.id !== article.id).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={`${article.title} — Genex Technology`}
        description={article.excerpt}
        canonical={`/gelearn/technology/${article.id}`}
      />

      {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e] flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/gelearn/technology" className="hover:text-primary transition-colors">Technology</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-xs normal-case font-semibold">{article.title}</span>
        </div>
      </div>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-10">

          {/* Topic + difficulty */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' as const }}
            className="flex items-center gap-3 mb-6 flex-wrap"
          >
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-primary border border-primary/30 bg-primary/5 rounded-full px-3.5 py-1.5">
              <LabelOutlinedIcon style={{ fontSize: 13 }} />
              {article.topic}
            </span>
            <span
              className="text-xs font-bold px-3.5 py-1.5 rounded-full"
              style={{ background: diff.bg, color: diff.text }}
            >
              {article.difficulty}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' as const }}
            className="text-4xl lg:text-5xl font-bold text-black leading-tight max-w-4xl mb-8"
          >
            {article.title}
          </motion.h1>

          {/* Meta bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' as const }}
            className="flex items-center gap-6 flex-wrap text-sm text-[#62748e] border-b border-[#e2e8f0] pb-8"
          >
            <span className="flex items-center gap-1.5">
              <AccessTimeOutlinedIcon style={{ fontSize: 16 }} />
              {article.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarTodayOutlinedIcon style={{ fontSize: 16 }} />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#0f172b]">
              Genex Engineering Team
            </span>
          </motion.div>
        </div>

        {/* ── HERO IMAGE ────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: 'easeOut' as const }}
            className="rounded-3xl overflow-hidden aspect-21/9 mb-16"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

        {/* ── ARTICLE BODY ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-16">
          <div className="grid lg:grid-cols-[1fr_300px] gap-14 items-start">

            {/* Main content */}
            <div>
              {/* Introduction */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
                className="text-lg text-[#45556c] leading-[1.75] mb-10 font-normal border-l-4 border-primary pl-6"
              >
                {article.intro}
              </motion.p>

              {/* Sections */}
              {article.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' as const }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' as const }}
                  className="mb-10"
                >
                  <h2 className="text-2xl font-bold text-[#0f172b] mb-4 leading-snug">
                    {section.heading}
                  </h2>
                  <p className="text-[16px] text-[#45556c] leading-[1.75]">
                    {section.body}
                  </p>
                </motion.div>
              ))}

              {/* Technical callout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
                className="bg-[#f0f9ff] border border-primary/20 rounded-2xl p-7 mb-12"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <TipsAndUpdatesOutlinedIcon style={{ fontSize: 18, color: '#1AAEE8' }} />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                    {article.callout.label}
                  </p>
                </div>
                <p className="text-sm font-mono text-[#314158] leading-7 whitespace-pre-line">
                  {article.callout.content}
                </p>
              </motion.div>

              {/* Key takeaways */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.5, ease: 'easeOut' as const }}
                className="bg-white border border-[#e2e8f0] rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-[#0f172b] mb-6">Key Takeaways</h3>
                <ul className="space-y-4">
                  {article.takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircleOutlinedIcon
                        style={{ fontSize: 20, color: '#1AAEE8', flexShrink: 0, marginTop: 2 }}
                      />
                      <span className="text-base text-[#314158] leading-6">{t}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Tags */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#62748e] mb-4">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-[#f7f7f7] border border-[#e2e8f0] rounded-full text-xs font-medium text-[#314158] hover:border-primary hover:text-primary cursor-pointer transition-colors duration-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Article meta summary */}
              <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 space-y-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#62748e]">Article Details</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#949494] uppercase tracking-widest mb-1">Topic</p>
                    <p className="text-sm font-bold text-[#0f172b]">{article.topic}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#949494] uppercase tracking-widest mb-1">Level</p>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: diff.bg, color: diff.text }}
                    >
                      {article.difficulty}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#949494] uppercase tracking-widest mb-1">Read time</p>
                    <p className="text-sm font-bold text-[#0f172b]">{article.readTime}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#949494] uppercase tracking-widest mb-1">Published</p>
                    <p className="text-sm font-bold text-[#0f172b]">{article.date}</p>
                  </div>
                </div>
              </div>

              {/* CTA card */}
              <div className="gradient-brand rounded-2xl p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] mb-3 text-white/80">
                  Talk to an Engineer
                </p>
                <p className="text-base font-bold leading-snug mb-5">
                  Have a project that needs this expertise?
                </p>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 bg-white text-primary text-sm font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Get in Touch <ArrowForwardIcon style={{ fontSize: 15 }} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── MORE ARTICLES ─────────────────────────────────────────────── */}
        <div className="border-t border-[#e8e8e8] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">More Deep Dives</h2>
                <p className="text-base text-[#45556c]">
                  Engineering analysis and field lessons from the Genex team.
                </p>
              </div>
              <Link
                to="/gelearn/technology"
                className="shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                View All <ArrowForwardIcon style={{ fontSize: 16 }} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel, i) => (
                <motion.div
                  key={rel.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' as const }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const }}
                >
                  <RelatedCard article={rel} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CTA BANNER ───────────────────────────────────────────────── */}
        <section className="bg-[#f0f9ff] py-20 lg:py-28">
          <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
                Work With Our Team
              </p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0f2930] leading-tight mb-4">
                Start Now.<br />Get Started For Free
              </h2>
              <p className="text-base text-[#6b7280] leading-relaxed mb-10 max-w-lg mx-auto">
                Our AI-monitored solar grids distribute power intelligently — book a personalised demo with our engineering team.
              </p>
              <Link
                to="/contact#demo"
                className="inline-flex items-center gap-2 bg-[#18afdf] text-white text-base font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity"
              >
                Request a Demo <ArrowForwardIcon style={{ fontSize: 18 }} />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
