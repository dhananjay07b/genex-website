import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type {
  AchievementApiValue,
  CTABandValue,
  GalleryItemApiValue,
  HeroSectionApiValue,
  MediaPageData,
  PressItemApiValue,
  WagtailListResponse,
} from '@/types/api'

// ── Animation presets ─────────────────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.6, ease: 'easeOut' as const, delay },
})

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ── Reusable section eyebrow ──────────────────────────────────────────────────

function SectionEyebrow({ label, centered = false }: { label: string; centered?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-3${centered ? ' justify-center' : ''}`}>
      <motion.div
        className="h-0.5 w-10 gradient-brand rounded-full origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        aria-hidden="true"
      />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const ACHIEVEMENT_ICON: Record<AchievementApiValue['icon_type'], typeof WorkspacePremiumOutlinedIcon> = {
  certificate: WorkspacePremiumOutlinedIcon,
  award: EmojiEventsOutlinedIcon,
}

export default function Media() {
  const [page, setPage] = useState<MediaPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<MediaPageData>>('/api/v2/pages/?type=pages.MediaPage&fields=body&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  if (page === undefined) return null

  const body = page?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const achievements = (body.find(b => b.type === 'achievements')?.value as AchievementApiValue[] | undefined) ?? []
  const pressItems = (body.find(b => b.type === 'press_items')?.value as PressItemApiValue[] | undefined) ?? []
  const gallery = (body.find(b => b.type === 'gallery')?.value as GalleryItemApiValue[] | undefined) ?? []
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  const orderedPress = [...pressItems].sort((a, b) => Number(b.featured) - Number(a.featured))
  const featured = orderedPress[0]
  const rest = orderedPress.slice(1, 4)

  return (
    <>
      <PageMeta
        title="Media & Achievements — Genex Technocrats"
        description="Awards, certifications, and press coverage for Genex Technocrats — recognised at India Solar Week and Delhi Solar Week for innovation in energy monitoring technology."
        canonical="/about/media"
      />

      <PageHero
        label={hero?.label ?? 'About Genex'}
        headline={hero?.heading ?? 'Media & Achievements'}
        subline={hero?.description ?? "Awards, certifications, and the milestones that mark our journey as India's energy intelligence company."}
      />

      {/* ── ACHIEVEMENTS ──────────────────────────────────────────────────────── */}
      <section className="bg-white overflow-hidden" aria-label="Awards and certifications">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {achievements.map((ach, i) => {
            const Icon = ACHIEVEMENT_ICON[ach.icon_type] ?? WorkspacePremiumOutlinedIcon
            const isOdd = i % 2 !== 0
            return (
              <div
                key={ach.heading}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                  i === 0 ? 'py-20 lg:py-28' : 'pb-20 lg:pb-28 pt-16 lg:pt-24 border-t border-border'
                }`}
              >
                {/* Certificate image frame */}
                <motion.div
                  {...fadeUp(0)}
                  className={`relative ${isOdd ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {/* Tilted bg swatch */}
                  <div
                    className="absolute -inset-3 bg-[rgba(220,235,254,0.55)] rounded-3xl rotate-3"
                    aria-hidden="true"
                  />
                  {/* Image card — landscape to match actual cert dimensions */}
                  <motion.div
                    whileHover={{ y: -6, boxShadow: '0 24px 60px rgba(26,174,232,0.18)' }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-2xl border border-[#dcebfe] shadow-2xl aspect-video"
                  >
                    {ach.image && (
                      <img
                        src={getMediaUrl(ach.image.url)}
                        alt={ach.image_alt ?? ach.heading}
                        className="w-full h-full object-cover object-top"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        width={ach.image.width}
                        height={ach.image.height}
                      />
                    )}
                  </motion.div>
                </motion.div>

                {/* Text content */}
                <motion.div
                  {...fadeUp(0.14)}
                  className={`space-y-6 ${isOdd ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20">
                    <Icon sx={{ fontSize: 16, color: '#1AAEE8' }} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                      {ach.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl lg:text-[32px] font-extrabold text-text-primary leading-tight">
                    {ach.heading}
                  </h2>

                  <div
                    className="text-[17px] text-text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: ach.body }}
                  />
                </motion.div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── MEDIA & PRESS ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F1F3F5] border-y border-border py-20 lg:py-28" aria-label="Media and press">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <motion.div {...fadeUp(0)} className="mb-10">
            <SectionEyebrow label="Media & Press" />
            <h2 className="text-3xl lg:text-[36px] font-extrabold text-text-primary leading-tight">
              Media &amp; Press
            </h2>
            <p className="text-lg text-text-muted mt-2 leading-relaxed">
              A glimpse into the physical infrastructure our software empowers.
            </p>
          </motion.div>

          {/* Bento grid — 4 col × 2 row, fixed 560px tall on desktop */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' as const }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:h-140"
            style={{ gridTemplateRows: 'repeat(2, 1fr)' }}
          >
            {/* Featured — col-span-2 row-span-2 */}
            {featured && (
            <motion.div
              variants={staggerChild}
              className="group relative col-span-2 lg:col-span-2 lg:row-span-2 overflow-hidden rounded-2xl border border-border shadow-sm h-64 lg:h-auto cursor-pointer"
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={getMediaUrl(featured.image.url)}
                alt={featured.alt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="eager"
                width={featured.image.width ?? 1920}
                height={featured.image.height ?? 1080}
              />
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-[rgba(22,36,86,0.8)] via-[rgba(22,36,86,0)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Caption — slides up on hover */}
              {(featured.caption || featured.subcaption) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {featured.caption && <p className="text-white font-bold text-lg leading-tight">{featured.caption}</p>}
                  {featured.subcaption && <p className="text-blue-200 text-sm mt-1">{featured.subcaption}</p>}
                </div>
              )}
            </motion.div>
            )}

            {/* Top-right small — col 3, row 1 */}
            {rest[0] && (
            <motion.div
              variants={staggerChild}
              className="group relative col-span-1 overflow-hidden rounded-2xl border border-border shadow-sm h-40 lg:h-auto cursor-pointer"
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={getMediaUrl(rest[0].image.url)}
                alt={rest[0].alt}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                width={rest[0].image.width ?? 1920}
                height={rest[0].image.height ?? 1080}
              />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-[rgba(22,36,86,0.55)] to-transparent" />
            </motion.div>
            )}

            {/* Top-right small — col 4, row 1 */}
            {rest[1] && (
            <motion.div
              variants={staggerChild}
              className="group relative col-span-1 overflow-hidden rounded-2xl border border-border shadow-sm h-40 lg:h-auto cursor-pointer"
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={getMediaUrl(rest[1].image.url)}
                alt={rest[1].alt}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                width={rest[1].image.width ?? 1920}
                height={rest[1].image.height ?? 1280}
              />
            </motion.div>
            )}

            {/* Bottom-right wide — col 3-4, row 2 */}
            {rest[2] && (
            <motion.div
              variants={staggerChild}
              className="group relative col-span-2 overflow-hidden rounded-2xl border border-border shadow-sm h-40 lg:h-auto cursor-pointer"
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={getMediaUrl(rest[2].image.url)}
                alt={rest[2].alt}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
                width={rest[2].image.width ?? 1920}
                height={rest[2].image.height ?? 1080}
              />
            </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── GALLERY ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28" aria-label="Photo gallery">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <motion.div {...fadeUp(0)} className="mb-10">
            <SectionEyebrow label="Gallery" />
            <h2 className="text-3xl lg:text-[36px] font-extrabold text-text-primary leading-tight">
              Gallery
            </h2>
            <p className="text-lg text-text-muted mt-2 leading-relaxed">
              A glimpse into the physical infrastructure our software empowers.
            </p>
          </motion.div>

          {/* CSS masonry columns — 1 mobile, 2 tablet, 3 desktop */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' as const }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-4"
          >
            {gallery.map((item, i) => (
              <div key={i} className="break-inside-avoid mb-4">
                <motion.div
                  variants={staggerChild}
                  className="group relative overflow-hidden rounded-2xl border border-border cursor-pointer"
                  whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={getMediaUrl(item.image.url)}
                    alt={item.alt}
                    className="w-full h-auto object-cover block transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                    width={item.image.width}
                    height={item.image.height}
                  />
                  <div className="absolute inset-0 bg-[rgba(22,36,86,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28 relative overflow-hidden" aria-label="Contact call to action">
        {/* Ambient orbs */}
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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Next Chapter</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              {cta?.heading ?? 'Ready to work with us?'}
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              {cta?.description ?? "Whether you're a solar developer, utility operator, or EPC contractor — let's build the monitoring layer your project deserves."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={cta?.primary_cta_link ?? '/contact'}>
                <Button variant="primary" size="lg">{cta?.primary_cta_text ?? 'Request a Demo'} <ArrowForwardIcon sx={{ fontSize: 16 }} /></Button>
              </Link>
              <Link to={cta?.secondary_cta_link ?? '/portfolio'}>
                <Button variant="secondary" size="lg">{cta?.secondary_cta_text ?? 'View Our Portfolio'}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
