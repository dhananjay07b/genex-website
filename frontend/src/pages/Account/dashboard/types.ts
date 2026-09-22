export type TabKey = 'overview' | 'blogposts' | 'videos' | 'podcasts' | 'comments' | 'saved' | 'settings'

export const TAB_LABELS: Record<TabKey, string> = {
  overview: 'Overview',
  blogposts: 'My Blog Posts',
  videos: 'My Videos',
  podcasts: 'My Podcasts',
  comments: 'My Comments',
  saved: 'Saved Items',
  settings: 'Edit Profile & Settings',
}

export type SubmissionStatus = 'draft' | 'pending' | 'published' | 'rejected'

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: 'Draft',
  pending: 'Pending Review',
  published: 'Published',
  rejected: 'Rejected',
}

// Deliberately one neutral style for every status — the wireframe review
// settled on this after an earlier per-status color pass read as noisy.
export const STATUS_BADGE_CLASS = 'bg-[#f3f4f6] text-[#374151]'
