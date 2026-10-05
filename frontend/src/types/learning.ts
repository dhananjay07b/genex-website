import type { ContentAccess, ContentAuthor } from './api'
import type { CompanyDisplay } from './auth'

export type CourseItemKind = 'video' | 'post'

/** A video/post as it appears in a course or the builder's library. */
export interface CourseTarget {
  kind: CourseItemKind
  id: number
  title: string
  image_url: string | null
  /** Duration for videos, topic for posts. */
  meta: string
  /** GeLearn path, e.g. /videos/12. */
  path: string
  access: ContentAccess
  price: string | null
  currency: string
}

export interface CourseItem extends CourseTarget {
  item_id: number
  position: number
  is_locked: boolean
  completed: boolean
}

export interface CourseCard {
  id: number
  slug: string
  title: string
  description: string
  cover_url: string | null
  owner: ContentAuthor
  /** Set for Company Studio courses ("Course by <company>"); null for a Professional's own course. */
  company: CompanyDisplay | null
  level: CourseLevel
  topics: { id: number; name: string; slug: string }[]
  access: ContentAccess
  price: string | null
  currency: string
  item_count: number
  enrolled_count: number
  /** Total length of the course's videos, in minutes. */
  video_minutes: number
  featured: boolean
  updated_at: string
}

export interface CourseEnrollment {
  completed_item_ids: number[]
  completed: number
  total: number
  percent: number
}

export interface CourseDetail extends CourseCard {
  is_locked: boolean
  items: CourseItem[]
  enrollment: CourseEnrollment | null
}

export type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected'

/** A Professional's own course, as the builder edits it. */
export type CourseLevel = '' | 'beginner' | 'intermediate' | 'advanced'

export interface MyCourse {
  id: number
  slug: string
  title: string
  description: string
  cover_url: string | null
  level: CourseLevel
  /** Topic ids (see /api/snippets/topics/). */
  topics: number[]
  /** Career role ids (see /api/learning/roles/). */
  roles: number[]
  access: ContentAccess
  price: string | null
  currency: string
  status: CourseStatus
  rejection_reason: string
  items: (CourseTarget & { item_id: number })[]
  submitted_at: string | null
  updated_at: string
}
