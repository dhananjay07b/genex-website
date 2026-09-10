import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl } from '@/lib/utils'
import type {
  CTABandValue,
  HeroSectionApiValue,
  LeaderApiValue,
  TeamMemberApiValue,
  TeamPageData,
  TeamSectionApiValue,
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
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

// ── Team card ─────────────────────────────────────────────────────────────────

function TeamCard({ member }: { member: TeamMemberApiValue }) {
  return (
    <motion.div
      variants={staggerChild}
      className="group relative overflow-hidden rounded-[15px] shadow-[0px_4px_8.3px_0px_rgba(0,0,0,0.25)] aspect-[342/401] cursor-pointer"
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,217,126,0.2)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Photo */}
      {member.image && (
        <img
          src={getMediaUrl(member.image.url)}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
          loading="lazy"
        />
      )}
      {/* Green gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,216,129,0.92)] from-[0%] via-[rgba(0,216,129,0)] via-[30%] to-transparent to-[30%]" />
      {/* Name + role */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10">
        <p className="text-white font-bold text-[22px] leading-snug">{member.name}</p>
        <p className="text-[#eeeeee] font-semibold text-[16px] leading-snug mt-0.5">{member.role}</p>
      </div>
    </motion.div>
  )
}

// ── Team section ──────────────────────────────────────────────────────────────

function TeamSection({ title, description, members }: { title: string; description: string | null; members: TeamMemberApiValue[] }) {
  return (
    <section className="py-20 lg:py-24 border-t border-border" aria-label={title}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section heading — centered */}
        <motion.div {...fadeUp(0)} className="text-center mb-12 max-w-xl mx-auto">
          <h2 className="text-[24px] font-bold text-[#162456] leading-tight capitalize mb-2">{title}</h2>
          <p className="text-[#45556c] text-[18px] leading-relaxed">{description}</p>
        </motion.div>

        {/* 3-col grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' as const }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {members.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Team() {
  const [page, setPage] = useState<TeamPageData | null | undefined>(undefined)

  useEffect(() => {
    apiFetch<WagtailListResponse<TeamPageData>>('/api/v2/pages/?type=pages.TeamPage&fields=body&limit=1')
      .then(res => setPage(res.items[0] ?? null))
      .catch(() => setPage(null))
  }, [])

  if (page === undefined) return null

  const body = page?.body ?? []
  const hero = body.find(b => b.type === 'hero')?.value as HeroSectionApiValue | undefined
  const leader = body.find(b => b.type === 'leader')?.value as LeaderApiValue | undefined
  const teamSections = body.filter(b => b.type === 'section').map(b => b.value as TeamSectionApiValue)
  const [devTeamSection, opsTeamSection] = teamSections
  const cta = body.find(b => b.type === 'cta')?.value as CTABandValue | undefined

  return (
    <>
      <PageMeta
        title="Our Team — Genex Technocrats"
        description="Meet the engineers, developers, and operators behind Genex Technocrats — the team building India's most advanced energy monitoring and automation platform."
        canonical="/about/team"
      />

      <PageHero
        label={hero?.label ?? 'About Genex'}
        headline={hero?.heading ?? 'Our Team'}
        subline={hero?.description ?? "The engineers, developers, and operators powering India's energy intelligence infrastructure."}
      />

      {/* ── FOUNDER SPOTLIGHT ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28 overflow-hidden" aria-label="Founder spotlight">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Left: intro text */}
          <motion.div {...fadeUp(0)} className="max-w-xl mb-12">
            <h2 className="text-[36px] font-bold text-[#162456] leading-tight capitalize mb-4">
              Meet Our Team
            </h2>
            <p className="text-[#45556c] text-[18px] leading-relaxed">
              Built by engineers who have lived the problems of power sector software — we design solutions that hold up in the field, not just in demos.
            </p>
          </motion.div>

          {/* Featured founder card + quote */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Founder card — blue gradient overlay at bottom */}
            <motion.div
              {...fadeUp(0)}
              className="group relative overflow-hidden rounded-[15px] shadow-[0px_4px_8.3px_0px_rgba(0,0,0,0.25)] w-full max-w-[440px] mx-auto lg:mx-0"
              style={{ aspectRatio: '440 / 517' }}
              whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(27,175,231,0.22)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {leader?.image && (
                <img
                  src={getMediaUrl(leader.image.url)}
                  alt={leader.name}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="eager"
                />
              )}
              {/* Blue gradient — bottom 15% solid, then fades */}
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,175,231,0.92)] from-[0%] via-[rgba(27,175,231,0)] via-[28%] to-transparent to-[28%]" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-12">
                <p className="text-white font-bold text-[24px] leading-snug">{leader?.name ?? 'Shree Kant Bohra'}</p>
                <p className="text-[#eeeeee] font-semibold text-[20px] leading-snug mt-1">{leader?.role ?? 'Co-Founder & CEO'}</p>
              </div>
            </motion.div>

            {/* Quote block */}
            <motion.div {...fadeUp(0.12)} className="flex flex-col px-4 lg:px-10">
              {/* Opening quote mark */}
              <span
                className="text-[100px] font-black leading-[0.8] text-text-primary/15 select-none pointer-events-none self-start"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              <p className="text-[#45556c] text-[22px] lg:text-[26px] font-normal leading-[1.7] text-center px-2">
                {leader?.quote ?? "We built Genex because India's energy infrastructure deserved better software. Every plant we monitor is a step toward a smarter, cleaner grid."}
              </p>

              {/* Closing quote mark */}
              <span
                className="text-[100px] font-black leading-[0.8] text-text-primary/15 select-none pointer-events-none self-end mt-2"
                aria-hidden="true"
              >
                &rdquo;
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TEAM SECTIONS ─────────────────────────────────────────────────── */}
      <div className="bg-white">
        {devTeamSection && (
          <TeamSection
            title={devTeamSection.title}
            description={devTeamSection.description}
            members={devTeamSection.members}
          />
        )}
        {opsTeamSection && (
          <TeamSection
            title={opsTeamSection.title}
            description={opsTeamSection.description}
            members={opsTeamSection.members}
          />
        )}
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-brand-tint py-20 lg:py-28 relative overflow-hidden" aria-label="Contact call to action">
        <motion.div
          className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl pointer-events-none"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          aria-hidden="true"
        />

        <div className="relative max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Join Us</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
              {cta?.heading ?? 'Want to build with us?'}
            </h2>
            <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
              {cta?.description ?? "We're always looking for sharp engineers, problem-solvers, and people who care about India's energy future. Check our open roles."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={cta?.primary_cta_link ?? '/careers'}>
                <Button variant="primary" size="lg">
                  {cta?.primary_cta_text ?? 'View Open Roles'} <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </Button>
              </Link>
              <Link to={cta?.secondary_cta_link ?? '/contact'}>
                <Button variant="secondary" size="lg">{cta?.secondary_cta_text ?? 'Contact Us'}</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
