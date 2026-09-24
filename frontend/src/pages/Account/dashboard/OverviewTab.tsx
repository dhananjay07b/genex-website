import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { apiFetch } from '@/lib/api/client'
import { formatRelativeTime, getMediaUrl } from '@/lib/utils'
import type { SavedItem, UserBlogPost, UserVideoPost } from '@/types/auth'
import type { SnippetListResponse } from '@/types/api'
import type { TabKey } from './types'

interface ActivityEntry {
  id: string
  type: string
  title: string
  description: string | null
  image_url: string | null
  timestamp: string
  link: string
}

const ACTIVITY_ICON: Record<string, typeof ArticleOutlinedIcon> = {
  blog_status: ArticleOutlinedIcon,
  blog_submission: ArticleOutlinedIcon,
  video_status: VideocamOutlinedIcon,
  video_submission: VideocamOutlinedIcon,
  comment_reply: ChatBubbleOutlineOutlinedIcon,
  comment: ChatBubbleOutlineOutlinedIcon,
}

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
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null)

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
    apiFetch<ActivityEntry[]>('/api/accounts/me/activity/').then(setActivity).catch(() => setActivity([]))
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

      <h2 className="text-base font-extrabold text-text-primary mb-4">Recent Activity</h2>
      {!activity || activity.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-8 flex flex-col items-center text-center gap-2">
          <HistoryOutlinedIcon sx={{ fontSize: 22 }} className="text-text-muted" />
          <p className="text-sm text-text-muted">Nothing here yet — your submissions, comments, and updates will show up as they happen.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activity.map(entry => {
            const Icon = ACTIVITY_ICON[entry.type] ?? ArticleOutlinedIcon
            return (
              <Link
                key={entry.id}
                to={entry.link}
                className="flex items-center gap-3.5 border border-border rounded-2xl p-3.5 hover:border-primary hover:shadow-sm transition-all"
              >
                <span className="w-11 h-11 rounded-xl bg-surface text-primary flex items-center justify-center overflow-hidden shrink-0">
                  {entry.image_url ? (
                    <img src={getMediaUrl(entry.image_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon sx={{ fontSize: 18 }} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-text-primary truncate">{entry.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {entry.description ? `${entry.description} · ` : ''}{formatRelativeTime(entry.timestamp)}
                  </p>
                </div>
                <ArrowForwardIcon sx={{ fontSize: 15 }} className="text-text-muted shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
