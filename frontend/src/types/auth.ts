export interface MembershipTier {
  slug: string
  name: string
  rank: number
}

export interface User {
  id: number
  username: string
  email: string
  display_name: string
  bio: string
  membership_tier: MembershipTier
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

export interface UserBlogPost {
  id: number
  title: string
  excerpt: string
  body: string
  topic: string
  status: 'draft' | 'pending' | 'published' | 'rejected'
  rejection_reason: string
  created_at: string
  submitted_at: string | null
}
