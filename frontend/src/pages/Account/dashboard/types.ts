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

// The card's cover placeholder (behind the uploaded image, or standing in
// for it) — one fixed color per status, so a glance at the grid shows what
// needs attention without reading every badge.
export const STATUS_GRADIENT: Record<SubmissionStatus, string> = {
  draft: 'bg-linear-to-br from-slate-400 to-slate-600',
  pending: 'bg-linear-to-br from-amber-500 to-orange-500',
  published: 'bg-linear-to-br from-emerald-500 to-green-600',
  rejected: 'bg-linear-to-br from-rose-500 to-red-600',
}
