import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { CTABandValue, HeroSectionApiValue, WagtailListResponse } from '@/types/api'

interface WhyGenexCardApiValue {
  icon: string
  title: string
  description: string
}

interface OpenRoleApiValue {
  title: string
  department: string
  location: string
  type: string
  description: string
}

interface CareersPageData {
  id: number
  title: string
  body: { type: string; value: unknown; id: string }[]
}

export default function Careers() {
  const subject = encodeURIComponent('Open Application — Genex Technocrats')
  const [page, setPage] = useState<CareersPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<CareersPageData>>('/api/v2/pages/?type=pages.CareersPage&fields=body&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  if (page === undefined) return null

  const body = page?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const whyGenex = (body.find(b => b.type === 'why_genex')?.value as WhyGenexCardApiValue[] | undefined) ?? []
  const openRoles = (body.find(b => b.type === 'open_roles')?.value as OpenRoleApiValue[] | undefined) ?? []
  const perks = (body.find(b => b.type === 'perks')?.value as string[] | undefined) ?? []
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  return (
    <main>
      <PageMeta
        title="Careers at Genex Technocrats — Join India's Energy Tech Team"
        description="Work on software that powers India's energy grid. Explore open roles in engineering, AI, and energy systems at Genex Technocrats, Jaipur."
        canonical="/careers"
      />
      <PageHero
        label={hero?.label ?? 'Join Genex'}
        headline={hero?.heading ?? 'Build the Future of Energy'}
        subline={hero?.description ?? "We're a small, senior team solving hard engineering problems in India's energy sector. If you want your work to matter, you're in the right place."}
      />

      {/* Why Genex */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Why Genex</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              We build differently.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {whyGenex.map((item, i) => {
              const Icon = getMuiIcon(item.icon)
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-surface rounded-2xl border border-border p-8"
                >
                  <div className="text-primary mb-5" aria-hidden="true">
                    <Icon sx={{ fontSize: 28 }} />
                  </div>
                  <h3 className="text-base font-extrabold text-text-primary mb-3">{item.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{item.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Culture strip */}
      <section className="bg-surface py-16 lg:py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Culture</p>
              <blockquote className="text-2xl lg:text-3xl font-extrabold text-text-primary leading-tight mb-6">
                "We are not a factory for features. We are a team of engineers who care deeply about the quality of what we ship."
              </blockquote>
              <p className="text-sm text-text-muted leading-relaxed">
                At Genex, every engineer understands the field context behind their code. We visit sites, talk to operators, and build empathy for the people who depend on our software running reliably — often in remote locations with no fallback.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl bg-white border border-border overflow-hidden"
            >
              <div
                className="h-52 bg-linear-to-br from-primary/20 via-secondary/10 to-surface flex items-center justify-center"
                role="img"
                aria-label="Genex engineering team at work"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
                  Team photo coming soon
                </p>
              </div>
              <div className="px-6 py-5 border-t border-border">
                <p className="text-xs text-text-muted">Genex engineering team — Jaipur HQ</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-white py-14 border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Perks & Benefits</p>
          <div className="flex flex-wrap gap-3">
            {perks.map(perk => (
              <span
                key={perk}
                className="px-5 py-2.5 rounded-full border border-border bg-surface text-sm font-semibold text-text-primary"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="bg-surface py-20 lg:py-28 border-t border-border scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Open Positions</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight">
              Current openings.
            </h2>
          </motion.div>

          <div className="space-y-4">
            {openRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white border border-border rounded-2xl px-6 py-6 lg:px-8 lg:py-7 flex flex-col lg:flex-row lg:items-center gap-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex-1">
                  <h3 className="text-base font-extrabold text-text-primary mb-2">{role.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                      {role.department}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                      {role.location}
                    </span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {role.type}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/contact?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
                  className="shrink-0"
                >
                  <Button variant="secondary" size="sm">Apply Now</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open application CTA */}
      <section className="bg-brand-tint py-20 lg:py-28">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Open Application
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight mb-4">
              {cta?.heading ?? "Don't see your role listed?"}
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              {cta?.description ?? "We hire for exceptional engineers and domain experts regardless of open postings. Send us your CV and a short note on what you'd like to build."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`mailto:careers@genextechnocrats.com?subject=${subject}`}
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="lg">{cta?.primary_cta_text ?? 'Send Your Profile'}</Button>
              </a>
              <Link to={cta?.secondary_cta_link ?? '/contact'}>
                <Button variant="secondary" size="lg">{cta?.secondary_cta_text ?? 'Contact Us'}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
