import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl, cn } from '@/lib/utils'
import { useAuth } from '@/context/useAuth'
import type { PublicProfile as PublicProfileType, UserBlogPost, UserVideoPost, FollowRow } from '@/types/auth'
import type { SnippetListResponse } from '@/types/api'
import { EmptyState } from './dashboard/EmptyState'

type ContentTab = 'blogposts' | 'videos' | 'podcasts'

const TABS: { key: ContentTab; label: string; icon: typeof ArticleOutlinedIcon }[] = [
  { key: 'blogposts', label: 'Blog Posts', icon: ArticleOutlinedIcon },
  { key: 'videos', label: 'Videos', icon: VideocamOutlinedIcon },
  { key: 'podcasts', label: 'Podcasts', icon: MicNoneOutlinedIcon },
]

interface PublicContentItem {
  id: number
  title: string
  excerpt?: string
  description?: string
  image_url: string | null
  date: string
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const { user: viewer } = useAuth()

  const [profile, setProfile] = useState<PublicProfileType | null | undefined>(undefined)
  const [tab, setTab] = useState<ContentTab>('blogposts')
  const [items, setItems] = useState<{ forUsername: string; tab: ContentTab; results: PublicContentItem[] } | null>(null)

  const [following, setFollowing] = useState<{ forUsername: string; value: boolean } | null>(null)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    if (!username) return
    apiFetch<PublicProfileType>(`/api/accounts/users/${username}/`)
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [username])

  useEffect(() => {
    if (!username) return
    const endpoint =
      tab === 'blogposts' ? `/api/accounts/users/${username}/blog-posts/?limit=50` :
      tab === 'videos'    ? `/api/accounts/users/${username}/videos/?limit=50` :
                             `/api/accounts/users/${username}/podcast-appearances/?limit=50`
    apiFetch<SnippetListResponse<UserBlogPost & UserVideoPost & { description?: string; date: string; image_url: string | null }>>(endpoint)
      .then(res => setItems({ forUsername: username, tab, results: res.results as unknown as PublicContentItem[] }))
      .catch(() => setItems({ forUsername: username, tab, results: [] }))
  }, [username, tab])

  useEffect(() => {
    if (!viewer || !username || viewer.username === username) return
    apiFetch<SnippetListResponse<FollowRow>>(`/api/engagement/users/${viewer.username}/following/?limit=200`)
      .then(res => setFollowing({ forUsername: username, value: res.results.some(row => row.user.username === username) }))
      .catch(() => setFollowing({ forUsername: username, value: false }))
  }, [viewer, username])

  const currentItems = items && items.forUsername === username && items.tab === tab ? items.results : null
  const currentFollowing = following && following.forUsername === username ? following.value : null

  async function handleToggleFollow() {
    if (!username || followBusy) return
    setFollowBusy(true)
    const prev = currentFollowing
    setFollowing({ forUsername: username, value: !prev })
    try {
      const res = await apiFetch<{ following: boolean }>(`/api/engagement/follow/${username}/toggle/`, { method: 'POST' })
      setFollowing({ forUsername: username, value: res.following })
      setProfile(p => p ? { ...p, followers_count: p.followers_count + (res.following ? 1 : -1) } : p)
    } catch {
      setFollowing({ forUsername: username, value: !!prev })
    } finally {
      setFollowBusy(false)
    }
  }

  if (profile === undefined) return null

  if (profile === null) {
    return (
      <main>
        <PageMeta title="Profile Not Found — Genex GeLearn" description="This GeLearn profile could not be found." noIndex />
        <div className="max-w-2xl mx-auto px-6 py-24">
          <EmptyState
            icon={<PersonAddOutlinedIcon sx={{ fontSize: 22 }} />}
            title="Profile not found"
            description="This GeLearn member doesn't exist, or the link is incorrect."
          />
        </div>
      </main>
    )
  }

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase()
  const joined = new Date(profile.date_joined).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const isSelf = viewer?.username === profile.username

  return (
    <main>
      <PageMeta
        title={`${profile.display_name || profile.username} — Genex GeLearn`}
        description={profile.bio || `${profile.display_name || profile.username}'s GeLearn profile.`}
        canonical={`/u/${profile.username}`}
        image={profile.avatar_url}
      />

      {/* Cover */}
      <div className="h-44 sm:h-56 bg-brand-tint relative overflow-hidden">
        {profile.cover_photo_url && (
          <img src={getMediaUrl(profile.cover_photo_url)} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 sm:-mt-14 pb-8 border-b border-border">
          <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white bg-primary text-white text-2xl font-extrabold flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <img src={getMediaUrl(profile.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </span>

          <div className="flex-1 min-w-0 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-extrabold text-text-primary">{profile.display_name || profile.username}</h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {profile.membership_tier.name}
              </span>
            </div>
            <p className="text-sm text-text-muted mt-0.5">@{profile.username}</p>
          </div>

          {!isSelf && viewer && (
            <Button
              variant={currentFollowing ? 'secondary' : 'primary'}
              size="md"
              onClick={handleToggleFollow}
              disabled={currentFollowing === null || followBusy}
              className="sm:pb-1"
            >
              {currentFollowing ? (
                <>
                  <PersonRemoveOutlinedIcon sx={{ fontSize: 16 }} />
                  Following
                </>
              ) : (
                <>
                  <PersonAddOutlinedIcon sx={{ fontSize: 16 }} />
                  Follow
                </>
              )}
            </Button>
          )}
        </div>

        {profile.bio && (
          <p className="text-sm text-text-primary leading-relaxed mt-6 max-w-2xl">{profile.bio}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-3">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
          Joined {joined}
        </div>

        <div className="flex flex-wrap gap-2.5 mt-5">
          <span className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-text-primary">
            {profile.followers_count} Followers
          </span>
          <span className="px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-text-primary">
            {profile.following_count} Following
          </span>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
          {TABS.map(t => {
            const Icon = t.icon
            const count = t.key === 'blogposts' ? profile.published_blog_count
              : t.key === 'videos' ? profile.published_video_count
              : profile.podcast_appearance_count
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'text-left border rounded-2xl p-4 sm:p-5 transition-colors',
                  tab === t.key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                )}
              >
                <span className="w-9 h-9 rounded-xl bg-surface text-primary flex items-center justify-center">
                  <Icon sx={{ fontSize: 17 }} />
                </span>
                <p className="text-xl font-extrabold text-text-primary mt-2.5">{count}</p>
                <p className="text-xs font-semibold text-text-muted mt-0.5">{t.label}</p>
              </button>
            )
          })}
        </div>

        {/* Content list */}
        <div className="py-10">
          {currentItems === null ? null : currentItems.length === 0 ? (
            <EmptyState
              icon={(() => { const Icon = TABS.find(t => t.key === tab)!.icon; return <Icon sx={{ fontSize: 22 }} /> })()}
              title={`No ${TABS.find(t => t.key === tab)!.label.toLowerCase()} yet`}
              description={`${profile.display_name || profile.username} hasn't published anything here yet.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentItems.map(item => {
                const Icon = TABS.find(t => t.key === tab)!.icon
                const body = item.excerpt || item.description || ''
                const inner = (
                  <div className="border border-border rounded-2xl overflow-hidden h-full">
                    <div className="h-32 bg-surface flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img src={getMediaUrl(item.image_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Icon sx={{ fontSize: 28 }} className="text-primary" />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-text-primary text-sm line-clamp-2">{item.title}</p>
                      {body && <p className="text-xs text-text-muted mt-1.5 line-clamp-2">{body}</p>}
                    </div>
                  </div>
                )
                return tab === 'blogposts' ? (
                  <Link key={item.id} to={`/blog/${item.id}`}>{inner}</Link>
                ) : (
                  <div key={item.id}>{inner}</div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
