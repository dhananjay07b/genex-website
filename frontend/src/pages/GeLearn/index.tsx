import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { useAuth } from '@/context/useAuth'
import { CTABand } from '@/components/ui/CTABand'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { apiFetch } from '@/lib/api/client'
import { marketingPath } from '@/lib/host'
import { getMediaUrl, formatDisplayDate } from '@/lib/utils'
import { CompanyBadge } from '@/components/gelearn/CompanyBadge'
import type {
  TechArticleItem, CaseStudyItem, BlogPostItem, VideoItem, PodcastItem,
  WhitepaperItem, TenderItem, ContentAuthor, SnippetListResponse,
} from '@/types/api'

// ── Animations ────────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: d, ease: 'easeOut' as const },
  }),
}

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: '#e9ffe8', text: '#2c8502' },
  Intermediate: { bg: '#fff8e8', text: '#855a02' },
  Advanced:     { bg: '#ffe8e8', text: '#8b0000' },
}

// ── Spotlight (cross-content-type "Editor's Pick") ──────────────────────────────

type SpotlightKind = 'tech' | 'case' | 'blog' | 'video' | 'podcast'

interface SpotlightData {
  kind: SpotlightKind
  id: number
  title: string
  excerpt: string
  date: string
  imageUrl: string | null
  linkTo: string
  badges: string[]
  metaRight: string
  ctaLabel: string
}

function toSpotlight(kind: SpotlightKind, item: TechArticleItem | CaseStudyItem | BlogPostItem | VideoItem | PodcastItem): SpotlightData {
  switch (kind) {
    case 'tech': {
      const a = item as TechArticleItem
      return { kind, id: a.id, title: a.title, excerpt: a.excerpt, date: a.date, imageUrl: a.image_url, linkTo: `/geacademy/${a.id}`, badges: [a.difficulty, a.topic], metaRight: a.read_time, ctaLabel: 'Read on GeAcademy' }
    }
    case 'case': {
      const c = item as CaseStudyItem
      return { kind, id: c.id, title: c.title, excerpt: c.excerpt, date: c.date, imageUrl: c.image_url, linkTo: `/research/${c.id}`, badges: [c.category], metaRight: c.read_time, ctaLabel: 'Read the Research' }
    }
    case 'blog': {
      const b = item as BlogPostItem
      return { kind, id: b.id, title: b.title, excerpt: b.excerpt, date: b.date, imageUrl: b.image_url, linkTo: `/blog/${b.id}`, badges: [b.topic], metaRight: b.author?.display_name ?? 'Genex Engineering Team', ctaLabel: 'Read the Full Post' }
    }
    case 'video': {
      const v = item as VideoItem
      return { kind, id: v.id, title: v.title, excerpt: v.excerpt, date: v.date, imageUrl: v.image_url, linkTo: `/videos/${v.id}`, badges: [v.category], metaRight: v.duration, ctaLabel: 'Watch the Video' }
    }
    case 'podcast': {
      const p = item as PodcastItem
      return { kind, id: p.id, title: p.title, excerpt: p.description, date: p.date, imageUrl: p.image_url, linkTo: `/podcasts/${p.id}`, badges: [p.category], metaRight: p.duration, ctaLabel: 'Listen to the Episode' }
    }
  }
}

// ── Content-preview row (Tier A) ─────────────────────────────────────────────────

interface PreviewCardData {
  id: number
  title: string
  imageUrl: string | null
  linkTo: string
  subtitle: string
}

function PreviewCard({ data, index }: { data: PreviewCardData; index: number }) {
  return (
    <motion.div
      custom={index * 0.06}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' as const }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
    >
      <Link
        to={data.linkTo}
        className="group flex flex-col bg-white border border-[#e9e9e9] rounded-3xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] hover:border-primary/40 hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)] transition-shadow duration-300"
      >
        <div className="aspect-video bg-[#eef2f6] flex items-center justify-center overflow-hidden">
          {data.imageUrl ? (
            <img src={getMediaUrl(data.imageUrl)} alt={data.title} loading="lazy" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9aa5b1]">No Image</span>
          )}
        </div>
        <div className="p-5 flex flex-col gap-2">
          <h4 className="text-[15px] font-bold text-[#0f172b] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {data.title}
          </h4>
          <span className="text-xs text-text-muted font-medium">{data.subtitle}</span>
        </div>
      </Link>
    </motion.div>
  )
}

function TypeRow({ title, description, viewAllHref, count, items }: {
  title: string
  description: string
  viewAllHref: string
  count: number
  items: PreviewCardData[]
}) {
  if (count === 0) return null
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-[22px] font-bold text-[#0f172b] mb-1">{title}</h3>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
        <Link to={viewAllHref} className="shrink-0 text-sm font-bold text-primary whitespace-nowrap">
          View all {count} →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item, i) => <PreviewCard key={item.id} data={item} index={i} />)}
      </div>
    </div>
  )
}

function TypeInfoBar({ icon, label, count, noun, href }: {
  icon: ReactNode
  label: string
  count: number
  noun: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="flex items-center gap-4 px-7 py-5 border border-[#e5e7eb] rounded-2xl hover:border-primary/40 transition-colors"
    >
      <span className="text-text-muted">{icon}</span>
      <span className="text-[15px] font-bold text-[#0f172b] flex-1">{label}</span>
      <span className="text-sm font-semibold text-text-muted">{count} {noun}</span>
      <span className="text-sm font-bold text-primary whitespace-nowrap">Browse all →</span>
    </Link>
  )
}

// ── Contributors ──────────────────────────────────────────────────────────────

function ContributorChip({ author }: { author: ContentAuthor }) {
  const initials = author.display_name.slice(0, 2).toUpperCase()
  return (
    <Link
      to={`/u/${author.username}`}
      className="flex-1 min-w-55 flex items-center gap-3.5 bg-white border border-[#e5e7eb] rounded-2xl px-5 py-4 hover:border-primary/40 transition-colors"
    >
      <div className="size-12 rounded-full bg-linear-to-br from-primary to-secondary text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
        {author.avatar_url ? (
          <img src={getMediaUrl(author.avatar_url)} alt="" className="w-full h-full object-cover" />
        ) : initials}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-[#0f172b] truncate">{author.display_name}</div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted min-w-0">
          {author.role_title && <span className="truncate">{author.role_title}</span>}
          {author.role_title && author.company && <span aria-hidden="true">·</span>}
          {author.company && <CompanyBadge company={author.company} />}
        </div>
      </div>
    </Link>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function GeLearn() {
  const { user } = useAuth()
  const [techArticles, setTechArticles] = useState<TechArticleItem[]>([])
  const [techCount, setTechCount] = useState(0)
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([])
  const [caseCount, setCaseCount] = useState(0)
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([])
  const [blogCount, setBlogCount] = useState(0)
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [videoCount, setVideoCount] = useState(0)
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([])
  const [podcastCount, setPodcastCount] = useState(0)
  const [whitepaperCount, setWhitepaperCount] = useState(0)
  const [tenderCount, setTenderCount] = useState(0)

  useEffect(() => {
    apiFetch<SnippetListResponse<TechArticleItem>>('/api/snippets/tech-articles/?limit=6')
      .then(res => { setTechArticles(res.results); setTechCount(res.count) })
      .catch(() => {})
    apiFetch<SnippetListResponse<CaseStudyItem>>('/api/snippets/case-studies/?limit=6')
      .then(res => { setCaseStudies(res.results); setCaseCount(res.count) })
      .catch(() => {})
    apiFetch<SnippetListResponse<BlogPostItem>>('/api/snippets/blog-posts/?limit=6')
      .then(res => { setBlogPosts(res.results); setBlogCount(res.count) })
      .catch(() => {})
    apiFetch<SnippetListResponse<VideoItem>>('/api/snippets/videos/?limit=6')
      .then(res => { setVideos(res.results); setVideoCount(res.count) })
      .catch(() => {})
    apiFetch<SnippetListResponse<PodcastItem>>('/api/snippets/podcasts/?limit=6')
      .then(res => { setPodcasts(res.results); setPodcastCount(res.count) })
      .catch(() => {})
    apiFetch<SnippetListResponse<WhitepaperItem>>('/api/snippets/whitepapers/?limit=1')
      .then(res => setWhitepaperCount(res.count))
      .catch(() => {})
    apiFetch<SnippetListResponse<TenderItem>>('/api/snippets/tenders/?limit=1')
      .then(res => setTenderCount(res.count))
      .catch(() => {})
  }, [])

  // Editor's Pick: first featured item found across types (fixed priority
  // order), else the single most recent item across all fetched types.
  const spotlight: SpotlightData | null = (() => {
    const featuredTech = techArticles.find(a => a.featured)
    if (featuredTech) return toSpotlight('tech', featuredTech)
    const featuredCase = caseStudies.find(c => c.featured)
    if (featuredCase) return toSpotlight('case', featuredCase)
    const featuredBlog = blogPosts.find(b => b.featured)
    if (featuredBlog) return toSpotlight('blog', featuredBlog)
    const featuredVideo = videos.find(v => v.featured)
    if (featuredVideo) return toSpotlight('video', featuredVideo)
    const featuredPodcast = podcasts.find(p => p.featured)
    if (featuredPodcast) return toSpotlight('podcast', featuredPodcast)

    const candidates: SpotlightData[] = [
      ...techArticles.map(a => toSpotlight('tech', a)),
      ...caseStudies.map(c => toSpotlight('case', c)),
      ...blogPosts.map(b => toSpotlight('blog', b)),
      ...videos.map(v => toSpotlight('video', v)),
      ...podcasts.map(p => toSpotlight('podcast', p)),
    ]
    if (candidates.length === 0) return null
    return candidates.reduce((latest, c) => (c.date > latest.date ? c : latest))
  })()

  const contributors: ContentAuthor[] = (() => {
    const seen = new Map<string, ContentAuthor>()
    for (const author of [...blogPosts.map(p => p.author), ...videos.map(v => v.author), ...podcasts.flatMap(p => p.collaborators)]) {
      if (author && !seen.has(author.username)) seen.set(author.username, author)
    }
    return [...seen.values()].slice(0, 6)
  })()

  return (
    <main>
      <PageMeta
        title="GeLearn — Energy Knowledge Hub by Genex"
        description="GeAcademy, research, policies & tenders, whitepapers, video library, and insights from Genex Technocrats — India's energy intelligence platform."
        canonical="/"
      />

      {/* ── Hero — centered, compact, animated entrance ── */}
      <section className="relative bg-brand-tint py-20 overflow-hidden" aria-label="Page hero">
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center gap-5">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05, ease: 'easeOut' }} className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Knowledge Hub
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18, ease: 'easeOut' }} className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
            GeLearn
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.32, ease: 'easeOut' }} className="text-base text-text-muted leading-relaxed">
            Deep engineering knowledge from the team that builds, operates, and innovates across India's power infrastructure — written by the engineers doing the work, not marketing.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.46, ease: 'easeOut' }} className="flex gap-4 mt-1">
            <a href="#browse" className="animate-pulse-glow bg-linear-to-br from-primary to-secondary text-white text-sm font-bold px-7 py-3.5 rounded-lg hover:opacity-90 transition-opacity">
              Browse All Content
            </a>
            {!user && (
              <Link to="/login" className="border border-border bg-white text-text-primary text-sm font-bold px-7 py-3.5 rounded-lg hover:border-primary hover:text-primary transition-colors">
                Become a Contributor
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Stats strip (real counts) ── */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatedStat value={`${techCount}`} label="Technical Articles" accent="text-transparent bg-clip-text bg-linear-to-br from-primary to-secondary" labelClassName="text-text-muted" />
          <AnimatedStat value={`${caseCount}`} label="Research" accent="text-transparent bg-clip-text bg-linear-to-br from-primary to-secondary" labelClassName="text-text-muted" />
          <AnimatedStat value={`${blogCount}`} label="Blog Posts" accent="text-transparent bg-clip-text bg-linear-to-br from-primary to-secondary" labelClassName="text-text-muted" />
          <AnimatedStat value={`${videoCount + podcastCount}`} label="Videos & Podcasts" accent="text-transparent bg-clip-text bg-linear-to-br from-primary to-secondary" labelClassName="text-text-muted" />
        </div>
      </section>

      {/* ── Featured spotlight ── */}
      {spotlight && (
        <section className="bg-brand-tint py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-6">Editor's Pick</p>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' as const }}
              className="flex flex-col lg:flex-row bg-white border border-[#e9e9e9] rounded-3xl overflow-hidden shadow-[0px_10px_30px_rgba(26,174,232,0.1)]"
            >
              <div className="lg:w-[44%] shrink-0 aspect-video lg:aspect-auto bg-[#eef2f6] flex items-center justify-center overflow-hidden">
                {spotlight.imageUrl ? (
                  <img src={getMediaUrl(spotlight.imageUrl)} alt={spotlight.title} loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest text-[#9aa5b1]">No Image</span>
                )}
              </div>
              <div className="flex-1 p-8 lg:p-12 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {spotlight.badges.map(badge => {
                    const diff = DIFFICULTY_STYLE[badge]
                    return (
                      <span
                        key={badge}
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={diff ? { background: diff.bg, color: diff.text } : { background: '#f7f7f7', color: '#3f3f3f' }}
                      >
                        {badge}
                      </span>
                    )
                  })}
                </div>
                <h2 className="text-[28px] lg:text-3xl font-extrabold text-[#0f172b] leading-tight">{spotlight.title}</h2>
                <p className="text-[15px] text-[#45556c] leading-relaxed line-clamp-3">{spotlight.excerpt}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
                  <span>{spotlight.metaRight}</span><span>·</span><span>{formatDisplayDate(spotlight.date)}</span>
                </div>
                <Link
                  to={spotlight.linkTo}
                  className="self-start mt-2 bg-[#0f172b] text-white text-sm font-bold px-6 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {spotlight.ctaLabel} →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Browse by Type ── */}
      <section id="browse" className="bg-white py-20 lg:py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col gap-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Browse by Type</p>

          <TypeRow
            title="GeAcademy"
            description="In-depth technical breakdowns of our SCADA, EMS, grid management, and IoT systems."
            viewAllHref="/geacademy"
            count={techCount}
            items={techArticles.slice(0, 3).map(a => ({ id: a.id, title: a.title, imageUrl: a.image_url, linkTo: `/geacademy/${a.id}`, subtitle: `${formatDisplayDate(a.date)} · ${a.read_time}` }))}
          />
          <TypeRow
            title="Blog & Insights"
            description="Engineering perspectives, industry commentary, and technical articles from our team."
            viewAllHref="/blog"
            count={blogCount}
            items={blogPosts.slice(0, 3).map(p => ({ id: p.id, title: p.title, imageUrl: p.image_url, linkTo: `/blog/${p.id}`, subtitle: p.author ? `${formatDisplayDate(p.date)} · by ${p.author.display_name}` : formatDisplayDate(p.date) }))}
          />
          <TypeRow
            title="Video Library"
            description="Product walkthroughs, installation guides, live system demos, and event coverage."
            viewAllHref="/videos"
            count={videoCount}
            items={videos.slice(0, 3).map(v => ({ id: v.id, title: v.title, imageUrl: v.image_url, linkTo: `/videos/${v.id}`, subtitle: `${v.duration} · ${v.category}` }))}
          />
          <TypeRow
            title="Podcasts & Interviews"
            description="Conversations with engineers, plant operators, and sector leaders about the energy transition."
            viewAllHref="/podcasts"
            count={podcastCount}
            items={podcasts.slice(0, 3).map(p => ({ id: p.id, title: p.title, imageUrl: p.image_url, linkTo: `/podcasts/${p.id}`, subtitle: `with ${p.guest}, ${p.guest_role}` }))}
          />
          <TypeRow
            title="Research"
            description="Real project outcomes with verified performance data, deployment scale, and client impact."
            viewAllHref="/research"
            count={caseCount}
            items={caseStudies.slice(0, 3).map(c => ({ id: c.id, title: c.title, imageUrl: c.image_url, linkTo: `/research/${c.id}`, subtitle: `${c.category} · ${c.read_time}` }))}
          />

          <div className="flex flex-col gap-3">
            <TypeInfoBar icon={<DescriptionOutlinedIcon style={{ fontSize: 20 }} />} label="Whitepapers & Reports" count={whitepaperCount} noun="documents available" href="/whitepapers" />
            <TypeInfoBar icon={<GavelOutlinedIcon style={{ fontSize: 20 }} />} label="Policies & Tenders" count={tenderCount} noun="active listings" href="/policies-tenders" />
          </div>
        </div>
      </section>

      {/* ── Contributors ── */}
      {contributors.length > 0 && (
        <section className="bg-[#e8f8f5] py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-start gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">From Our Contributors</p>
            <h2 className="text-3xl font-extrabold text-[#0f172b]">Written by the engineers who operate these systems</h2>
            <p className="text-[15px] text-text-muted max-w-xl mb-6">Every byline on GeLearn is a real Genex engineer, operator, or partner — not a marketing team.</p>
            <div className="flex flex-wrap gap-4 w-full">
              {contributors.map(author => <ContributorChip key={author.username} author={author} />)}
            </div>
          </div>
        </section>
      )}

      <CTABand
        eyebrow="Open Knowledge"
        heading="Have content to contribute or a topic to suggest?"
        description="We collaborate with engineers, researchers, and operators across the energy sector."
        primaryText="Get in Touch"
        primaryLink={marketingPath('/contact')}
        secondaryText="Explore All Content"
        secondaryLink="/geacademy"
      />
    </main>
  )
}
