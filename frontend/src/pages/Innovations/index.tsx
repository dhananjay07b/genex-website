import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import type { InnovationPageData, WagtailListResponse } from '@/types/api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' as const },
  transition: { duration: 0.55, ease: 'easeOut' as const, delay },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function InnovationCard({ item }: { item: InnovationPageData }) {
  const firstCapability = item.capabilities?.[0]?.value ?? item.subline
  return (
    <motion.div
      variants={staggerChild}
      className="flex flex-col p-10 bg-white border border-[#e2e8f0]"
      whileHover={{ y: -6, boxShadow: 'inset 0 3px 0 #1AAEE8, 0 16px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {/* Gradient icon placeholder */}
      <div className={`w-12 h-12 mb-6 rounded-xl bg-linear-to-br ${item.gradient || 'from-slate-200 to-slate-300'}`} />

      <p className="text-2xl font-bold text-[#1d293d] leading-tight mb-3">
        {item.title}
      </p>

      <p className="text-[15px] text-[#45556c] leading-7 flex-1">
        {firstCapability}
      </p>

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
  const [innovations, setInnovations] = useState<InnovationPageData[]>([])

  useEffect(() => {
    apiFetch<WagtailListResponse<InnovationPageData>>(
      '/api/v2/pages/?type=pages.InnovationPage&fields=badge,category,stage,headline,subline,gradient,capabilities&limit=50'
    )
      .then(res => setInnovations(res.items))
      .catch(() => setInnovations([]))
  }, [])

  return (
    <main>
      <PageMeta
        title="Innovations — Genex Technocrats"
        description="11 innovation platforms built for India's power sector — from Advanced SCADA and AI monitoring to drone inspection, EV management, and smart grid utilities."
        canonical="/innovations"
      />

      <PageHero
        label="Innovation"
        headline="Our Innovations"
        subline="Engineering platforms that push what's possible in India's energy infrastructure — built in-house, deployed at scale."
      />

      {/* ── INTRO ──────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-16 pb-4">
        <motion.div {...fadeUp(0)} className="max-w-150 mx-auto px-6 text-center">
          <h2 className="text-[36px] font-bold text-[#162456] leading-tight capitalize mb-4">
            Our Innovations
          </h2>
          <p className="text-[18px] text-[#45556c] leading-7.25">
            From real-time network management to AI-driven diagnostics and autonomous drone inspection — every platform is purpose-built for the complexity of India&apos;s power sector.
          </p>
        </motion.div>
      </section>

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

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28 relative overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-md h-112 rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-md h-112 rounded-full bg-secondary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          aria-hidden="true"
        />
        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Partner With Genex
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              Interested in early access or a pilot?
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              Our engineering team works directly with operators, utilities, and developers to scope, pilot, and deploy — from a single site to a national rollout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact#demo">
                <Button variant="primary" size="lg">Request a Demo</Button>
              </Link>
              <Link to="/contact">
                <Button variant="secondary" size="lg">Contact Us</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
