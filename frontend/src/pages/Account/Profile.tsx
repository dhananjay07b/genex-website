import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { useAuth } from '@/context/useAuth'
import { getMediaUrl, cn } from '@/lib/utils'
import { NotificationBell } from './dashboard/NotificationBell'
import { OverviewTab } from './dashboard/OverviewTab'
import { CompanyVerificationBanner } from './dashboard/CompanyVerificationBanner'
import { StudioShortcut } from './dashboard/StudioShortcut'
import { BlogPostsTab } from './dashboard/BlogPostsTab'
import { VideosTab } from './dashboard/VideosTab'
import { CoursesTab } from './dashboard/CoursesTab'
import { PodcastsTab } from './dashboard/PodcastsTab'
import { CommentsTab } from './dashboard/CommentsTab'
import { SavedItemsTab } from './dashboard/SavedItemsTab'
import { SettingsTab } from './dashboard/SettingsTab'
import { TAB_LABELS, type TabKey } from './dashboard/types'

const NAV_ITEMS: { key: TabKey; icon: typeof DashboardOutlinedIcon }[] = [
  { key: 'overview', icon: DashboardOutlinedIcon },
  { key: 'blogposts', icon: ArticleOutlinedIcon },
  { key: 'videos', icon: VideocamOutlinedIcon },
  { key: 'courses', icon: SchoolOutlinedIcon },
  { key: 'podcasts', icon: MicNoneOutlinedIcon },
  { key: 'comments', icon: ChatBubbleOutlineOutlinedIcon },
  { key: 'saved', icon: BookmarkBorderIcon },
  { key: 'settings', icon: SettingsOutlinedIcon },
]

// Posting is a Professional feature — Learners and Company staff don't get these tabs.
const PROFESSIONAL_TABS = new Set<TabKey>(['blogposts', 'videos', 'courses'])

export default function Profile() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // The sidebar is "stuck" once its sentinel (placed right where sticky
  // engages) scrolls past the sticky offset — only then is its natural top
  // position guaranteed to equal that offset, so only then can the "stuck"
  // height (assuming a 96px top) be applied without risking overflow.
  const navSentinelRef = useRef<HTMLDivElement>(null)
  const [isNavStuck, setIsNavStuck] = useState(false)

  useEffect(() => {
    const el = navSentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsNavStuck(!entry.isIntersecting),
      { rootMargin: '-97px 0px 0px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Before stuck, the sidebar's natural top equals the header band's own
  // rendered height — measuring it lets the "unstuck" height reach exactly
  // as far down as the stuck height does, instead of shrinking to fit
  // whatever content happens to be in it (leaving a gap above the footer).
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroHeight, setHeroHeight] = useState<number | null>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    // ResizeObserver's contentRect excludes the element's own padding
    // (this div has pt-16) — read the real border-box height instead via
    // the observed element itself, which always reflects the latest layout.
    const observer = new ResizeObserver(() => setHeroHeight(el.getBoundingClientRect().height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const navTopOffset = isNavStuck ? 96 : (heroHeight ?? 96)
  const navHeightStyle = { height: `calc(100vh - ${navTopOffset}px - 6rem)` }

  const canPublish = user?.account_type === 'professional'
  const navItems = NAV_ITEMS.filter(item => canPublish || !PROFESSIONAL_TABS.has(item.key))
  const rawTab = searchParams.get('tab')
  const tab: TabKey = rawTab && navItems.some(item => item.key === rawTab) ? (rawTab as TabKey) : 'overview'

  function selectTab(next: TabKey) {
    setSearchParams(next === 'overview' ? {} : { tab: next })
  }

  if (!user) return null

  const initials = (user.display_name || user.username).slice(0, 2).toUpperCase()

  return (
    <main className="flex flex-col min-h-screen pb-10">
      <PageMeta title="My Account — Genex GeLearn" description="Manage your Genex GeLearn account." canonical="/account" />

      {/* Header */}
      <div ref={heroRef} className="bg-brand-tint border-b border-border pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">GeLearn Account</p>
            <h1 className="text-3xl font-extrabold text-text-primary">Welcome back, {user.display_name || user.username}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <NotificationBell />

            <button
              type="button"
              onClick={() => selectTab('settings')}
              aria-label="Settings"
              className="inline-flex items-center justify-center size-9 rounded-full border border-border text-text-primary hover:border-primary hover:text-primary transition-colors"
            >
              <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
            </button>

            <div className="flex items-center gap-3 bg-white/75 border border-border rounded-full pl-2 pr-3.5 py-2">
              <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center overflow-hidden shrink-0">
                {user.avatar_url ? (
                  <img src={getMediaUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <span className="text-left hidden sm:block">
                <span className="block text-sm font-bold text-text-primary leading-tight mb-0.5">{user.display_name || user.username}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="bg-white py-10 flex-1 flex">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-7 lg:items-stretch w-full">
          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <div ref={navSentinelRef} />
            <div
              className="bg-white border border-border rounded-2xl p-3 sticky top-24 overflow-y-auto flex flex-col"
              style={navHeightStyle}
            >
              <nav className="flex flex-col gap-0.5">
                {navItems.map(item => {
                  const Icon = item.icon
                  const active = item.key === tab
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => selectTab(item.key)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors',
                        active ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary font-semibold hover:bg-surface'
                      )}
                    >
                      <Icon sx={{ fontSize: 18 }} />
                      {TAB_LABELS[item.key]}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="rounded-xl bg-surface p-3.5 text-xs text-text-muted leading-relaxed">
                  <span className="font-bold text-text-primary">Coming to GeLearn:</span> course progress &amp; certificates.
                  This account is ready for it — same profile, more to track.
                </div>
              </div>
            </div>
          </div>

          {/* Mobile tab select */}
          <div className="lg:hidden w-full mb-2">
            <select
              value={tab}
              onChange={e => selectTab(e.target.value as TabKey)}
              className="w-full h-11 rounded-md border border-border bg-white px-3.5 text-sm font-semibold text-text-primary outline-none"
            >
              {navItems.map(item => (
                <option key={item.key} value={item.key}>{TAB_LABELS[item.key]}</option>
              ))}
            </select>
          </div>

          {/* Active tab */}
          <div className="flex-1 min-w-0 flex flex-col">
            <CompanyVerificationBanner />
            <StudioShortcut />
            {tab === 'overview' && <OverviewTab onSelectTab={selectTab} canPublish={canPublish} />}
            {tab === 'blogposts' && <BlogPostsTab />}
            {tab === 'videos' && <VideosTab />}
            {tab === 'courses' && <CoursesTab />}
            {tab === 'podcasts' && <PodcastsTab />}
            {tab === 'comments' && <CommentsTab />}
            {tab === 'saved' && <SavedItemsTab />}
            {tab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </section>
    </main>
  )
}
