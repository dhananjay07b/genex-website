import type { ContentAccess, Topic } from './api'

/** Admin is not an account type — it's `is_admin` (the superuser). */
export type AccountType = 'learner' | 'professional' | 'company'
/** The account types someone can pick for themselves; Company logins are issued by Admin. */
export type SelfServiceAccountType = Exclude<AccountType, 'company'>

/** How a user's company is displayed. `verified` drives the logo + badge. */
export interface CompanyDisplay {
  name: string
  slug: string | null
  logo_url: string | null
  verified: boolean
}

/** A registered company, as offered in the Professional company picker. */
export interface CompanyOption {
  id: number
  name: string
  slug: string
  logo_url: string | null
  domains: string[]
}

export interface RegisterInput {
  username: string
  email: string
  password: string
  displayName: string
  accountType: SelfServiceAccountType
  companyId?: number | null
  companyOther?: string
  roleTitle?: string
}

export interface User {
  id: number
  username: string
  email: string
  display_name: string
  bio: string
  avatar_url: string | null
  cover_photo_url: string | null
  account_type: AccountType
  is_admin: boolean
  company: CompanyDisplay | null
  company_other: string
  company_verified: boolean
  role_title: string
  years_experience: number | null
  linkedin_url: string
  expertise: number[]
}

export interface PublicUser {
  id: number
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
}

export interface PublicProfile {
  id: number
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  cover_photo_url: string | null
  date_joined: string
  account_type: AccountType
  is_admin: boolean
  company: CompanyDisplay | null
  role_title: string
  years_experience: number | null
  linkedin_url: string
  expertise: Topic[]
  published_blog_count: number
  published_video_count: number
  podcast_appearance_count: number
  followers_count: number
  following_count: number
}

export interface Comment {
  id: number
  content_type: string
  object_id: number
  author: number
  author_name: string
  parent: number | null
  body: string
  status: 'visible' | 'hidden' | 'flagged'
  created_at: string
  edited_at: string | null
}

export interface SavedItem {
  id: number
  content_type: string
  object_id: number
  title: string | null
  image_url: string | null
  created_at: string
}

export interface UserBlogPost {
  id: number
  title: string
  excerpt: string
  body: string
  topics: number[]
  other_topic: string
  image_url: string | null
  status: 'draft' | 'pending' | 'published' | 'rejected'
  access: ContentAccess
  price: string | null
  rejection_reason: string
  created_at: string
  submitted_at: string | null
}

export interface UserVideoPost {
  id: number
  title: string
  excerpt: string
  video_url: string
  topic: string
  duration: string
  thumbnail_url: string | null
  status: 'draft' | 'pending' | 'published' | 'rejected'
  access: ContentAccess
  price: string | null
  rejection_reason: string
  created_at: string
  submitted_at: string | null
}

export interface FollowRow {
  user: PublicUser
  created_at: string
}

export interface SocialAccount {
  id: number
  provider: string
  email: string
  date_joined: string
}

export interface Notification {
  id: number
  kind: 'blog_status' | 'video_status' | 'comment_reply'
  text: string
  content_type: string | null
  object_id: number | null
  is_read: boolean
  created_at: string
}
