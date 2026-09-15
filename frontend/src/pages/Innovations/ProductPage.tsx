import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined'
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageMeta } from '@/components/seo/PageMeta'
import { CTABand } from '@/components/ui/CTABand'
import { renderStreamField } from '@/lib/streamfield/renderStreamField'
import { blockRegistry } from '@/lib/streamfield/blockRegistry'
import { apiFetch } from '@/lib/api/client'
import type { CTABandValue, InnovationPageData, WagtailListResponse } from '@/types/api'

const CATEGORY_LABEL: Record<string, string> = {
  monitoring: 'Monitoring',
  ai:         'AI & Analytics',
  storage:    'Energy Storage',
  grid:       'Grid & Utilities',
  ev:         'EV',
}

type InnovationStage = 'research' | 'prototype' | 'deployed' | 'scaled'

const STAGE_ICONS: Record<InnovationStage, ReactNode> = {
  research:  <ScienceOutlinedIcon style={{ fontSize: 14 }} />,
  prototype: <BiotechOutlinedIcon style={{ fontSize: 14 }} />,
  deployed:  <RocketLaunchOutlinedIcon style={{ fontSize: 14 }} />,
  scaled:    <VerifiedOutlinedIcon style={{ fontSize: 14 }} />,
}

const STAGE_PILL: Record<InnovationStage, string> = {
  research:  'bg-slate-100 text-slate-700 border-slate-200',
  prototype: 'bg-amber-50 text-amber-700 border-amber-200',
  deployed:  'bg-sky-50 text-sky-700 border-sky-200',
  scaled:    'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const STAGE_LABEL: Record<InnovationStage, string> = {
  research:  'Research',
  prototype: 'Prototype',
  deployed:  'Deployed',
  scaled:    'Scaled',
}

export default function InnovationProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<InnovationPageData | null | undefined>(undefined)
  const [allProducts, setAllProducts] = useState<InnovationPageData[]>([])

  useEffect(() => {
    if (!slug) { setProduct(null); return }
    apiFetch<WagtailListResponse<InnovationPageData>>(
      `/api/v2/pages/?type=pages.InnovationPage&fields=badge,category,stage,headline,subline,image_url,icon_url,meta_title,meta_description,hide_footer_cta,body&slug=${slug}&limit=1`
    )
      .then(res => setProduct(res.items[0] ?? null))
      .catch(() => setProduct(null))

    apiFetch<WagtailListResponse<InnovationPageData>>(
      '/api/v2/pages/?type=pages.InnovationPage&fields=badge,category&limit=50'
    )
      .then(res => setAllProducts(res.items))
      .catch(() => setAllProducts([]))
  }, [slug])

  if (product === undefined) return null
  if (product === null) return <Navigate to="/innovations" replace />

  const related = allProducts.filter(p => p.meta.slug !== slug).slice(0, 3)
  const bodyBlocks = product.body.filter(b => b.type !== 'cta')
  const ctaBlock = product.body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  const stage = product.stage as InnovationStage
  const stagePill = STAGE_PILL[stage] ?? 'bg-slate-100 text-slate-700 border-slate-200'
  const stageIcon = STAGE_ICONS[stage] ?? null
  const stageLabel = STAGE_LABEL[stage] ?? stage

  return (
    <main>
      <PageMeta
        title={product.meta_title || product.headline}
        description={product.meta_description || product.subline}
        canonical={`/innovations/${slug}`}
        image={product.icon_url || product.image_url}
      />

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#f0f8ff] border-b border-[#e5e7eb] py-20 lg:py-28 overflow-hidden">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Light overlay keeps hero text legible over the product image */}
            <div className="absolute inset-0 bg-white/80" aria-hidden="true" />
          </>
        ) : (
          <div
            className="absolute -top-40 -right-40 w-md h-112 rounded-full blur-3xl opacity-30 bg-linear-to-br from-slate-200 to-slate-300"
            aria-hidden="true"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' as const }}
          >
            <div className="flex items-center gap-3 mb-6">
              {stage && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest border rounded-full ${stagePill}`}>
                  {stageIcon}
                  {stageLabel}
                </span>
              )}
              {product.category && (
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-[#f0f4f8] text-[#62748e] rounded-full">
                  {CATEGORY_LABEL[product.category] ?? product.category}
                </span>
              )}
              {product.badge && (
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#162456] leading-tight mb-5 max-w-3xl">
              {product.headline || product.title}
            </h1>
            <p className="text-lg text-[#45556c] leading-relaxed max-w-2xl mb-10">
              {product.subline}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request Early Access</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Talk to an Engineer</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BODY (stream order — whatever order the editor arranged blocks in) ──── */}
      {renderStreamField(bodyBlocks, blockRegistry)}

      {/* ── MORE FROM INNOVATIONS ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-start justify-between mb-10">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, ease: 'easeOut' as const }}
              >
                <h2 className="text-4xl font-bold text-[#162456] capitalize mb-3">
                  More From Our Innovations
                </h2>
                <p className="text-lg text-[#45556c]">
                  Explore our full pipeline of power intelligence platforms.
                </p>
              </motion.div>
              <Link
                to="/innovations"
                className="shrink-0 mt-2 flex items-center gap-1.5 px-6 py-3 bg-[#f0f4f8] text-[#0f2930] text-sm font-bold rounded-full hover:bg-[#e5ebf0] transition-colors duration-200"
              >
                View All <ArrowForwardIcon style={{ fontSize: 16 }} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' as const }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const }}
                >
                  <Link
                    to={`/innovations/${p.meta.slug}`}
                    className="group block relative h-72 rounded-3xl overflow-hidden bg-linear-to-br from-slate-200 to-slate-300"
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6">
                      <p className="text-xs text-white/60 uppercase tracking-widest mb-1 font-medium">
                        {CATEGORY_LABEL[p.category] ?? p.category}
                      </p>
                      <p className="text-2xl font-bold text-white leading-tight">{p.title}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <CTABand
        cta={ctaBlock}
        eyebrow="Get Early Access"
        heading={`Interested in ${product.title}?`}
        description="Talk to our engineering team about pilots, early access, and deployment timelines."
        primaryText="Request a Demo"
        primaryLink="/contact#demo"
        secondaryText="Contact Us"
        secondaryLink="/contact"
        hideFooterCta={product.hide_footer_cta}
      />
    </main>
  )
}
