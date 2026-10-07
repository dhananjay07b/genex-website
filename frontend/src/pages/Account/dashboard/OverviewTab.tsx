import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import { marketingPath } from '@/lib/host'
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
  course_status: SchoolOutlinedIcon,
  course_review: SchoolOutlinedIcon,
  review_reply: ChatBubbleOutlineOutlinedIcon,
  video_submission: VideocamOutlinedIcon,
  comment_reply: ChatBubbleOutlineOutlinedIcon,
  comment: ChatBubbleOutlineOutlinedIcon,
}

interface OverviewTabProps {
  onSelectTab: (tab: TabKey) => void
  /** Professionals publish posts/videos; everyone else doesn't see those stats. */
  canPublish: boolean
}

interface Counts {
  learning: number
  blogposts: number
  videos: number
  podcasts: number
  saved: number
}

const STATS: { key: keyof Counts; label: string; icon: typeof ArticleOutlinedIcon; professionalOnly?: boolean; learnerTab?: boolean }[] = [
  { key: 'learning', label: 'Enrolled Courses', icon: AutoStoriesOutlinedIcon, learnerTab: true },
  { key: 'blogposts', label: 'Blog Posts', icon: ArticleOutlinedIcon, professionalOnly: true },
  { key: 'videos', label: 'Videos', icon: VideocamOutlinedIcon, professionalOnly: true },
  { key: 'podcasts', label: 'Podcast Features', icon: MicNoneOutlinedIcon, professionalOnly: true },
  { key: 'saved', label: 'Saved Items', icon: BookmarkBorderIcon },
]

export function OverviewTab({ onSelectTab, canPublish }: OverviewTabProps) {
  const { user } = useAuth()
  const [counts, setCounts] = useState<Counts | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[] | null>(null)

  useEffect(() => {
    Promise.all([
      canPublish ? apiFetch<UserBlogPost[]>('/api/snippets/blog-submissions/mine/').catch(() => []) : Promise.resolve([]),
      canPublish ? apiFetch<UserVideoPost[]>('/api/snippets/video-submissions/mine/').catch(() => []) : Promise.resolve([]),
      apiFetch<SnippetListResponse<unknown>>('/api/accounts/me/podcast-appearances/?limit=1').catch(() => ({ count: 0 }) as SnippetListResponse<unknown>),
      apiFetch<SavedItem[]>('/api/engagement/saved-items/').catch(() => []),
      apiFetch<SnippetListResponse<unknown>>('/api/learning/me/enrollments/?limit=1').catch(() => ({ count: 0 }) as SnippetListResponse<unknown>),
    ]).then(([blogposts, videos, podcasts, saved, learning]) => {
      setCounts({
        learning: learning.count,
        blogposts: blogposts.length,
        videos: videos.length,
        podcasts: podcasts.count,
        saved: saved.length,
      })
    })
    apiFetch<ActivityEntry[]>('/api/accounts/me/activity/').then(setActivity).catch(() => setActivity([]))
  }, [canPublish])

  const isCompany = user?.account_type === 'company'
  const stats = STATS.filter(stat => (canPublish || !stat.professionalOnly) && !(isCompany && stat.learnerTab))

  return (
    <div>
      <h1 className="text-xl font-extrabold text-text-primary mb-5">Overview</h1>

      {user?.account_type === 'learner' && !user.is_admin && (
        <a
          href={marketingPath('/contact')}
          className="w-full mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 sm:p-5 text-left hover:border-primary transition-colors group"
        >
          <span className="size-10 shrink-0 rounded-full bg-white text-primary flex items-center justify-center">
            <ArticleOutlinedIcon sx={{ fontSize: 19 }} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-bold text-text-primary">Want to publish on GeLearn?</span>
            <span className="block text-xs text-text-muted mt-0.5">
              Professional accounts post articles and videos, build courses and appear on podcasts. Contact us to have your account upgraded.
            </span>
          </span>
          <ArrowForwardIcon sx={{ fontSize: 18 }} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </a>
      )}

      <div className={`grid grid-cols-2 ${stats.length >= 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-2'} gap-4 mb-8`}>
        {stats.map(stat => {
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
