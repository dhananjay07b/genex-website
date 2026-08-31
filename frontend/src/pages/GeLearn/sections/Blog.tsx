import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { POSTS, BLOG_IMAGES, type BlogPost as Post } from '@/config/blogPosts'

const PAGE_SIZE = 6

// ── Card ─────────────────────────────────────────────────────────────────────

function BlogCard({ post, index }: { post: Post; index: number }) {
  const img = BLOG_IMAGES[(post.id - 1) % BLOG_IMAGES.length]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' as const }}
      transition={{ duration: 0.45, delay: (index % PAGE_SIZE) * 0.07, ease: 'easeOut' as const }}
      className="bg-white border border-[#e8e8e8] rounded-3xl overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-64 shrink-0">
        <img
          src={img}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <span className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold px-4 py-1.5 rounded">
          {post.topic}
        </span>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-6 mb-4">
          <span className="flex items-center gap-2 text-xs text-[#949494]">
            <PersonOutlinedIcon style={{ fontSize: 14 }} />
            Posted By - Genex
          </span>
          <span className="flex items-center gap-2 text-xs text-[#949494]">
            <CalendarTodayOutlinedIcon style={{ fontSize: 14 }} />
            {post.date}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-black capitalize leading-8 mb-4 flex-1">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-[#949494] leading-5 mb-6">
          {post.excerpt}
        </p>

        {/* Read More */}
        <Link
          to={`/gelearn/blog/${post.id}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-black hover:text-primary transition-colors duration-200 self-start"
        >
          Read More <ArrowForwardIcon style={{ fontSize: 16 }} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Blog() {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(POSTS.length / PAGE_SIZE)
  const visible = POSTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function goTo(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main>
      <PageMeta
        title="Blog & Insights — Genex Technocrats"
        description="Engineering perspectives on solar monitoring, SCADA, smart grid, and energy management from the Genex Technocrats team."
        canonical="/gelearn/blog"
      />
      <PageHero
        label="Blog & Insights"
        headline="Perspectives From the Field"
        subline="Engineering commentary, industry analysis, and operational observations from the Genex team."
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
              Our insights on trends,<br />Technologies, and<br />Transformation
            </h2>
            <p className="text-base text-[#949494] max-w-xs lg:text-right leading-relaxed">
              Engineering perspectives on power, renewables, and industrial automation from the Genex team.
            </p>
          </motion.div>

          {/* Card grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-12">
            {visible.map((post, i) => (
              <BlogCard key={post.id} post={post} index={i} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-16">
            {page > 1 && (
              <button
                onClick={() => goTo(page - 1)}
                className="size-10 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-primary/10 transition-colors duration-200"
              >
                <ChevronLeftIcon style={{ fontSize: 18 }} className="text-[#111827]" />
              </button>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`size-10 rounded-full font-bold text-base flex items-center justify-center transition-colors duration-200 ${
                  page === p
                    ? 'bg-primary text-white'
                    : 'bg-[#f3f4f6] text-[#111827] hover:bg-primary/10'
                }`}
              >
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button
                onClick={() => goTo(page + 1)}
                className="size-10 rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-primary/10 transition-colors duration-200"
              >
                <ChevronRightIcon style={{ fontSize: 18 }} className="text-[#111827]" />
              </button>
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
              Have content to contribute?
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              We publish perspectives from engineers and operators.
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              If you work in power, renewables, or industrial automation and have something real to say, we want to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 gradient-brand text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
            >
              Get in Touch <ArrowForwardIcon style={{ fontSize: 16 }} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
