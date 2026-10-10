import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import { cn, getMediaUrl, isExternalHref } from '@/lib/utils'
import { LearnCard } from '@/components/gelearn/discovery/LearnCard'
import { ListBox, ListRow, type ListBoxTone } from '@/components/gelearn/discovery/ListBox'
import { ProfessionalRow } from '@/components/gelearn/discovery/ProfessionalRow'
import { Slider } from '@/components/gelearn/discovery/Slider'
import { TabbedBand } from '@/components/gelearn/discovery/TabbedBand'
import { LiveSessionCard } from '@/components/gelearn/discovery/LiveSessionCard'
import { SectionHeading } from '@/components/gelearn/discovery/SectionHeading'
import type { DiscoveryCard, PublicHomeData } from '@/types/discovery'
import type {
  BandValue, ContentRailValue, CourseRailValue, FaqValue, GoalTilesValue, HeadingValue, HeroSlide, HeroValue,
  IntentStripValue, NewAndPopularBox, NewAndPopularValue, PromoPairValue, StatsBannerValue,
} from './types'

/** A link that works for both GeLearn routes and full https:// URLs typed into the CMS. */
function SmartLink({ href, className, label, children }: { href: string; className?: string; label?: string; children: ReactNode }) {
  return isExternalHref(href)
    ? <a href={href} className={className} aria-label={label}>{children}</a>
    : <Link to={href} className={className} aria-label={label}>{children}</Link>
}

/** The page-width container every section sits in. */
export function Section({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  return (
    <section aria-label={label} className={cn('mx-auto max-w-330 px-4 py-7 md:px-6', className)}>
      {children}
    </section>
  )
}

export function CardGrid({ cards }: { cards: DiscoveryCard[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => <LearnCard key={`${card.type}-${card.id}`} card={card} />)}
    </div>
  )
}

// ── Hero slideshow ─────────────────────────────────────────────────────────

const SLIDE_TONES: Record<HeroSlide['tone'], { box: string; kicker: string }> = {
  slate: { box: 'bg-slate-100 border-slate-200', kicker: 'text-emerald-700' },
  sky: { box: 'bg-surface border-sky-100', kicker: 'text-sky-700' },
  mint: { box: 'bg-surface-alt border-emerald-100', kicker: 'text-emerald-700' },
}

const AUTOPLAY_MS = 7000

export function HeroSection({ value }: { value: HeroValue }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [paused, setPaused] = useState(false)
  const slides = value.slides

  // Slides can differ in width (a banner is two cards wide), so each page is a scroll position where a slide
  // starts, not a multiple of one slide's width. Positions past the end of the rail collapse into the last page.
  const stopsRef = useRef<number[]>([0])

  const measure = useCallback(() => {
    const rail = railRef.current
    if (!rail || !rail.firstElementChild) return
    const children = [...rail.children] as HTMLElement[]
    const origin = children[0].offsetLeft
    const maxScroll = rail.scrollWidth - rail.clientWidth
    const stops: number[] = []
    for (const child of children) {
      const stop = Math.min(child.offsetLeft - origin, maxScroll)
      if (!stops.length || stop - stops[stops.length - 1] > 1) stops.push(stop)
    }
    stopsRef.current = stops
    setPages(stops.length)
    let nearest = 0
    stops.forEach((stop, i) => { if (Math.abs(stop - rail.scrollLeft) < Math.abs(stops[nearest] - rail.scrollLeft)) nearest = i })
    setPage(nearest)
  }, [])

  const go = useCallback((target: number) => {
    const rail = railRef.current
    if (!rail) return
    const stops = stopsRef.current
    const wrapped = ((target % stops.length) + stops.length) % stops.length
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    rail.scrollTo({ left: stops[wrapped], behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure, slides])

  useEffect(() => {
    if (paused || pages < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => go(page + 1), AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [paused, pages, page, go])

  if (!slides.length) return null
  const arrow = 'flex size-8 items-center justify-center rounded-full border border-border bg-white hover:border-primary'

  return (
    <Section label="Featured" className="pt-5">
      <div
        ref={railRef}
        onScroll={measure}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="scrollbar-hidden -mx-2 flex snap-x snap-mandatory overflow-x-auto"
      >
        {slides.map((slide, i) => {
          if (slide.variant === 'banner') {
            if (!slide.image) return null
            const picture = (
              <img src={getMediaUrl(slide.image.url)} alt={slide.cta_url ? '' : slide.image.alt} className="absolute inset-0 size-full object-cover" />
            )
            const frame = 'relative block h-full min-h-60 overflow-hidden rounded-2xl border border-border bg-slate-100'
            return (
              <div key={i} className="w-full shrink-0 snap-start px-2">
                {slide.cta_url
                  ? (
                    <SmartLink href={slide.cta_url} label={slide.cta_label || slide.image.alt} className={cn(frame, 'hover:opacity-95 focus-visible:outline-2 focus-visible:outline-primary')}>
                      {picture}
                    </SmartLink>
                  )
                  : <div className={frame}>{picture}</div>}
              </div>
            )
          }
          const tone = SLIDE_TONES[slide.tone] ?? SLIDE_TONES.slate
          return (
            <div key={i} className="w-full shrink-0 snap-start px-2 lg:w-1/2">
              <article className={cn('flex h-full min-h-60 flex-col overflow-hidden rounded-2xl border sm:flex-row', tone.box)}>
                <div className="flex flex-1 flex-col justify-center gap-3 p-6 lg:p-7">
                  {slide.kicker && <span className={cn('text-xs font-bold uppercase tracking-widest', tone.kicker)}>{slide.kicker}</span>}
                  <h2 className="text-balance text-2xl font-extrabold leading-tight text-text-primary">{slide.heading}</h2>
                  {slide.body && <p className="max-w-md text-sm text-slate-700">{slide.body}</p>}
                  {slide.cta_label && slide.cta_url && (
                    <SmartLink
                      href={slide.cta_url}
                      className="mt-1 inline-flex items-center gap-1.5 self-start rounded-lg gradient-brand px-4 py-2.5 text-sm font-bold text-white hover:opacity-90"
                    >
                      {slide.cta_label} <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </SmartLink>
                  )}
                </div>
                {slide.image && (
                  <div className="relative min-h-40 sm:w-2/5">
                    <img src={getMediaUrl(slide.image.url)} alt={slide.image.alt} className="absolute inset-0 size-full object-cover" />
                  </div>
                )}
              </article>
            </div>
          )
        })}
      </div>
      {pages > 1 && (
        <div className="mt-3.5 flex items-center gap-2.5">
          <button type="button" className={arrow} onClick={() => go(page - 1)} aria-label="Previous slide">
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === page}
                className={cn('h-2 rounded-full transition-all', i === page ? 'w-6 bg-primary' : 'w-2 bg-slate-300')}
              />
            ))}
          </div>
          <button type="button" className={arrow} onClick={() => go(page + 1)} aria-label="Next slide">
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      )}
    </Section>
  )
}

// ── New and popular ────────────────────────────────────────────────────────

const BOXES: Record<NewAndPopularBox, { title: string; href: string; tone: ListBoxTone }> = {
  professionals: { title: 'Our Leading Professionals', href: '/professionals', tone: 'slate' },
  popular_courses: { title: 'Most popular courses', href: '/courses', tone: 'sky' },
  new_geacademy: { title: 'New on GeAcademy', href: '/geacademy', tone: 'sky' },
  trending: { title: 'Trending this week', href: '/search', tone: 'mint' },
}

const BOX_ROWS = 3

export function NewAndPopularSection({ value, data }: { value: NewAndPopularValue; data: PublicHomeData }) {
  const boxes = value.boxes
    .map(key => {
      const meta = BOXES[key]
      if (!meta) return null
      if (key === 'professionals') {
        const people = data.professionals.slice(0, BOX_ROWS)
        return people.length ? (
          <ListBox key={key} title={meta.title} href={meta.href} tone={meta.tone} className="h-full">
            {people.map(p => <ProfessionalRow key={p.username ?? p.display_name} person={p} />)}
          </ListBox>
        ) : null
      }
      const cards = data[key].slice(0, BOX_ROWS)
      return cards.length ? (
        <ListBox key={key} title={meta.title} href={meta.href} tone={meta.tone} className="h-full">
          {cards.map(card => <ListRow key={`${card.type}-${card.id}`} card={card} />)}
        </ListBox>
      ) : null
    })
    .filter(Boolean)

  if (!boxes.length) return null
  return (
    <Section label={value.heading}>
      <Slider label={value.heading} heading={<h2 className="text-xl font-extrabold text-text-primary lg:text-2xl">{value.heading}</h2>}>
        {boxes}
      </Slider>
    </Section>
  )
}

// ── Course and content rows ────────────────────────────────────────────────

export function CourseRailSection({ value, items }: { value: CourseRailValue; items: DiscoveryCard[] }) {
  if (!items.length) return null
  if (value.style === 'band') {
    return (
      <Section label={value.heading}>
        <TabbedBand
          heading={value.heading}
          body={value.body || value.subheading}
          ctaLabel={value.see_all_label}
          ctaUrl={value.see_all_url}
          tabs={[{ key: 'courses', label: value.heading, content: <CardGrid cards={items} /> }]}
        />
      </Section>
    )
  }
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <CardGrid cards={items} />
    </Section>
  )
}

export function ContentRailSection({ value, items }: { value: ContentRailValue; items: DiscoveryCard[] }) {
  if (!items.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <CardGrid cards={items} />
    </Section>
  )
}

// ── Bands with tabs ────────────────────────────────────────────────────────

export function RoleBandSection({ value, data }: { value: BandValue; data: PublicHomeData }) {
  const roles = data.roles.filter(role => role.courses.length > 0)
  if (!roles.length) return null
  return (
    <Section label={value.heading}>
      <TabbedBand
        heading={value.heading}
        body={value.body}
        ctaLabel={value.cta_label}
        ctaUrl={value.cta_url}
        tabs={roles.map(role => ({ key: role.slug, label: role.name, content: <CardGrid cards={role.courses} /> }))}
      />
    </Section>
  )
}

const LIBRARY_TABS: { key: keyof PublicHomeData['library']; label: string }[] = [
  { key: 'geacademy', label: 'GeAcademy' },
  { key: 'research', label: 'Research' },
  { key: 'whitepaper', label: 'Whitepapers' },
  { key: 'tender', label: 'Policies & Tenders' },
  { key: 'video', label: 'Videos' },
  { key: 'podcast', label: 'Podcasts' },
]

export function LibraryTabsSection({ value, data }: { value: BandValue; data: PublicHomeData }) {
  const tabs = LIBRARY_TABS.filter(tab => data.library[tab.key]?.length)
  if (!tabs.length) return null
  return (
    <Section label={value.heading}>
      <TabbedBand
        tone="sky"
        heading={value.heading}
        body={value.body}
        ctaLabel={value.cta_label}
        ctaUrl={value.cta_url}
        tabs={tabs.map(tab => ({ key: tab.key, label: tab.label, content: <CardGrid cards={data.library[tab.key]} /> }))}
      />
    </Section>
  )
}

// ── Promos, tiles and links ────────────────────────────────────────────────

/** Who is viewing, for sections that target an audience: 'visitor' when signed out, else the account type. */
export type Viewer = 'visitor' | 'learner' | 'professional' | 'company'

export function PromoPairSection({ value, viewer }: { value: PromoPairValue; viewer: Viewer }) {
  const promos = value.promos.filter(p => !p.audience || p.audience === 'everyone' || p.audience === viewer)
  if (!promos.length) return null
  return (
    <Section label="Programmes">
      <div className={cn('grid grid-cols-1 gap-4', promos.length > 1 && 'md:grid-cols-2')}>
        {promos.map((promo, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col gap-2 rounded-2xl border p-6',
              promo.tone === 'slate' ? 'border-slate-200 bg-slate-100' : 'border-emerald-100 bg-surface-alt',
            )}
          >
            {promo.tag && (
              <span className={cn('text-xs font-extrabold uppercase tracking-widest', promo.tone === 'slate' ? 'text-sky-700' : 'text-emerald-700')}>
                {promo.tag}
              </span>
            )}
            <h3 className="text-lg font-extrabold text-text-primary">{promo.heading}</h3>
            {promo.body && <p className="max-w-md text-sm text-slate-700">{promo.body}</p>}
            {promo.link_label && promo.link_url && (
              <SmartLink href={promo.link_url} className="mt-1 inline-flex items-center gap-0.5 self-start text-sm font-bold text-sky-700 hover:text-sky-800">
                {promo.link_label} <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </SmartLink>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

export function GoalTilesSection({ value }: { value: GoalTilesValue }) {
  if (!value.tiles.length) return null
  return (
    <Section label="Get started">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {value.tiles.map((tile, i) => (
          <SmartLink
            key={i}
            href={tile.link_url}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-linear-to-r from-white to-surface px-5 py-4 transition-colors hover:border-primary"
          >
            <span>
              <b className="block text-sm font-bold text-text-primary">{tile.title}</b>
              {tile.subtitle && <span className="mt-0.5 block text-xs font-medium text-text-muted">{tile.subtitle}</span>}
            </span>
            <ArrowForwardIcon sx={{ fontSize: 22 }} className="shrink-0 text-sky-700 transition-transform group-hover:translate-x-0.5" />
          </SmartLink>
        ))}
      </div>
    </Section>
  )
}

const CHIP = 'inline-flex items-center rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:border-primary hover:text-text-primary'

export function TopicChipsSection({ value, data }: { value: { heading: string }; data: PublicHomeData }) {
  const topics = data.topic_groups.flatMap(group => group.topics)
  if (!topics.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} />
      <div className="flex flex-wrap gap-2">
        {topics.map(topic => <Link key={topic.id} to={`/topics/${topic.slug}`} className={CHIP}>{topic.name}</Link>)}
      </div>
    </Section>
  )
}

export function TrendingSearchesSection({ value, data }: { value: { heading: string }; data: PublicHomeData }) {
  if (!data.trending_searches.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} />
      <div className="flex flex-wrap gap-2">
        {data.trending_searches.map(q => (
          <Link key={q} to={`/search?q=${encodeURIComponent(q)}`} className={cn(CHIP, 'rounded-full')}>{q}</Link>
        ))}
      </div>
    </Section>
  )
}

export function IntentStripSection({ value }: { value: IntentStripValue }) {
  if (!value.links.length) return null
  return (
    <Section label={value.heading}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-slate-50 px-5 py-4">
        <h2 className="mr-2 text-base font-extrabold text-text-primary">{value.heading}</h2>
        <div className="flex flex-wrap gap-2">
          {value.links.map((link, i) => <SmartLink key={i} href={link.url} className={CHIP}>{link.label}</SmartLink>)}
        </div>
      </div>
    </Section>
  )
}

// ── People, companies and sessions ─────────────────────────────────────────

export function CompanyStripSection({ value, data }: { value: HeadingValue; data: PublicHomeData }) {
  if (!data.companies.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <div className="scrollbar-hidden flex gap-2.5 overflow-x-auto pb-1">
        {data.companies.map(company => (
          <Link
            key={company.slug}
            to={`/c/${company.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-primary"
          >
            {company.logo_url && <img src={getMediaUrl(company.logo_url)} alt="" className="size-6 rounded object-contain" />}
            {company.name}
          </Link>
        ))}
      </div>
    </Section>
  )
}

export function LiveSessionsSection({ value, data }: { value: HeadingValue; data: PublicHomeData }) {
  if (!data.live_sessions.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.live_sessions.map(session => <LiveSessionCard key={session.id} session={session} />)}
      </div>
    </Section>
  )
}

export function CareersSection({ value, data }: { value: HeadingValue; data: PublicHomeData }) {
  if (!data.roles.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} subtitle={value.subheading} seeAllLabel={value.see_all_label} seeAllUrl={value.see_all_url} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {data.roles.map(role => (
          <Link
            key={role.slug}
            to={`/roles/${role.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-lg hover:shadow-slate-900/10"
          >
            <div className="aspect-video overflow-hidden">
              {role.image_url ? (
                <img src={getMediaUrl(role.image_url)} alt="" loading="lazy" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center bg-linear-to-br from-surface to-slate-100 text-sky-800/70">
                  <WorkOutlineOutlinedIcon sx={{ fontSize: 36 }} />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-3.5">
              <h3 className="text-sm font-bold text-text-primary group-hover:underline group-hover:underline-offset-2">{role.name}</h3>
              {role.summary && <p className="text-xs text-text-muted">{role.summary}</p>}
              <p className="mt-auto flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-text-muted">Courses on GeLearn</span>
                <b className="tabular-nums text-text-primary">{role.course_count}</b>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

export function StatsBannerSection({ value, data }: { value: StatsBannerValue; data: PublicHomeData }) {
  const stats = [
    { label: 'Courses', value: data.stats.courses },
    { label: 'Verified experts', value: data.stats.experts },
    { label: 'Companies', value: data.stats.companies },
  ]
  return (
    <Section label={value.heading}>
      <div className="grid items-center gap-5 rounded-2xl border border-sky-100 bg-surface p-6 md:grid-cols-2 lg:p-7">
        <div>
          <h2 className="text-balance text-2xl font-extrabold text-text-primary">{value.heading}</h2>
          {value.body && <p className="mt-2 max-w-xl text-sm text-slate-700">{value.body}</p>}
          {value.link_label && value.link_url && (
            <SmartLink href={value.link_url} className="mt-3 inline-flex items-center gap-0.5 text-sm font-bold text-sky-700 hover:text-sky-800">
              {value.link_label} <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </SmartLink>
          )}
        </div>
        <dl className="flex flex-wrap gap-3 md:justify-end">
          {stats.map(stat => (
            <div key={stat.label} className="min-w-32 rounded-xl border border-border bg-white px-5 py-3.5">
              <dd className="gradient-brand-text text-3xl font-extrabold tabular-nums">{stat.value}</dd>
              <dt className="text-xs font-semibold text-text-muted">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}

export function TestimonialsSection({ value, data }: { value: { heading: string }; data: PublicHomeData }) {
  if (!data.testimonials.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.testimonials.map(t => (
          <figure key={t.id} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
            <FormatQuoteIcon sx={{ fontSize: 28 }} className="text-primary" />
            <blockquote className="flex-1 text-sm text-slate-700">{t.quote}</blockquote>
            <figcaption className="flex items-center gap-3">
              {t.photo_url && <img src={getMediaUrl(t.photo_url)} alt="" className="size-10 rounded-full object-cover" />}
              <span>
                <b className="block text-sm text-text-primary">{t.name}</b>
                {(t.role || t.company_name) && (
                  <span className="text-xs text-text-muted">{[t.role, t.company_name].filter(Boolean).join(', ')}</span>
                )}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}

export function FaqSection({ value }: { value: FaqValue }) {
  if (!value.items.length) return null
  return (
    <Section label={value.heading}>
      <SectionHeading title={value.heading} />
      <div className="max-w-4xl border-t border-border">
        {value.items.map((item, i) => (
          <details key={i} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center gap-2.5 px-1 py-3.5 text-sm font-bold text-text-primary details-marker-hidden">
              <ExpandMoreIcon sx={{ fontSize: 22 }} className="shrink-0 text-sky-700 transition-transform group-open:rotate-180" />
              {item.question}
            </summary>
            <p className="max-w-3xl pr-1 pb-4 pl-9 text-sm text-slate-700">{item.answer}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
