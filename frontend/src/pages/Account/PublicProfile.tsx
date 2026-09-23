import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined'
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl, formatRelativeTime, cn } from '@/lib/utils'
import { useAuth } from '@/context/useAuth'
import type { PublicProfile as PublicProfileType, FollowRow, User } from '@/types/auth'
import type { BlogPostItem, VideoItem, PodcastItem, SnippetListResponse } from '@/types/api'
import { EmptyState } from './dashboard/EmptyState'

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>()
  const { user: viewer, refetch: refetchViewer } = useAuth()
  const isSelf = !!viewer && viewer.username === username

  const [profile, setProfile] = useState<PublicProfileType | null | undefined>(undefined)
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [podcasts, setPodcasts] = useState<PodcastItem[]>([])
  const [filterState, setFilterState] = useState<{ forUsername: string; value: 'blogposts' | 'videos' | 'podcasts' } | null>(null)
  const filter = filterState && filterState.forUsername === username ? filterState.value : null

  const [following, setFollowing] = useState<{ forUsername: string; value: boolean } | null>(null)
  const [followBusy, setFollowBusy] = useState(false)

  const [userList, setUserList] = useState<{ mode: 'followers' | 'following'; rows: FollowRow[] | null } | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  useEffect(() => {
    if (!username) return
    apiFetch<PublicProfileType>(`/api/accounts/users/${username}/`)
      .then(setProfile)
      .catch(() => setProfile(null))

    apiFetch<SnippetListResponse<BlogPostItem>>(`/api/accounts/users/${username}/blog-posts/?limit=50`)
      .then(res => setBlogPosts(res.results)).catch(() => setBlogPosts([]))
    apiFetch<SnippetListResponse<VideoItem>>(`/api/accounts/users/${username}/videos/?limit=50`)
      .then(res => setVideos(res.results)).catch(() => setVideos([]))
    apiFetch<SnippetListResponse<PodcastItem>>(`/api/accounts/users/${username}/podcast-appearances/?limit=50`)
      .then(res => setPodcasts(res.results)).catch(() => setPodcasts([]))
  }, [username])

  useEffect(() => {
    if (!viewer || !username || viewer.username === username) return
    apiFetch<SnippetListResponse<FollowRow>>(`/api/engagement/users/${viewer.username}/following/?limit=200`)
      .then(res => setFollowing({ forUsername: username, value: res.results.some(row => row.user.username === username) }))
      .catch(() => setFollowing({ forUsername: username, value: false }))
  }, [viewer, username])

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

  function toggleFilter(key: 'blogposts' | 'videos' | 'podcasts') {
    if (!username) return
    setFilterState(filter === key ? null : { forUsername: username, value: key })
  }

  function openUserList(mode: 'followers' | 'following') {
    if (!username) return
    setUserList({ mode, rows: null })
    apiFetch<SnippetListResponse<FollowRow>>(`/api/engagement/users/${username}/${mode}/?limit=200`)
      .then(res => setUserList({ mode, rows: res.results }))
      .catch(() => setUserList({ mode, rows: [] }))
  }

  async function handleUpload(field: 'avatar' | 'cover-photo', file: File, setUploading: (v: boolean) => void) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await apiFetch<User>(`/api/accounts/me/${field}/`, { method: 'POST', body: formData })
      await refetchViewer()
      if (username) {
        const fresh = await apiFetch<PublicProfileType>(`/api/accounts/users/${username}/`)
        setProfile(fresh)
      }
    } finally {
      setUploading(false)
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
  const hasAnyContent = blogPosts.length > 0 || videos.length > 0 || podcasts.length > 0
  const showBlogPosts = filter === null || filter === 'blogposts'
  const showVideos = filter === null || filter === 'videos'
  const showPodcasts = filter === null || filter === 'podcasts'
  const hasVisibleContent =
    (showBlogPosts && blogPosts.length > 0) ||
    (showVideos && videos.length > 0) ||
    (showPodcasts && podcasts.length > 0)
  const FILTER_LABEL: Record<'blogposts' | 'videos' | 'podcasts', string> = {
    blogposts: 'blog posts', videos: 'videos', podcasts: 'podcast appearances',
  }

  return (
    <main className="pb-10 bg-white">
      <PageMeta
        title={`${profile.display_name || profile.username} — Genex GeLearn`}
        description={profile.bio || `${profile.display_name || profile.username}'s GeLearn profile.`}
        canonical={`/u/${profile.username}`}
        image={profile.avatar_url}
      />

      {/* Cover */}
      <div
        className="h-44 sm:h-56 bg-linear-to-br from-primary to-secondary relative overflow-hidden mt-16 bg-cover bg-center rounded-b-4xl"
        style={profile.cover_photo_url ? { backgroundImage: `url(${getMediaUrl(profile.cover_photo_url)})` } : undefined}
      >
        {isSelf && (
          <>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute top-4 left-4 flex items-center gap-1.5 bg-dark-bg/40 border border-white/50 text-white text-xs font-bold px-3.5 py-2 rounded-full disabled:opacity-60 hover:bg-dark-bg/60 transition-colors"
            >
              <PhotoCameraOutlinedIcon sx={{ fontSize: 14 }} />
              {uploadingCover ? 'Uploading…' : 'Edit Cover Photo'}
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void handleUpload('cover-photo', file, setUploadingCover)
                e.target.value = ''
              }}
            />
            <Link
              to="/account"
              className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 text-text-primary text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer hover:bg-white transition-colors"
            >
              <ArrowBackOutlinedIcon sx={{ fontSize: 14 }} /> Back to Dashboard
            </Link>
          </>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-6 sm:-mt-8 pb-6 border-b border-border">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
            <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-white bg-primary text-white text-2xl font-extrabold flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={getMediaUrl(profile.avatar_url)} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </span>
            {isSelf && (
              <>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label={uploadingAvatar ? 'Uploading photo…' : 'Change photo'}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-border text-primary flex items-center justify-center shadow-sm hover:border-primary transition-colors disabled:opacity-60"
                >
                  <PhotoCameraOutlinedIcon sx={{ fontSize: 14 }} />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) void handleUpload('avatar', file, setUploadingAvatar)
                    e.target.value = ''
                  }}
                />
              </>
            )}
          </div>

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

        {isSelf && (
          <p className="text-xs text-text-muted mt-3">
            This is how your profile looks to everyone else. The edit controls above are only visible to you, and any
            changes stay in sync with Settings.
          </p>
        )}

        {profile.bio && (
          <p className="text-sm text-text-primary leading-relaxed mt-6 max-w-2xl">{profile.bio}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-3">
          <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
          Joined {joined}
        </div>

        <div className="flex flex-wrap gap-2.5 mt-5">
          <button
            type="button"
            onClick={() => openUserList('followers')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
          >
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            {profile.followers_count} Followers
          </button>
          <button
            type="button"
            onClick={() => openUserList('following')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border text-xs font-bold text-text-primary hover:border-primary hover:text-primary transition-colors"
          >
            <PeopleOutlineOutlinedIcon sx={{ fontSize: 14 }} />
            {profile.following_count} Following
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8">
          <button
            type="button"
            onClick={() => toggleFilter('blogposts')}
            className={cn(
              'text-left hover:shadow-lg border rounded-2xl p-4 sm:p-5 transition-colors',
              filter === 'blogposts' ? 'border-primary bg-primary/15 shadow-lg' : 'border-border bg-surface hover:border-primary'
            )}
          >
            <p className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.published_blog_count}</p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Blog Posts</p>
          </button>
          <button
            type="button"
            onClick={() => toggleFilter('videos')}
            className={cn(
              'text-left hover:shadow-lg border rounded-2xl p-4 sm:p-5 transition-colors',
              filter === 'videos' ? 'border-primary bg-primary/15 shadow-lg' : 'border-border bg-surface hover:border-primary'
            )}
          >
            <p className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.published_video_count}</p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Videos</p>
          </button>
          <button
            type="button"
            onClick={() => toggleFilter('podcasts')}
            className={cn(
              'text-left hover:shadow-lg border rounded-2xl p-4 sm:p-5 transition-colors',
              filter === 'podcasts' ? 'border-primary bg-primary/15 shadow-lg' : 'border-border bg-surface hover:border-primary'
            )}
          >
            <p className="text-xl sm:text-2xl font-extrabold text-text-primary">{profile.podcast_appearance_count}</p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">Podcast Features</p>
          </button>
        </div>

        {/* Content sections */}
        <div className="py-10">
          {!hasVisibleContent ? (
            <EmptyState
              icon={<ArticleOutlinedIcon sx={{ fontSize: 22 }} />}
              title={filter ? `No ${FILTER_LABEL[filter]} yet` : 'Nothing published yet'}
              description={
                hasAnyContent
                  ? `${profile.display_name || profile.username} hasn't published any ${FILTER_LABEL[filter!]} yet.`
                  : `${profile.display_name || profile.username} hasn't published anything here yet.`
              }
            />
          ) : (
            <div className="flex flex-col gap-8">
              {showBlogPosts && blogPosts.length > 0 && (
                <div>
                  <p className="text-sm font-extrabold text-text-primary mb-3">Published Blog Posts</p>
                  <div className="flex flex-col gap-2.5">
                    {blogPosts.map(post => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        className="border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary hover:shadow-sm transition-all"
                      >
                        <span className="w-9 h-9 rounded-xl bg-surface text-primary flex items-center justify-center shrink-0 overflow-hidden">
                          {post.image_url ? (
                            <img src={getMediaUrl(post.image_url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ArticleOutlinedIcon sx={{ fontSize: 17 }} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{post.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{post.topic} · Published {formatRelativeTime(post.date)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {showVideos && videos.length > 0 && (
                <div>
                  <p className="text-sm font-extrabold text-text-primary mb-3">Published Videos</p>
                  <div className="flex flex-col gap-2.5">
                    {videos.map(video => (
                      <Link
                        key={video.id}
                        to={`/videos/${video.id}`}
                        className="border border-border rounded-2xl overflow-hidden flex items-center gap-3.5 hover:border-primary hover:shadow-sm transition-all"
                      >
                        <div className="w-32 sm:w-36 h-20 bg-linear-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 relative overflow-hidden">
                          {video.image_url && (
                            <img src={getMediaUrl(video.image_url)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          )}
                          <span className="relative w-8 h-8 rounded-full bg-white/25 border border-white/70 flex items-center justify-center text-white">
                            <PlayArrowOutlinedIcon sx={{ fontSize: 16 }} />
                          </span>
                        </div>
                        <div className="min-w-0 py-2">
                          <p className="text-sm font-bold text-text-primary truncate">{video.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {video.category}{video.duration ? ` · ${video.duration}` : ''} · Published {formatRelativeTime(video.date)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {showPodcasts && podcasts.length > 0 && (
                <div>
                  <p className="text-sm font-extrabold text-text-primary mb-3">Podcast Appearances</p>
                  <div className="flex flex-col gap-2.5">
                    {podcasts.map(ep => (
                      <div key={ep.id} className="border border-border rounded-2xl p-4 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-surface text-primary flex items-center justify-center shrink-0">
                          <MicNoneOutlinedIcon sx={{ fontSize: 17 }} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text-primary truncate">{ep.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Guest{ep.guest_role ? ` · ${ep.guest_role}` : ''} · {new Date(ep.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Comments, saved items, and drafts stay private — only published work shows here.
            </p>
          </div>
        </div>
      </div>

      {/* Followers / Following modal */}
      {userList && (
        <div className="fixed inset-0 bg-dark-bg/45 flex items-center justify-center z-50 p-4" onClick={() => setUserList(null)}>
          <div
            className="w-full max-w-sm max-h-[80vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
              <p className="text-base font-extrabold text-text-primary capitalize">
                {userList.mode} {userList.rows ? `(${userList.rows.length})` : ''}
              </p>
              <button type="button" onClick={() => setUserList(null)} className="text-text-muted hover:text-text-primary">
                <CloseOutlinedIcon sx={{ fontSize: 18 }} />
              </button>
            </div>
            <div className="overflow-y-auto px-3 py-2">
              {userList.rows === null ? null : userList.rows.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-8">No one here yet.</p>
              ) : (
                userList.rows.map(row => (
                  <Link
                    key={row.user.id}
                    to={`/u/${row.user.username}`}
                    onClick={() => setUserList(null)}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-surface transition-colors"
                  >
                    <span className="w-10 h-10 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center overflow-hidden shrink-0">
                      {row.user.avatar_url ? (
                        <img src={getMediaUrl(row.user.avatar_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (row.user.display_name || row.user.username).slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">{row.user.display_name || row.user.username}</p>
                      <p className="text-xs text-text-muted truncate">@{row.user.username}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
