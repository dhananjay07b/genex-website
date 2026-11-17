import type { ContentAccess, ContentAuthor } from './api'
import type { CompanyDisplay } from './auth'
import type { DiscoveryCard } from './discovery'

/**
 * Professionals' courses use videos and posts; Company Studio courses use the company's articles, research,
 * whitepapers and podcasts. Any course can also hold lessons written inside it ('lesson').
 */
export type CourseItemKind = 'video' | 'post' | 'article' | 'research' | 'whitepaper' | 'podcast' | 'lesson'

/** A lesson written inside a course. Quizzes arrive later. */
export type CourseLessonType = 'text' | 'video' | 'quiz'

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
  /** Only on a course's own lessons (kind 'lesson'). */
  lesson_type?: CourseLessonType
  is_preview?: boolean
  /** Course lessons only: false until Genex has reviewed it, so adding it to a live course sends the outline for review. */
  approved?: boolean
}

/** A course's own lesson as its author edits it: GET/POST /api/learning/me/courses/<id>/lessons/. */
export interface CourseLesson {
  id: number
  kind: CourseLessonType
  title: string
  video_url: string
  duration: string
  /** Sanitised HTML. */
  body: string
  is_preview: boolean
  /** Quizzes: the percentage of right answers needed to pass. */
  pass_mark: number
  /** Quizzes: every question with its right answers (the author's view). Empty for other lessons. */
  questions: QuizQuestion[]
  /** Approved by Genex with the course. */
  approved: boolean
  /**
   * On a live course: 'new' (not reviewed yet: adding it to the outline sends it for review) or
   * 'changed' (edits waiting for review; learners keep the approved version). Null otherwise.
   * The other fields are the author's version, edits included.
   */
  review: 'new' | 'changed' | null
  in_outline: boolean
  minutes: number
  /** What it still needs before the course can be submitted, e.g. "add its text". */
  problem: string | null
  /** The lesson as an outline item. */
  card: CourseTarget
  updated_at: string
}

/** A quiz question as its author writes it. `correct` are indexes into `options`; several mean "select all that apply". */
export interface QuizQuestion {
  prompt: string
  options: string[]
  correct: number[]
  explanation: string
}

/** A quiz question as learners get it before answering: no right answers. */
export interface QuizQuestionForLearner {
  prompt: string
  options: string[]
  /** More than one answer is right ("select all that apply"). */
  multiple: boolean
}

export interface QuizBest {
  score: number
  total: number
  passed: boolean
}

/** POST /api/learning/courses/<slug>/lessons/<id>/attempts/: the graded quiz. */
export interface QuizResult {
  score: number
  total: number
  percent: number
  pass_mark: number
  passed: boolean
  /** Per question, in order. `correct_options` only once the quiz is passed. */
  results: { correct: boolean; explanation: string; correct_options?: number[] }[]
  /** Saved for an enrolled learner (free-preview tries and the course team's previews aren't). */
  saved: boolean
  best: QuizBest | null
  /** Passing completed the last lesson. */
  certificate_code: string | null
}

/** POST/PATCH/DELETE of a course lesson also return the course's review status after the change. */
export type CourseLessonSaved = CourseLesson & { course_revision: CourseRevisionInfo | null }

/** GET /api/learning/courses/<slug>/lessons/<id>/: a course's own lesson, for the lesson page. */
export interface CourseLessonContent {
  id: number
  /** Its place in the outline; null only when the course team opens a lesson not in the outline. */
  item_id: number | null
  kind: CourseLessonType
  title: string
  video_url: string
  duration: string
  /** Sanitised HTML. */
  body: string
  is_preview: boolean
  minutes: number
  /** Only for the course team: this shows edits still waiting for Genex review (learners see the approved version). */
  has_pending: boolean
  /** False when Genex hasn't reviewed the lesson yet (only the course team can open it then). */
  approved: boolean
  /** Quizzes only (null otherwise): the questions without their answers, and the viewer's best result so far. */
  quiz: { questions: QuizQuestionForLearner[]; pass_mark: number; best: QuizBest | null } | null
}

/** Why a lesson didn't open (403): sign in, enroll, or buy the course. */
export interface CourseLessonBlock {
  detail: string
  code: 'sign_in' | 'enroll' | 'paid'
  title: string
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
  /** Set once every lesson has been opened from the course page. */
  certificate_code: string | null
}

/** GET /api/learning/certificates/<code>/ (and each row of /me/certificates/). */
export interface CertificateInfo {
  code: string
  status: 'valid' | 'revoked'
  issued_at: string
  is_mine: boolean
  /** Only for the learner, on a revoked certificate. */
  revoked_reason?: string
  learner_name?: string
  can_correct_name?: boolean
  course: { title: string; slug?: string; level?: CourseLevel; lessons?: number; minutes?: number; path?: string | null }
  instructors?: { name: string; username: string; role_title: string; company: { name: string; logo_url: string | null } | null }[]
  publisher?: { name: string; slug: string; logo_url: string | null } | null
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
  /** What changed: course fields, plus "faqs", "outline" and "lessons" (edits to its own lessons). */
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
