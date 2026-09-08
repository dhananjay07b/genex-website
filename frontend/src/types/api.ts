// ── Wagtail v2 page API ────────────────────────────────────────────────────────

export interface StreamBlock<T = unknown> {
  type: string
  value: T
  id: string
}

export interface WagtailMeta {
  type: string
  detail_url: string
  html_url: string
  slug: string
  first_published_at: string | null
}

export interface WagtailPageBase {
  id: number
  meta: WagtailMeta
  title: string
}

export interface WagtailListResponse<T> {
  meta: { total_count: number }
  items: T[]
}

// ── Product / Innovation API shapes ───────────────────────────────────────────

export interface ProductStat {
  value: string
  suffix: string
  label: string
}

export interface TechHighlight {
  title: string
  description: string
}

export interface ProductPageData extends WagtailPageBase {
  badge: string
  family: string
  headline: string
  subline: string
  gradient: string
  overview: StreamBlock<string>[]
  capabilities: StreamBlock<string>[]
  tech_highlights: StreamBlock<TechHighlight>[]
  stats: StreamBlock<ProductStat>[]
}

export interface InnovationPageData extends WagtailPageBase {
  badge: string
  category: string
  stage: string
  headline: string
  subline: string
  gradient: string
  overview: StreamBlock<string>[]
  capabilities: StreamBlock<string>[]
  tech_highlights: StreamBlock<TechHighlight>[]
  stats: StreamBlock<ProductStat>[]
}

// ── Snippet API shapes (DRF, snake_case) ──────────────────────────────────────

export interface CaseStudyItem {
  id: number
  title: string
  category: string
  category_color: string
  excerpt: string
  date: string
  read_time: string
}

export interface TechArticleItem {
  id: number
  title: string
  topic: string
  difficulty: string
  read_time: string
  date: string
  excerpt: string
  featured: boolean
}

export interface TenderItem {
  id: number
  title: string
  authority: string
  deadline: string
  value: string
  status: string
  sector: string
  description: string
}

export interface WhitepaperItem {
  id: number
  title: string
  category: string
  category_bg: string
  category_text: string
  date: string
  pages: string
  description: string
}

export interface BlogPostItem {
  id: number
  title: string
  topic: string
  date: string
  excerpt: string
}

export interface VideoItem {
  id: number
  title: string
  category: string
  category_color: string
  category_text_color: string
  date: string
  duration: string
  excerpt: string
  video_url: string | null
  is_locked: boolean
}

export interface PodcastItem {
  id: number
  title: string
  category: string
  category_bg: string
  category_text: string
  date: string
  duration: string
  description: string
  guest: string
  guest_role: string
  audio_url: string | null
  is_locked: boolean
}

export interface SnippetListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

// ── Homepage API shapes ───────────────────────────────────────────────────────

export interface WagtailImage { url: string }
export interface WagtailDocument { url: string; title: string }

export interface HeroSlideApiValue {
  headline: string
  subline: string
  media_type: 'video' | 'image'
  background_image: WagtailImage | null
  background_video: WagtailDocument | null
  cta_text: string | null
  cta_link: string | null
}

export interface WhatWeBuildTabApiValue {
  id: string
  label: string
  badge: string | null
  headline: string
  body: string
  points: string[]
  href: string
  image: WagtailImage | null
}

export interface StatementApiValue {
  title: string
  body: string
}

export interface GenexEdgeApiValue {
  heading: string | null
  image: WagtailImage | null
  statements: StatementApiValue[]
}

export interface ProjectShowcaseApiValue {
  name: string
  location: string | null
  metric: string | null
  image: WagtailImage | null
  href: string | null
}

export interface InnovationTeaserApiValue {
  name: string
  tagline: string
  href: string
  badge: string | null
  index: number
}

export interface TestimonialApiValue {
  quote: string
  name: string
  role: string | null
  company: string | null
  initials: string
}

export interface TechPartnerApiValue {
  name: string
  abbr: string
  href: string | null
  logo: WagtailImage | null
}

export interface EventBannerApiValue {
  title: string
  date: string
  tagline: string
  description: string | null
  registration_url: string
}

export interface MapPinApiValue {
  id: string
  name: string
  latitude: number
  longitude: number
  delay: number | null
}

export interface WorldMapApiValue {
  eyebrow: string | null
  heading: string | null
  description: string[]
  bullet_points: string[]
  stats: ProductStat[]
  pins: MapPinApiValue[]
}

export interface GeLearnTeaserCardApiValue {
  slug: string
  label: string
  icon: string
}

export interface HomePageData extends WagtailPageBase {
  event_banner:      StreamBlock<EventBannerApiValue>[]
  hero_slides:       StreamBlock<HeroSlideApiValue>[]
  credibility_strip: StreamBlock<{ name: string; logo: WagtailImage | null }>[]
  impact_stats:      StreamBlock<ProductStat>[]
  what_we_build:     StreamBlock<WhatWeBuildTabApiValue>[]
  edge_section:      StreamBlock<GenexEdgeApiValue>[]
  projects_showcase: StreamBlock<ProjectShowcaseApiValue>[]
  innovations_teaser:StreamBlock<InnovationTeaserApiValue>[]
  world_map:         StreamBlock<WorldMapApiValue>[]
  gelearn_teaser:    StreamBlock<GeLearnTeaserCardApiValue>[]
  tech_partners:     StreamBlock<TechPartnerApiValue>[]
  testimonials:      StreamBlock<TestimonialApiValue>[]
  cta_section:       StreamBlock<{ heading: string; description: string; primary_cta_text: string; primary_cta_link: string }>[]
}
