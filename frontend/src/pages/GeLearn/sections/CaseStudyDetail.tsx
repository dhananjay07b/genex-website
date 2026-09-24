import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { RichText } from '@/components/ui/RichText'
import { apiFetch } from '@/lib/api/client'
import { formatDisplayDate } from '@/lib/utils'
import { marketingPath } from '@/lib/host'
import { renderStreamField, type BlockComponentMap } from '@/lib/streamfield/renderStreamField'
import type { CaseStudyItem, CaseStudySectionValue, SnippetListResponse } from '@/types/api'

function RichTextSection({ value }: { value: unknown }) {
  const section = value as CaseStudySectionValue
  return (
    <div className="mb-10">
      <h3 className="text-2xl font-bold text-black mb-4">{section.heading}</h3>
      <RichText
        html={section.body}
        className="text-lg text-[#949494] leading-[1.63] [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_strong]:text-black [&_b]:text-black"
      />
    </div>
  )
}

const sectionBlockMap: BlockComponentMap = {
  section: RichTextSection,
}

const FALLBACK_IMAGE = '/images/case-studies/cs-1.jpg'

function MiniCard({ cs }: { cs: CaseStudyItem }) {
  const img = cs.image_url ?? FALLBACK_IMAGE
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group"
    >
      <div className={`h-1.5 w-32 rounded-b-xl ml-6 shrink-0 ${cs.category_color}`} />
      <div className="mx-6 mt-4 rounded-3xl overflow-hidden bg-[#f3f4f6] aspect-4/3 shrink-0">
        <motion.img
          src={img}
          alt={cs.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6">
        <h3 className="text-2xl font-semibold text-black leading-8 mb-3">{cs.title}</h3>
        <p className="text-sm text-[#949494] leading-5 flex-1 mb-5">{cs.excerpt}</p>
        <div className="border-t border-[#e8e8e8] pt-6 flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-base font-bold text-black">{cs.category}</p>
            <p className="text-sm text-[#949494]">{formatDisplayDate(cs.date)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <AccessTimeOutlinedIcon style={{ fontSize: 14 }} className="text-[#949494]" />
              <span className="text-sm font-bold text-[#949494]">{cs.read_time}</span>
            </div>
            <Link
              to={`/case-studies/${cs.id}`}
              className="bg-secondary flex items-center justify-center rounded-full size-10 shadow-[0px_10px_15px_-3px_rgba(30,64,175,0.25),0px_4px_6px_-4px_rgba(30,64,175,0.25)] hover:opacity-85 transition-opacity"
            >
              <ArrowForwardIcon style={{ fontSize: 18, transform: 'rotate(-45deg)' }} className="text-white" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CaseStudyDetail() {
  const { id } = useParams<{ id: string }>()
  const [cs, setCs] = useState<CaseStudyItem | null | undefined>(undefined)
  const [related, setRelated] = useState<CaseStudyItem[]>([])

  useEffect(() => {
    if (!id) { setCs(null); return }
    apiFetch<CaseStudyItem>(`/api/snippets/case-studies/${id}/`)
      .then(item => setCs(item))
      .catch(() => setCs(null))
    apiFetch<SnippetListResponse<CaseStudyItem>>('/api/snippets/case-studies/?limit=4')
      .then(res => setRelated(res.results.filter(c => c.id !== Number(id)).slice(0, 3)))
      .catch(() => {})
  }, [id])

  if (cs === undefined) return null
  if (cs === null) return <Navigate to="/case-studies" replace />

  const heroImg = cs.image_url ?? FALLBACK_IMAGE

  return (
    <main>
      <PageMeta
        title={`${cs.title} — Genex Case Studies`}
        description={cs.excerpt}
        canonical={`/case-studies/${cs.id}`}
      />

      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-sm">{cs.title}</span>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="text-5xl font-bold text-black leading-tight capitalize pt-16 pb-10 max-w-3xl"
          >
            {cs.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' as const }}
            className="rounded-3xl overflow-hidden aspect-21/9 mb-16 bg-[#f3f4f6]"
          >
            <img
              src={heroImg}
              alt={cs.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </motion.div>

          <h2 className="text-3xl font-bold text-black capitalize mb-8">
            Project Overview
          </h2>

          <div className="space-y-6 mb-12">
            <p className="text-lg text-[#949494] leading-[1.63]">{cs.excerpt}</p>
            {cs.intro && (
              <RichText
                html={cs.intro}
                className="text-lg text-[#949494] leading-[1.63] [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_strong]:text-black [&_b]:text-black"
              />
            )}
          </div>

          <div className="border-t border-b border-[#e8e8e8] py-6 mb-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { Icon: PersonOutlinedIcon,       label: 'Client',         value: 'Confidential' },
                { Icon: BuildOutlinedIcon,         label: 'Services',       value: cs.category },
                { Icon: CalendarTodayOutlinedIcon, label: 'Completed',      value: formatDisplayDate(cs.date) },
                { Icon: LocationOnOutlinedIcon,    label: 'Location',       value: 'India' },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="size-8 flex items-center justify-center shrink-0 text-[#62748e]">
                    <Icon style={{ fontSize: 22 }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#949494] mb-1">{label}</p>
                    <p className="text-xl font-medium text-black">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {cs.sections.length > 0 && (
            <div className="mb-20">
              {renderStreamField(cs.sections, sectionBlockMap)}
            </div>
          )}

        </div>

        {related.length > 0 && (
          <div className="border-t border-[#e8e8e8] py-16 lg:py-24">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-black capitalize mb-2">More Case Studies</h2>
                  <p className="text-lg text-[#45556c] max-w-xl">
                    More field deployments from the Genex engineering team.
                  </p>
                </div>
                <Link
                  to="/case-studies"
                  className="shrink-0 flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full hover:opacity-90 transition-opacity"
                >
                  View All <ArrowForwardIcon style={{ fontSize: 16 }} />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 mt-10">
                {related.map((relCs, i) => (
                  <motion.div
                    key={relCs.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' as const }}
                    transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const }}
                  >
                    <MiniCard cs={relCs} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

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
              <a
                href={marketingPath('/contact')}
                className="inline-flex items-center gap-2 px-8 py-4 gradient-brand text-white text-sm font-bold rounded-md hover:opacity-90 transition-opacity"
              >
                Start a Conversation <ArrowForwardIcon style={{ fontSize: 16 }} />
              </a>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  )
}
