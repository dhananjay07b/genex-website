import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { RichText } from '@/components/ui/RichText'
import { buttonVariants } from '@/components/ui/Button'
import { CTABandBlockSection } from '@/components/content-blocks/CTABandBlockSection'
import { apiFetch } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import NotFound from '@/pages/NotFound'
import type { CTABandValue, IntroductionSectionValue, JobPageData, WagtailListResponse } from '@/types/api'

/**
 * One opening at /careers/:slug, from a Job Page added with "+" under Careers in
 * the CMS. Intro blocks become the sections of the job description; CTA blocks
 * follow it as bands. Closed roles stay reachable (old links keep working) but
 * say so instead of offering to apply.
 */
export default function JobDetail() {
  const { slug = '' } = useParams()
  // Each result remembers the slug it was loaded for; anything older counts as still loading.
  const [loaded, setLoaded] = useState<{ slug: string; job: JobPageData | null } | null>(null)

  useEffect(() => {
    apiFetch<WagtailListResponse<JobPageData>>(
      `/api/v2/pages/?type=pages.JobPage&slug=${encodeURIComponent(slug)}&fields=*&limit=1`,
    )
      .then(res => setLoaded({ slug, job: res.items[0] ?? null }))
      .catch(() => setLoaded({ slug, job: null }))
  }, [slug])

  const job = loaded?.slug === slug ? loaded.job : undefined
  if (job === undefined) return <PageSkeleton />
  if (job === null) return <NotFound />

  const applyLink = `/contact?subject=${encodeURIComponent(`Application: ${job.title}`)}`
  const sections = job.body.filter(b => b.type === 'intro').map(b => ({ id: b.id, ...(b.value as IntroductionSectionValue) }))
  const ctas = job.body.filter(b => b.type === 'cta')

  return (
    <main>
      <PageMeta
        title={job.seo_title || `${job.title} | Careers`}
        description={job.search_description || job.description || `${job.title} at Genex Technocrats.`}
        canonical={`/careers/${slug}`}
        noIndex={!job.is_open}
      />
      <PageHero
        label={job.department ? `Careers · ${job.department}` : 'Careers'}
        headline={job.title}
        subline={job.description || undefined}
        ctaText={job.is_open ? 'Apply Now' : null}
        ctaLink={job.is_open ? applyLink : null}
      />

      <section className="bg-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            to="/careers#positions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-muted hover:text-primary transition-colors mb-10"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            All open positions
          </Link>

          {!job.is_open && (
            <div className="mb-10 rounded-2xl border border-border bg-surface px-6 py-5">
              <p className="text-base font-extrabold text-text-primary">This position has been filled.</p>
              <p className="mt-1 text-sm text-text-muted">
                Thank you for your interest. See our <Link to="/careers#positions" className="text-primary font-semibold hover:underline">current openings</Link>, or send us your profile for future roles.
              </p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-2 flex flex-col gap-12">
              {sections.length === 0 && (
                <p className="text-base text-text-muted leading-relaxed">{job.description}</p>
              )}
              {sections.map((section, i) => (
                <motion.article
                  key={section.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' as const }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' as const }}
                  className={cn(i > 0 && 'pt-12 border-t border-border')}
                >
                  {section.heading && (
                    <h2 className="text-2xl font-extrabold text-text-primary leading-tight mb-5">{section.heading}</h2>
                  )}
                  <RichText
                    html={section.description}
                    className="text-base text-text-muted leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-2 [&_p+p]:mt-4 [&_strong]:text-text-primary [&_b]:text-text-primary [&_a]:text-primary [&_a]:font-semibold"
                  />
                  {section.note && (
                    <p className="mt-5 inline-flex px-4 py-2 rounded-full bg-primary/10 text-sm font-semibold text-primary">{section.note}</p>
                  )}
                </motion.article>
              ))}
            </div>

            <aside className="lg:sticky lg:top-28 rounded-2xl border border-border bg-surface p-6 lg:p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Role summary</p>
              <dl className="flex flex-col gap-4 text-sm">
                {[
                  ['Department', job.department],
                  ['Location', job.location],
                  ['Type', job.job_type],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-4">
                    <dt className="text-text-muted">{label}</dt>
                    <dd className="font-semibold text-text-primary text-right">{value}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-text-muted">Status</dt>
                  <dd className={cn('font-semibold', job.is_open ? 'text-primary' : 'text-text-muted')}>
                    {job.is_open ? 'Open' : 'Filled'}
                  </dd>
                </div>
              </dl>
              {job.is_open && (
                <Link to={applyLink} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-8 w-full')}>
                  Apply Now
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>

      {ctas.map(b => <CTABandBlockSection key={b.id} value={b.value as CTABandValue} />)}
    </main>
  )
}
