import type { ContentAccess, ContentAuthor } from './api'
import type { CompanyDisplay } from './auth'

/** Professionals' courses use videos and posts; Company Studio courses use the company's articles, research, whitepapers and podcasts. */
export type CourseItemKind = 'video' | 'post' | 'article' | 'research' | 'whitepaper' | 'podcast'

/** A video/post as it appears in a course or the builder's library. */
export interface CourseTarget {
  kind: CourseItemKind
  id: number
  title: string
  image_url: string | null
  /** Duration for videos, topic for posts. */
  meta: string
  /** About how long the lesson takes, in minutes (0 when unknown). */
  minutes: number
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

export interface CourseModuleInfo {
  id: number
  title: string
  summary: string
}

export interface CourseFaq {
  question: string
  answer: string
}

/** A lesson in the builder: the published item plus where it sits in the course. */
export type MyCourseItem = CourseTarget & { item_id: number; module_id: number | null }

export interface MyCourse {
  id: number
  slug: string
  title: string
  summary: string
  description: string
  outcomes: string[]
  prerequisites: string[]
  language: string
  cover_url: string | null
  level: CourseLevel
  /** Topic ids (see /api/snippets/topics/). */
  topics: number[]
  /** Career role ids (see /api/learning/roles/). */
  roles: number[]
  /** Company courses only: user ids of the company's verified Professionals. */
  instructors: number[]
  access: ContentAccess
  price: string | null
  currency: string
  status: CourseStatus
  rejection_reason: string
  modules: CourseModuleInfo[]
  items: MyCourseItem[]
  faqs: (CourseFaq & { id: number })[]
  enrolled_count: number
  /** False for a live course with learners: Genex unpublishes it instead. */
  can_delete: boolean
  submitted_at: string | null
  updated_at: string
}

/** A verified Professional a company can list as a course instructor (GET /api/learning/me/company-professionals/). */
export interface CompanyProfessional extends ContentAuthor {
  id: number
}
