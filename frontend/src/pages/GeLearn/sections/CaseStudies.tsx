import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { CASE_STUDIES, CS_IMAGES, type CaseStudy } from '@/config/caseStudies'

const PAGE_SIZE = 6

// ── Card ─────────────────────────────────────────────────────────────────────

function CaseStudyCard({ cs, index }: { cs: CaseStudy; index: number }) {
  const img = CS_IMAGES[(cs.id - 1) % CS_IMAGES.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' as const }}
      transition={{ duration: 0.45, delay: (index % PAGE_SIZE) * 0.08, ease: 'easeOut' as const }}
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group"
    >
      {/* Category colour strip */}
      <div className={`h-1.5 w-32 rounded-b-xl ml-6 shrink-0 ${cs.categoryColor}`} />

      {/* Image */}
      <div className="mx-6 mt-4 mb-0 rounded-3xl overflow-hidden bg-[#f3f4f6] aspect-4/3 shrink-0">
        <motion.img
          src={img}
          alt={cs.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6">
        <h3 className="text-2xl font-semibold text-black leading-8 mb-3">
          {cs.title}
        </h3>
        <p className="text-sm text-[#949494] leading-5 flex-1 mb-5">
          {cs.excerpt}
        </p>

        {/* Footer */}
        <div className="border-t border-[#e8e8e8] pt-6 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-black">{cs.category}</p>
            <p className="text-sm text-[#949494]">{cs.date}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <AccessTimeOutlinedIcon style={{ fontSize: 14 }} className="text-[#949494]" />
              <span className="text-sm font-bold text-[#949494]">{cs.readTime}</span>
            </div>
              <Link
                to={`/gelearn/case-studies/${cs.id}`}
                className="bg-secondary flex items-center justify-center rounded-full size-10 shadow-[0px_10px_15px_-3px_rgba(30,64,175,0.25),0px_4px_6px_-4px_rgba(30,64,175,0.25)] hover:opacity-85 transition-opacity"
                aria-label={`Read case study: ${cs.title}`}
              >
                <ArrowForwardIcon style={{ fontSize: 18, transform: 'rotate(-45deg)' }} className="text-white" />
              </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CaseStudies() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(CASE_STUDIES.length / PAGE_SIZE)
  const visible = CASE_STUDIES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goTo(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main>
      <PageMeta
        title="Case Studies — Genex Technocrats"
        description="Real deployments. Real outcomes. Engineering case studies from Genex projects across solar, wind, grid, BESS, EV, and industrial energy sectors."
        canonical="/gelearn/case-studies"
      />
      <PageHero
        label="Case Studies"
        headline="Projects That Prove the Point"
        subline="Field deployments, verified outcomes, and the engineering decisions that made them work."
      />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Intro header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-14"
          >
            <h2 className="text-4xl font-bold text-black capitalize leading-tight max-w-lg">
              Our Insights On Trends,<br />Technologies, And<br />Transformation
            </h2>
            <p className="text-base text-[#949494] max-w-xs lg:text-right leading-relaxed">
              Bring to the table win-win survival strategies to ensure proactive domination at the end of the day.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {visible.map((cs, i) => (
              <CaseStudyCard key={cs.id} cs={cs} index={i} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-16">
            {page > 1 && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goTo(page - 1)}
                className="size-10 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-primary/10 transition-colors duration-200"
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} className="text-[#111827]" />
              </motion.button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <motion.button
                key={p}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goTo(p)}
                className={`size-10 rounded-full font-bold text-base flex items-center justify-center transition-colors duration-200 ${
                  page === p
                    ? 'bg-primary text-white'
                    : 'bg-[#f3f4f6] text-[#111827] hover:bg-primary/10'
                }`}
              >
                {p}
              </motion.button>
            ))}
            {page < totalPages && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goTo(page + 1)}
                className="size-10 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-primary/10 transition-colors duration-200"
              >
                <ChevronRightIcon style={{ fontSize: 18 }} className="text-[#111827]" />
              </motion.button>
            )}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Have a project in mind?
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Let's build the next case study together.
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Whether you're deploying a new plant, upgrading existing SCADA, or integrating storage — we want to hear what you're working on.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-brand text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              Start a Conversation <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
