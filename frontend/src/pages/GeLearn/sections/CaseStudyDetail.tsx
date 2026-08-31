import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import CheckIcon from '@mui/icons-material/Check'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { CASE_STUDIES, CS_IMAGES } from '@/config/caseStudies'

// ── Lorem ipsum placeholder text ─────────────────────────────────────────────

const LOREM_1 = "In today's competitive energy landscape, deploying robust monitoring and control infrastructure is essential for enhancing asset visibility and operational performance. By integrating real-time data acquisition with intelligent analytics, operators not only improve plant availability but also establish a verifiable track record of performance within the industry. This strategic approach involves identifying the right protocol stack, building reliable edge connectivity, and delivering dashboards that surface the right information at the right time. As your data infrastructure matures, so does your ability to make evidence-based decisions — leading to improved yield, faster fault response, and greater trust from clients and regulators alike."

const LOREM_2 = "Effective monitoring and control management not only enhances site visibility but also enables meaningful intervention when performance drifts below baseline. By actively tracking generation, consumption, and fault events in real time, engineering teams can respond before losses compound. Additionally, by continuously analysing historical trends, operators can identify systemic inefficiencies — soiling patterns, inverter degradation curves, communication dropouts — and address them proactively rather than reactively. The result is a platform that pays for itself through measurable operational improvement."

// ── Project requirements checklist ───────────────────────────────────────────

const REQUIREMENTS = [
  'System Architecture & Scoping',
  'Analytics & Performance Monitoring',
  'Protocol Integration Planning',
  'Cybersecurity & Access Control',
  'Data Acquisition Configuration',
  'Connectivity & Edge Buffering',
  'Acceptance Testing & Commissioning',
  'Ongoing Adjustments & Reporting',
]

// ── Mini card for "More Case Studies" ────────────────────────────────────────

function MiniCard({ cs }: { cs: (typeof CASE_STUDIES)[number] }) {
  const img = CS_IMAGES[(cs.id - 1) % CS_IMAGES.length]
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
      className="bg-white border border-[#e8e8e8] rounded-2xl shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col group"
    >
      <div className={`h-1.5 w-32 rounded-b-xl ml-6 shrink-0 ${cs.categoryColor}`} />
      <div className="mx-6 mt-4 rounded-3xl overflow-hidden bg-[#f3f4f6] aspect-4/3 shrink-0">
        <motion.img
          src={img}
          alt={cs.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <div className="flex flex-col flex-1 px-6 pt-5 pb-6">
        <h3 className="text-2xl font-semibold text-black leading-8 mb-3">{cs.title}</h3>
        <p className="text-sm text-[#949494] leading-5 flex-1 mb-5">{cs.excerpt}</p>
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

export default function CaseStudyDetail() {
  const { id } = useParams<{ id: string }>()
  const csId = Number(id)
  const cs = CASE_STUDIES.find(c => c.id === csId)

  if (!cs) return <Navigate to="/gelearn/case-studies" replace />

  const heroImg = CS_IMAGES[(cs.id - 1) % CS_IMAGES.length]
  const related = CASE_STUDIES.filter(c => c.id !== cs.id).slice(0, 3)

  return (
    <main>
      <PageMeta
        title={`${cs.title} — Genex Case Studies`}
        description={cs.excerpt}
        canonical={`/gelearn/case-studies/${cs.id}`}
      />

      {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e2e8f0] py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#62748e]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <Link to="/gelearn/case-studies" className="hover:text-primary transition-colors">Case Studies</Link>
          <ChevronRightIcon style={{ fontSize: 14 }} />
          <span className="text-[#1d293d] truncate max-w-sm">{cs.title}</span>
        </div>
      </div>

      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* ── HERO TITLE ───────────────────────────────────────────────── */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="text-5xl font-bold text-black leading-tight capitalize pt-16 pb-10 max-w-3xl"
          >
            {cs.title}
          </motion.h1>

          {/* ── HERO IMAGE ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' as const }}
            className="rounded-3xl overflow-hidden aspect-21/9 mb-16"
          >
            <img
              src={heroImg}
              alt={cs.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* ── SECTION HEADING ──────────────────────────────────────────── */}
          <h2 className="text-3xl font-bold text-black capitalize mb-8">
            Online media management boost your presence
          </h2>

          {/* ── BODY PARAGRAPHS ──────────────────────────────────────────── */}
          <div className="space-y-6 mb-12">
            <p className="text-lg text-[#949494] leading-[1.63]">{LOREM_1}</p>
            <p className="text-lg text-[#949494] leading-[1.63]">{LOREM_2}</p>
          </div>

          {/* ── META BAR ─────────────────────────────────────────────────── */}
          <div className="border-t border-b border-[#e8e8e8] py-6 mb-14">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { Icon: PersonOutlinedIcon,       label: 'Client',          value: 'Confidential' },
                { Icon: BuildOutlinedIcon,         label: 'Services',        value: cs.category },
                { Icon: CalendarTodayOutlinedIcon, label: 'Completed Date',  value: cs.date },
                { Icon: LocationOnOutlinedIcon,    label: 'Location',        value: 'India' },
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

          {/* ── PROJECT REQUIREMENTS ─────────────────────────────────────── */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-black capitalize mb-4">Project Requirement</h3>
            <p className="text-lg text-[#949494] leading-[1.63] mb-8">
              Our client seeks to optimise operational presence across monitoring platforms, connecting plant data with engineering teams and driving evidence-based decisions. We help build a resilient digital infrastructure that boosts performance visibility and supports long-term asset management.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
              {REQUIREMENTS.map(req => (
                <div key={req} className="flex items-center gap-3">
                  <div className="bg-[#eff6ff] size-5 rounded flex items-center justify-center shrink-0">
                    <CheckIcon style={{ fontSize: 12 }} className="text-primary" />
                  </div>
                  <span className="text-base font-medium text-black">{req}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── MORE CASE STUDIES ─────────────────────────────────────────── */}
        <div className="border-t border-[#e8e8e8] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">

            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-black capitalize mb-2">More Case Studies</h2>
                <p className="text-lg text-[#45556c] max-w-xl">
                  The software managing these decentralised power sources was fragmented, insecure, and incapable of scale. Here's how we fixed it.
                </p>
              </div>
              <Link
                to="/gelearn/case-studies"
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

        {/* ── CTA ──────────────────────────────────────────────────────── */}
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

      </div>
    </main>
  )
}
