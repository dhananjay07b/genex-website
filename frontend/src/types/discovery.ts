import type { ContentAccess } from './api'
import type { CompanyDisplay } from './auth'
import type { CourseLevel } from './learning'

/** Public content keys used by /api/discovery/ (and in search filters). */
export type DiscoveryType = 'course' | 'geacademy' | 'research' | 'whitepaper' | 'tender' | 'video' | 'podcast' | 'blog'

export interface TopicRef {
  id: number
  name: string
  slug: string
}

/** A Professional or author as shown on cards. */
export interface PersonCard {
  username: string | null
  display_name: string
  avatar_url: string | null
  role_title: string
  company: CompanyDisplay | null
}

/** One card shape for every kind of content (see backend discovery/cards.py). */
export interface DiscoveryCard {
  type: DiscoveryType
  id: number
  title: string
  excerpt: string
  image_url: string | null
  /** Route on GeLearn, e.g. /courses/scada-fundamentals or /research/3. */
  path: string
  date: string | null
  /** Short context line: "14 lessons", "8 min read", "14:32 min", issuing authority… */
  meta: string
  level: CourseLevel
  topics: TopicRef[]
  access: ContentAccess
  price: string | null
  currency: string
  /** Publishing company (verified), or null for Genex editorial / a Professional's own course. */
  company: CompanyDisplay | null
  author: PersonCard | null
  // Course
  slug?: string
  lessons?: number | null
  video_minutes?: number
  enrolled?: number | null
  featured?: boolean
  // Tender
  status?: string
  sector?: string
  authority?: string
  deadline?: string | null
  days_left?: number | null
  // Video / podcast
  duration_seconds?: number | null
  guest?: string
  // Whitepaper
  document_url?: string | null
}

export interface LeadingProfessional extends PersonCard {
  /** "4.8" — set by Genex; null when not rated. */
  rating: string | null
  expertise: string[]
}

export interface CareerRoleRow {
  id: number
  name: string
  slug: string
  summary: string
  image_url: string | null
  course_count: number
  courses: DiscoveryCard[]
}

export interface LiveSessionCard {
  id: number
  slug: string
  title: string
  description: string
  starts_at: string
  ends_at: string
  duration_minutes: number
  speaker: PersonCard
  /** Hosting company; null means Genex. */
  company: CompanyDisplay | null
  registration_url: string
  image_url: string | null
  topics: TopicRef[]
}

export interface TestimonialCard {
  id: number
  quote: string
  name: string
  role: string
  company_name: string
  photo_url: string | null
}

export interface CompanyLogo {
  name: string
  slug: string
  logo_url: string | null
}

export interface TopicGroupRef {
  name: string
  topics: TopicRef[]
}

/** An image chosen in the CMS, as the API sends it. */
export interface CmsImage {
  url: string
  width: number
  height: number
  alt: string
}

/**
 * A section arranged on the GeLearn index page in the CMS. `value` holds the
 * editor's words and settings for that section type; course and content rows
 * also carry `items`. Other sections read the matching top-level data key.
 */
export interface LayoutSection {
  type: string
  id: string
  value: Record<string, unknown>
  items?: DiscoveryCard[]
}

export interface ExploreMenuData {
  topic_groups: TopicGroupRef[]
  roles: { id: number; name: string; slug: string }[]
  companies: { name: string; slug: string }[]
}

export interface PublicHomeData {
  layout: LayoutSection[]
  professionals: LeadingProfessional[]
  popular_courses: DiscoveryCard[]
  new_geacademy: DiscoveryCard[]
  trending: DiscoveryCard[]
  roles: CareerRoleRow[]
  library: Record<'geacademy' | 'research' | 'whitepaper' | 'tender' | 'video' | 'podcast', DiscoveryCard[]>
  live_sessions: LiveSessionCard[]
  testimonials: TestimonialCard[]
  companies: CompanyLogo[]
  stats: { courses: number; experts: number; companies: number }
  topic_groups: TopicGroupRef[]
  trending_searches: string[]
}

export interface ContinueLearning {
  course: DiscoveryCard
  completed: number
  total: number
  percent: number
  next_item: { item_id: number; kind: 'video' | 'post'; title: string; meta: string } | null
}

export interface MyHomeData {
  layout: LayoutSection[]
  continue: ContinueLearning | null
  week: { days: { date: string; count: number }[]; total: number }
  enrolled_count: number
  saved_count: number
  career_goal: { id: number; name: string; slug: string } | null
  goal_courses: DiscoveryCard[]
  because: { course: { title: string; slug: string }; courses: DiscoveryCard[] } | null
  recently_viewed: DiscoveryCard[]
  similar: DiscoveryCard[]
  closing_tenders: DiscoveryCard[]
  quick_videos: DiscoveryCard[]
}

export interface SearchResponse {
  count: number
  counts: Partial<Record<DiscoveryType, number>>
  results: DiscoveryCard[]
}
