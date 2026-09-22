import { useEffect, useState } from 'react'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { apiFetch } from '@/lib/api/client'
import type { SavedItem, UserBlogPost, UserVideoPost } from '@/types/auth'
import type { SnippetListResponse } from '@/types/api'
import type { TabKey } from './types'

interface OverviewTabProps {
  onSelectTab: (tab: TabKey) => void
}

interface Counts {
  blogposts: number
  videos: number
  podcasts: number
  saved: number
}

const STATS: { key: keyof Counts; label: string; icon: typeof ArticleOutlinedIcon }[] = [
  { key: 'blogposts', label: 'Blog Posts', icon: ArticleOutlinedIcon },
  { key: 'videos', label: 'Videos', icon: VideocamOutlinedIcon },
  { key: 'podcasts', label: 'Podcast Features', icon: MicNoneOutlinedIcon },
  { key: 'saved', label: 'Saved Items', icon: BookmarkBorderIcon },
]

export function OverviewTab({ onSelectTab }: OverviewTabProps) {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch<UserBlogPost[]>('/api/snippets/blog-submissions/mine/').catch(() => []),
      apiFetch<UserVideoPost[]>('/api/snippets/video-submissions/mine/').catch(() => []),
      apiFetch<SnippetListResponse<unknown>>('/api/accounts/me/podcast-appearances/?limit=1').catch(() => ({ count: 0 }) as SnippetListResponse<unknown>),
      apiFetch<SavedItem[]>('/api/engagement/saved-items/').catch(() => []),
    ]).then(([blogposts, videos, podcasts, saved]) => {
      setCounts({
        blogposts: blogposts.length,
        videos: videos.length,
        podcasts: podcasts.count,
        saved: saved.length,
      })
    })
  }, [])

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">Overview</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map(stat => {
          const Icon = stat.icon
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => onSelectTab(stat.key)}
              className="text-left border border-border rounded-2xl p-5 hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-surface text-primary flex items-center justify-center">
                  <Icon sx={{ fontSize: 18 }} />
                </span>
                <ArrowForwardIcon
                  sx={{ fontSize: 15 }}
                  className="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all"
                />
              </div>
              <p className="text-2xl font-extrabold text-text-primary mt-3">{counts?.[stat.key] ?? '–'}</p>
              <p className="text-xs font-semibold text-text-muted mt-0.5">{stat.label}</p>
            </button>
          )
        })}
      </div>

      <div className="border border-border rounded-2xl p-5 bg-surface">
        <p className="text-sm font-bold text-text-primary mb-1">Coming to GeLearn</p>
        <p className="text-xs text-text-muted leading-relaxed">
          Course progress &amp; certificates. This account is ready for it — same profile, more to track.
        </p>
      </div>
    </div>
  )
}
