import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { CTABand } from '@/components/ui/CTABand'
import { apiFetch } from '@/lib/api/client'
import type {
  CapabilitiesSectionValue,
  ContentPageData,
  CTABandValue,
  HeroSectionApiValue,
  SectionPageData,
  WagtailListResponse,
} from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function InnovationCard({ item }: { item: ContentPageData }) {
  const capabilities = (item.body.find(b => b.type === 'capabilities')?.value as CapabilitiesSectionValue | undefined)?.items ?? []
  const summary = capabilities[0]?.text ?? ''
  return (
    <motion.div
      variants={staggerChild}
      className="flex flex-col p-10 bg-white border border-[#e2e8f0]"
      whileHover={{ y: -6, boxShadow: 'inset 0 3px 0 #1AAEE8, 0 16px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {item.icon_url ? (
        <img src={item.icon_url} alt="" aria-hidden="true" className="w-12 h-12 mb-6 rounded-xl object-cover" />
      ) : (
        <div className="w-12 h-12 mb-6 rounded-xl bg-linear-to-br from-slate-200 to-slate-300" />
      )}

      <p className="text-2xl font-bold text-[#1d293d] leading-tight mb-3">{item.title}</p>
      <p className="text-[15px] text-[#45556c] leading-7 flex-1">{summary}</p>

      <Link
        to={`/innovations/${item.meta.slug}`}
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200 self-start"
      >
        Read More &rarr;
      </Link>
    </motion.div>
  )
}

export default function Innovations() {
  const [section, setSection] = useState<SectionPageData | null | undefined>(undefined)
  const [innovations, setInnovations] = useState<ContentPageData[]>([])

  useEffect(() => {
    apiFetch<WagtailListResponse<SectionPageData>>('/api/v2/pages/?type=pages.SectionPage&slug=innovations&fields=*&limit=1')
      .then(res => {
        const page = res.items[0]
        setSection(page ?? null)
        if (page) {
          apiFetch<WagtailListResponse<ContentPageData>>(
            `/api/v2/pages/?type=pages.ContentPage&child_of=${page.id}&fields=tags,icon_url,body&limit=100`
          )
            .then(r => setInnovations(r.items))
            .catch(() => setInnovations([]))
        }
      })
      .catch(() => setSection(null))
  }, [])

  if (section === undefined) return null

  const body = section?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  return (
    <main>
      <PageMeta
        title={section?.seo_title || 'Innovations — Genex Technocrats'}
        description={section?.search_description || "Innovation platforms built for India's power sector."}
        canonical="/innovations"
      />

      <PageHero
        label={hero?.label ?? 'Innovation'}
        headline={hero?.heading ?? 'Our Innovations'}
        subline={hero?.description ?? "Engineering platforms that push what's possible in India's energy infrastructure — built in-house, deployed at scale."}
      />

      {/* ── CARD GRID ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' as const }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-[#e2e8f0]"
          >
            {innovations.map((item) => (
              <InnovationCard key={item.id} item={item} />
            ))}
          </motion.div>
        </div>
      </section>

      <CTABand
        cta={cta}
        eyebrow="Partner With Genex"
        heading="Interested in early access or a pilot?"
        description="Our engineering team works directly with operators, utilities, and developers to scope, pilot, and deploy — from a single site to a national rollout."
        primaryText="Request a Demo"
        primaryLink="/contact#demo"
        secondaryText="Contact Us"
        secondaryLink="/contact"
        hideFooterCta={section?.hide_footer_cta}
      />
    </main>
  )
}
