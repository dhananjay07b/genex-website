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
  seo_title?: string
  search_description?: string
  hide_footer_cta?: boolean
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

export type TechHighlightCardType = 'icon' | 'ring_stat' | 'diagram' | 'chat' | 'security' | 'signal' | 'timeline'

export interface TechHighlightItemValue {
  card_type: TechHighlightCardType
  icon: string | null
  heading: string
  description: string
  sub_text: string | null
}

// ── Product / Innovation `body` block value shapes ────────────────────────────

export interface OverviewSectionValue {
  heading: string
  paragraphs: string[]
}

export interface CapabilityItemValue {
  icon: string | null
  text: string
}

export interface CapabilitiesSectionValue {
  heading: string
  items: CapabilityItemValue[]
}

export interface TechHighlightsSectionValue {
  eyebrow: string
  intro: string
  items: TechHighlightItemValue[]
}

export interface DeploymentStepValue {
  num: string
  title: string
  description: string
  icon: string | null
}

export interface DeploymentStepsSectionValue {
  heading: string
  description: string | null
  steps: DeploymentStepValue[]
}

export interface ProductVideoSectionValue {
  heading: string | null
  description: string | null
  video_file: WagtailDocument | null
  video_url: string | null
  poster_image: WagtailImage | null
}

export interface ProductTestimonialSectionValue {
  heading: string
  items: TestimonialApiValue[]
}

export interface StatsGridSectionValue {
  heading: string
  stats: ProductStat[]
}

export interface IntroductionSectionValue {
  heading: string
  description: string
  note: string | null
}

export interface DocumentItemValue {
  title: string
  document: WagtailDocument | null
  note: string | null
}

export interface DocumentSectionValue {
  heading: string
  documents: DocumentItemValue[]
}

export interface FAQItemValue {
  section: string | null
  q: string
  a: string
}

export interface FAQSectionValue {
  heading: string
  items: FAQItemValue[]
}

export interface CTABandValue {
  heading: string
  description: string | null
  primary_cta_text: string | null
  primary_cta_link: string | null
  secondary_cta_text: string | null
  secondary_cta_link: string | null
}

export interface SectionPageData extends WagtailPageBase {
  body: StreamBlock<unknown>[]
}

export interface ContentPageData extends WagtailPageBase {
  tags: StreamBlock<string>[]
  icon_url: string | null
  body: StreamBlock<unknown>[]
}

export interface SimpleCardValue {
  icon: string | null
  title: string
  description: string
  note: string | null
  link: string | null
}

export interface CardGridSectionValue {
  heading: string | null
  description: string | null
  cards: SimpleCardValue[]
}

export interface BulletPointValue {
  bold_title: string
  point: string
}

export interface SideImageSectionValue {
  heading: string | null
  description: string | null
  image: { image: WagtailImage; alt: string | null; position: 'left' | 'right' } | null
  body_blocks: StreamBlock<string | BulletPointValue>[]
}

// ── About / Media / Team `body` block value shapes ────────────────────────────

export interface HeroSectionApiValue {
  label: string | null
  heading: string
  description: string | null
  cta_text: string | null
  cta_link: string | null
  background_image: WagtailImage | null
}

export interface MilestoneApiValue {
  year: string
  label: string
  title: string
  description: string
  is_current: boolean
}

export interface VisionMissionCardApiValue {
  icon: string
  title: string
  text: string
}

export interface LeadershipCardApiValue {
  title: string
  bio: string
  initials: string
  linkedin: string | null
}

export interface CertificationApiValue {
  name: string
  label: string
}

export interface AchievementApiValue {
  badge: string
  icon_type: 'certificate' | 'award'
  heading: string
  body: string
  image: WagtailImage | null
  image_alt: string | null
}

export interface PressItemApiValue {
  image: WagtailImage
  alt: string
  caption: string | null
  subcaption: string | null
  featured: boolean
}

export interface GalleryItemApiValue {
  image: WagtailImage
  alt: string
}

export interface LeaderApiValue {
  heading: string
  description: string | null
  name: string
  role: string
  image: WagtailImage | null
  quote: string
}

export interface TeamCategoryValue {
  name: string
  priority: number
}

export interface TeamMemberApiValue {
  name: string
  role: string
  image: WagtailImage | null
  category: TeamCategoryValue | null
}

export interface TeamSectionApiValue {
  title: string
  description: string | null
  members: TeamMemberApiValue[]
}

export interface HowWeWorkStepApiValue {
  num: string
  title: string
  desc: string
  image: WagtailImage | null
}

export interface EngineeringPrincipleApiValue {
  title: string
  desc: string
}

export interface HowWeWorkPageBlockValue {
  heading: string
  description: string
  steps: HowWeWorkStepApiValue[]
  principles: EngineeringPrincipleApiValue[]
}

// ── Snippet API shapes (DRF, snake_case) ──────────────────────────────────────

export interface CaseStudySectionValue {
  heading: string
  body: string
}

export interface CaseStudyItem {
  id: number
  title: string
  category: string
  category_color: string
  excerpt: string
  date: string
  read_time: string
  image_url: string | null
  intro: string
  sections: StreamBlock<CaseStudySectionValue>[]
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
  image_url: string | null
  tags: string[]
  intro: string
  sections: StreamBlock<CaseStudySectionValue>[]
  callout_label: string
  callout_content: string
  takeaways: StreamBlock<string>[]
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
  document_url: string | null
}

export interface BlogPostBodyImageValue {
  image: string
  caption: string | null
}

export interface BlogPostItem {
  id: number
  title: string
  topic: string
  date: string
  excerpt: string
  image_url: string | null
  body: StreamBlock<string | BlogPostBodyImageValue>[]
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
  image_url: string | null
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
  image_url: string | null
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

export interface WagtailImage { url: string; width?: number; height?: number; alt?: string }
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
