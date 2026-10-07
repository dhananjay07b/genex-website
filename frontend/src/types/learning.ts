import type { ContentAccess, ContentAuthor } from './api'
import type { CompanyDisplay } from './auth'
import type { DiscoveryCard } from './discovery'

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
  module_id: number | null
  position: number
  is_locked: boolean
  completed: boolean
}

/** A course's average on cards and search: only sent once it has 3 visible reviews. */
export interface CourseCardRating {
  average: number
  count: number
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
  /** Shown once a course has 3 visible reviews; null before that. */
  rating: CourseCardRating | null
  featured: boolean
  updated_at: string
}

export interface CourseEnrollment {
  completed_item_ids: number[]
  completed: number
  total: number
  percent: number
}

/** A course with its lessons and the viewer's progress (enrolled-course lists). */
export interface CourseProgress extends CourseCard {
  is_locked: boolean
  items: CourseItem[]
  enrollment: CourseEnrollment | null
}

export interface CoursePageModule {
  id: number
  title: string
  summary: string
  item_ids: number[]
  minutes: number
}

export interface CourseInstructor {
  username: string
  display_name: string
  avatar_url: string | null
  role_title: string
  years_experience: number | null
  bio: string
  company: CompanyDisplay | null
  /** GeLearn rating set by Genex, e.g. "4.8". */
  rating: string | null
  course_count: number
  learner_count: number
}

export interface CoursePublisher extends CompanyDisplay {
  description: string
  counts: { courses: number; reading: number; whitepapers: number; experts: number }
}

export interface CoursePathStep {
  level: Exclude<CourseLevel, ''>
  is_current: boolean
  course: DiscoveryCard
}

export interface CourseRolePath {
  id: number
  name: string
  slug: string
  summary: string
  path: CoursePathStep[]
}

export interface CourseRatingSummary {
  average: number
  count: number
  /** 5 stars down to 1. */
  distribution: { stars: number; percent: number }[]
}

/** The course team's answer under a review. */
export interface ReviewReplyInfo {
  body: string
  /** "hidden" only reaches the course team, when Genex has hidden the reply. */
  status: 'visible' | 'hidden'
  created_at: string
  updated_at: string
  label: 'Instructor' | 'Course publisher'
  author: { username: string | null; display_name: string; avatar_url: string | null; role_title: string }
}

export interface CourseReview {
  id: number
  rating: number
  reply: ReviewReplyInfo | null
  /** The viewer is the course's owner or an instructor, so may reply. */
  can_reply: boolean
  body: string
  created_at: string
  updated_at: string
  status: 'visible' | 'hidden'
  completed_course: boolean
  is_mine: boolean
  author: {
    username: string
    display_name: string
    avatar_url: string | null
    role_title: string
    company: CompanyDisplay | null
  }
}

export interface MyReviewState {
  review: CourseReview | null
  can_review: boolean
  /** Why not, when `can_review` is false. */
  reason: string
}

/** The whole course page (GET /api/learning/courses/<slug>/). */
export interface CourseDetail extends CourseProgress {
  summary: string
  outcomes: string[]
  prerequisites: string[]
  language: string
  total_minutes: number
  lesson_counts: Partial<Record<CourseItemKind, number>>
  modules: CoursePageModule[]
  next_item_id: number | null
  instructors: CourseInstructor[]
  publisher: CoursePublisher | null
  roles: CourseRolePath[]
  rating_summary: CourseRatingSummary | null
  reviews: CourseReview[]
  my_review: MyReviewState | null
  /** The viewer runs this course ('owner') or teaches it ('instructor'): they can't enroll or review. */
  my_relation: 'owner' | 'instructor' | null
  faqs: CourseFaq[]
  learner_companies: CompanyDisplay[]
}

/** GET /api/learning/courses/<slug>/related/ */
export interface CourseRelatedTab {
  key: 'topic' | 'role' | 'publisher'
  label: string
  slug: string
  courses: DiscoveryCard[]
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

export interface CourseRevisionInfo {
  status: 'pending' | 'rejected'
  submitted_at: string
  rejection_reason: string
  /** What changed: course fields, plus "faqs" and "outline". */
  changed: string[]
}

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
  /** A live course's edits waiting for Genex review; the builder already shows them in place of the live values. */
  revision: CourseRevisionInfo | null
  submitted_at: string | null
  updated_at: string
}

/** A verified Professional a company can list as a course instructor (GET /api/learning/me/company-professionals/). */
export interface CompanyProfessional extends ContentAuthor {
  id: number
}
