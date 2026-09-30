import type { ContentAccess, ContentAuthor } from './api'

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
  slug: string
  title: string
  description: string
  cover_url: string | null
  owner: ContentAuthor
  access: ContentAccess
  price: string | null
  currency: string
  item_count: number
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
export interface MyCourse {
  id: number
  slug: string
  title: string
  description: string
  cover_url: string | null
  access: ContentAccess
  price: string | null
  currency: string
  status: CourseStatus
  rejection_reason: string
  items: (CourseTarget & { item_id: number })[]
  submitted_at: string | null
  updated_at: string
}
