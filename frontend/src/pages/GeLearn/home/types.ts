/**
 * The editor's settings for each GeLearn home section, as /api/discovery/home/
 * returns them in `layout[].value` (see backend pages/gelearn_blocks.py).
 */
import type { CmsImage } from '@/types/discovery'

export interface SeeAll {
  see_all_label?: string
  see_all_url?: string
}

export interface HeroSlide {
  /** 'banner' = image only, the width of two cards. Older slides saved before the option have none (a card). */
  variant?: 'card' | 'banner'
  kicker: string
  heading: string
  body: string
  cta_label: string
  cta_url: string
  tone: 'slate' | 'sky' | 'mint'
  image: CmsImage | null
}

export interface HeroValue {
  slides: HeroSlide[]
}

export type NewAndPopularBox = 'professionals' | 'popular_courses' | 'new_geacademy' | 'trending'

export interface NewAndPopularValue {
  heading: string
  boxes: NewAndPopularBox[]
}

export interface CourseRailValue extends SeeAll {
  heading: string
  subheading: string
  style: 'plain' | 'band'
  body: string
}

export interface ContentRailValue extends SeeAll {
  heading: string
  subheading: string
}

export interface BandValue {
  heading: string
  body: string
  cta_label: string
  cta_url: string
}

export interface PromoCardValue {
  tag: string
  heading: string
  body: string
  link_label: string
  link_url: string
  tone: 'mint' | 'slate'
  /** Who sees it: 'visitor' = not signed in; otherwise an account type, or everyone. */
  audience: 'everyone' | 'visitor' | 'learner' | 'professional' | 'company'
}

export interface PromoPairValue {
  promos: PromoCardValue[]
}

export interface HeadingValue extends SeeAll {
  heading: string
  subheading?: string
}

export interface GoalTilesValue {
  tiles: { title: string; subtitle: string; link_url: string }[]
}

export interface IntentStripValue {
  heading: string
  links: { label: string; url: string }[]
}

export interface StatsBannerValue {
  heading: string
  body: string
  link_label: string
  link_url: string
}

export interface FaqValue {
  heading: string
  items: { question: string; answer: string }[]
}

// Signed-in only ─────────────────────────────────────────────────────────────

export interface WelcomeValue {
  goal_prompt: string
}

export interface PrefixValue {
  heading_prefix: string
}
