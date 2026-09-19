import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { CTABand } from '@/components/ui/CTABand'
import { AnimatedStat } from '@/components/ui/AnimatedStat'
import { apiFetch } from '@/lib/api/client'
import type {
  CapabilitiesSectionValue,
  ContentPageData,
  CTABandValue,
  HeroSectionApiValue,
  SectionPageData,
  StatsGridSectionValue,
  WagtailListResponse,
} from '@/types/api'

// ── Card ──────────────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: ContentPageData; index: number }) {
  const slug = product.meta.slug
  const tags = product.tags.map(t => t.value)
  const capabilities = (product.body.find(b => b.type === 'capabilities')?.value as CapabilitiesSectionValue | undefined)?.items ?? []
  const summary = capabilities[0]?.text ?? ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' as const }}
      className="group flex flex-col lg:flex-row h-auto lg:h-100 overflow-hidden border border-border hover:border-primary hover:shadow-[0_8px_32px_rgba(26,174,232,0.12)] transition-all duration-300"
    >
      <div className="relative w-full lg:flex-1 h-56 lg:h-auto overflow-hidden shrink-0 bg-linear-to-br from-slate-100 to-slate-200">
        {product.icon_url && (
          <img src={product.icon_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
        {tags[0] && (
          <span className="absolute bottom-4 left-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
            {tags[0]}
          </span>
        )}
      </div>

      <div className="bg-[#f1f5f8] w-full lg:w-83.75 shrink-0 flex flex-col p-10">
        <p className="text-[24px] font-bold text-[#1d293d] leading-tight mb-2">{product.title}</p>
        {tags[0] && (
          <p className="text-[14px] uppercase font-normal text-[#62748e] tracking-wide mb-6">{tags[0]}</p>
        )}
        <p className="text-[16px] text-[#45556c] leading-7.5 flex-1">{summary}</p>
        <Link
          to={`/portfolio/${slug}`}
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#1d293d] hover:text-primary transition-colors duration-200 self-start"
        >
          See More
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Portfolio() {
  const [section, setSection] = useState<SectionPageData | null | undefined>(undefined)
  const [products, setProducts] = useState<ContentPageData[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')

  useEffect(() => {
    apiFetch<WagtailListResponse<SectionPageData>>('/api/v2/pages/?type=pages.SectionPage&slug=portfolio&fields=*&limit=1')
      .then(res => {
        const page = res.items[0]
        setSection(page ?? null)
        if (page) {
          apiFetch<WagtailListResponse<ContentPageData>>(
            `/api/v2/pages/?type=pages.ContentPage&child_of=${page.id}&fields=tags,icon_url,body&limit=100`
          )
            .then(r => setProducts(r.items))
            .catch(() => setProducts([]))
        }
      })
      .catch(() => setSection(null))
  }, [])

  if (section === undefined) return null

  const body = section?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const stats = (body.find(b => b.type === 'stats')?.value as StatsGridSectionValue | undefined)?.stats ?? []
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  const availableTags = Array.from(new Set(products.flatMap(p => p.tags.map(t => t.value))))
  const filtered = activeFilter === 'all' ? products : products.filter(p => p.tags.some(t => t.value === activeFilter))

  return (
    <main>
      <PageMeta
        title={section?.seo_title || 'Software Products for Power & Energy'}
        description={section?.search_description || "Production-grade software products for India's energy sector, engineered by Genex Technocrats."}
        canonical="/portfolio"
      />

      <PageHero
        label={hero?.label ?? 'Our Products'}
        headline={hero?.heading ?? 'See Our Work'}
        subline={hero?.description ?? "Platforms and tools built by Genex engineers and deployed across India's energy infrastructure."}
      />

      {availableTags.length > 0 && (
        <section className="bg-white border-b border-border sticky top-16 z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-4">
              <button
                onClick={() => setActiveFilter('all')}
                className={[
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                  activeFilter === 'all'
                    ? 'gradient-brand text-white shadow-sm'
                    : 'text-text-muted border border-border hover:text-primary hover:bg-surface hover:border-primary',
                ].join(' ')}
              >
                All Products
              </button>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={[
                    'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap',
                    activeFilter === tag
                      ? 'gradient-brand text-white shadow-sm'
                      : 'text-text-muted border border-border hover:text-primary hover:bg-surface hover:border-primary',
                  ].join(' ')}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-col gap-9"
            >
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="bg-primary py-16 lg:py-20" aria-label="Project statistics">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/20">
              {stats.map(({ value, suffix, label }) => (
                <div key={label} className="flex flex-col items-center justify-center py-8 lg:py-0 px-4 lg:px-10">
                  <AnimatedStat value={`${value}${suffix ?? ''}`} label={label} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand
        cta={cta}
        eyebrow="Start a Project"
        heading="Interested in early access or a pilot?"
        description="Talk to our engineering team. We scope, plan, and deliver — from a single site to a national rollout."
        primaryText="Request a Demo"
        primaryLink="/contact#demo"
        secondaryText="Contact Us"
        secondaryLink="/contact"
        hideFooterCta={section?.hide_footer_cta}
      />
    </main>
  )
}
