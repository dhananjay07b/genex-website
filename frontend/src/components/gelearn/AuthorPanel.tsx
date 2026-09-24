import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close'
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined'
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import { apiFetch } from '@/lib/api/client'
import { getMediaUrl, formatRelativeTime } from '@/lib/utils'
import { useAuth } from '@/context/useAuth'
import { Button } from '@/components/ui/Button'
import type { PublicProfile, FollowRow } from '@/types/auth'
import type { BlogPostItem, VideoItem, SnippetListResponse } from '@/types/api'

interface AuthorPanelProps {
  username: string | null
  onClose: () => void
}

interface RecentPost {
  id: string
  title: string
  date: string
  image_url: string | null
  link: string
  kind: 'blog' | 'video'
}

export function AuthorPanel({ username, onClose }: AuthorPanelProps) {
  const { user: viewer } = useAuth()
  const [profileState, setProfileState] = useState<{ forUsername: string; profile: PublicProfile | null } | null>(null)
  const [postsState, setPostsState] = useState<{ forUsername: string; posts: RecentPost[] } | null>(null)
  const [following, setFollowing] = useState<{ forUsername: string; value: boolean } | null>(null)
  const [followBusy, setFollowBusy] = useState(false)

  useEffect(() => {
    if (!username) return
    apiFetch<PublicProfile>(`/api/accounts/users/${username}/`)
      .then(profile => setProfileState({ forUsername: username, profile }))
      .catch(() => setProfileState({ forUsername: username, profile: null }))

    const empty = { count: 0, next: null, previous: null, results: [] }
    Promise.all([
      apiFetch<SnippetListResponse<BlogPostItem>>(`/api/accounts/users/${username}/blog-posts/?limit=10`).catch(() => empty as SnippetListResponse<BlogPostItem>),
      apiFetch<SnippetListResponse<VideoItem>>(`/api/accounts/users/${username}/videos/?limit=10`).catch(() => empty as SnippetListResponse<VideoItem>),
    ]).then(([blogRes, videoRes]) => {
      const merged: RecentPost[] = [
        ...blogRes.results.map(p => ({ id: `blog-${p.id}`, title: p.title, date: p.date, image_url: p.image_url, link: `/blog/${p.id}`, kind: 'blog' as const })),
        ...videoRes.results.map(v => ({ id: `video-${v.id}`, title: v.title, date: v.date, image_url: v.image_url, link: `/videos/${v.id}`, kind: 'video' as const })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
      setPostsState({ forUsername: username, posts: merged })
    })
  }, [username])

  useEffect(() => {
    if (!viewer || !username || viewer.username === username) return
    apiFetch<SnippetListResponse<FollowRow>>(`/api/engagement/users/${viewer.username}/following/?limit=200`)
      .then(res => setFollowing({ forUsername: username, value: res.results.some(row => row.user.username === username) }))
      .catch(() => setFollowing({ forUsername: username, value: false }))
  }, [viewer, username])

  const profile = profileState && profileState.forUsername === username ? profileState.profile : null
  const recentPosts = postsState && postsState.forUsername === username ? postsState.posts : null
  const currentFollowing = following && following.forUsername === username ? following.value : null
  const isSelf = !!viewer && viewer.username === username
  const initials = profile ? (profile.display_name || profile.username).slice(0, 2).toUpperCase() : ''

  async function handleToggleFollow() {
    if (!username || followBusy) return
    setFollowBusy(true)
    const prev = currentFollowing
    setFollowing({ forUsername: username, value: !prev })
    try {
      const res = await apiFetch<{ following: boolean }>(`/api/engagement/follow/${username}/toggle/`, { method: 'POST' })
      setFollowing({ forUsername: username, value: res.following })
      setProfileState(p => p ? { forUsername: p.forUsername, profile: p.profile ? { ...p.profile, followers_count: p.profile.followers_count + (res.following ? 1 : -1) } : null } : p)
    } catch {
      setFollowing({ forUsername: username, value: !!prev })
    } finally {
      setFollowBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {username && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-dark-bg/45 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 size-9 rounded-full bg-white/90 border border-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            {!profile ? (
              <div className="flex-1 flex items-center justify-center text-sm text-text-muted">Loading…</div>
            ) : (
              <>
                <div
                  className="h-32 shrink-0 bg-linear-to-br from-primary to-secondary relative"
                  style={profile.cover_photo_url ? { backgroundImage: `url(${getMediaUrl(profile.cover_photo_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                />
                <div className="relative px-6 -mt-14 flex items-end justify-between gap-3">
                  <span className="size-28 rounded-full bg-primary text-white text-2xl font-extrabold flex items-center justify-center overflow-hidden border-4 border-white shadow-sm shrink-0">
                    {profile.avatar_url ? (
                      <img src={getMediaUrl(profile.avatar_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </span>

                  {!isSelf && viewer && (
                    <Button
                      variant={currentFollowing ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={handleToggleFollow}
                      disabled={currentFollowing === null || followBusy}
                    >
                      {currentFollowing ? (
                        <>
                          <PersonRemoveOutlinedIcon sx={{ fontSize: 15 }} />
                          Following
                        </>
                      ) : (
                        <>
                          <PersonAddOutlinedIcon sx={{ fontSize: 15 }} />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="px-6 pt-4 flex-1 overflow-y-auto">
                  <h3 className="text-lg font-extrabold text-text-primary">{profile.display_name || profile.username}</h3>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary mt-0.5">{profile.membership_tier.name}</p>
                  {(profile.role_title || profile.company) && (
                    <p className="text-sm text-text-primary font-semibold mt-2">
                      {profile.role_title}{profile.role_title && profile.company ? ' at ' : ''}{profile.company}
                    </p>
                  )}
                  {profile.years_experience !== null && (
                    <p className="text-xs text-text-muted mt-0.5">{profile.years_experience} years of experience</p>
                  )}
                  {profile.bio && <p className="text-sm text-text-muted leading-relaxed mt-4">{profile.bio}</p>}

                  {profile.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profile.expertise.map(topic => (
                        <span key={topic.id} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary">
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-5 mt-6 text-sm">
                    <div>
                      <span className="font-extrabold text-text-primary">{profile.published_blog_count}</span>{' '}
                      <span className="text-text-muted">Posts</span>
                    </div>
                    <div>
                      <span className="font-extrabold text-text-primary">{profile.followers_count}</span>{' '}
                      <span className="text-text-muted">Followers</span>
                    </div>
                  </div>

                  {recentPosts && recentPosts.length > 0 && (
                    <div className="my-6">
                      <p className="text-sm font-extrabold text-text-primary mb-3">
                        Recent Activity from {profile.display_name || profile.username}
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {recentPosts.map(post => (
                          <Link
                            key={post.id}
                            to={post.link}
                            onClick={onClose}
                            className="flex items-center gap-3 border border-border rounded-xl p-2.5 hover:border-primary hover:shadow-sm transition-all"
                          >
                            <span className="w-10 h-10 rounded-lg bg-surface text-primary flex items-center justify-center overflow-hidden shrink-0">
                              {post.image_url ? (
                                <img src={getMediaUrl(post.image_url)} alt="" className="w-full h-full object-cover" />
                              ) : post.kind === 'video' ? (
                                <VideocamOutlinedIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <ArticleOutlinedIcon sx={{ fontSize: 16 }} />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">{post.title}</p>
                              <p className="text-[11px] text-text-muted mt-0.5">{formatRelativeTime(post.date)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-border shrink-0">
                  <Link
                    to={`/u/${profile.username}`}
                    className="w-full text-center bg-primary text-white text-sm font-bold rounded-md h-11 flex items-center justify-center hover:opacity-90 transition-opacity"
                  >
                    Show Full Profile
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
