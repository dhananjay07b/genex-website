import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { useAuth } from '@/context/useAuth'
import { getMediaUrl, cn } from '@/lib/utils'
import { NotificationBell } from './dashboard/NotificationBell'
import { OverviewTab } from './dashboard/OverviewTab'
import { BlogPostsTab } from './dashboard/BlogPostsTab'
import { VideosTab } from './dashboard/VideosTab'
import { PodcastsTab } from './dashboard/PodcastsTab'
import { CommentsTab } from './dashboard/CommentsTab'
import { SavedItemsTab } from './dashboard/SavedItemsTab'
import { SettingsTab } from './dashboard/SettingsTab'
import { TAB_LABELS, type TabKey } from './dashboard/types'

const NAV_ITEMS: { key: TabKey; icon: typeof DashboardOutlinedIcon }[] = [
  { key: 'overview', icon: DashboardOutlinedIcon },
  { key: 'blogposts', icon: ArticleOutlinedIcon },
  { key: 'videos', icon: VideocamOutlinedIcon },
  { key: 'podcasts', icon: MicNoneOutlinedIcon },
  { key: 'comments', icon: ChatBubbleOutlineOutlinedIcon },
  { key: 'saved', icon: BookmarkBorderIcon },
  { key: 'settings', icon: SettingsOutlinedIcon },
]

const VALID_TABS = new Set<TabKey>(NAV_ITEMS.map(n => n.key))

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [menuOpen, setMenuOpen] = useState(false)

  const rawTab = searchParams.get('tab')
  const tab: TabKey = rawTab && VALID_TABS.has(rawTab as TabKey) ? (rawTab as TabKey) : 'overview'

  function selectTab(next: TabKey) {
    setSearchParams(next === 'overview' ? {} : { tab: next })
    setMenuOpen(false)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  if (!user) return null

  const initials = (user.display_name || user.username).slice(0, 2).toUpperCase()

  return (
    <main>
      <PageMeta title="My Account — Genex GeLearn" description="Manage your Genex GeLearn account." canonical="/account" />

      {/* Header */}
      <div className="bg-brand-tint border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9 flex items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">GeLearn Account</p>
            <h1 className="text-3xl font-extrabold text-text-primary">Welcome back, {user.display_name || user.username}</h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <NotificationBell />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-3 bg-white/75 border border-border rounded-full pl-2 pr-3.5 py-2 hover:border-primary transition-colors"
              >
                <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-extrabold flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img src={getMediaUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <span className="text-left hidden sm:block">
                  <span className="block text-sm font-bold text-text-primary leading-tight">{user.display_name || user.username}</span>
                  <span className="block text-[11px] font-bold uppercase tracking-wide text-primary">{user.membership_tier.name}</span>
                </span>
                <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} className="text-text-muted" />
              </button>

              {menuOpen && (
                <div className="absolute top-14 right-0 w-56 bg-white border border-border rounded-2xl shadow-lg p-2 z-20">
                  <Link
                    to={`/u/${user.username}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
                  >
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
                    View Public Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => selectTab('settings')}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
                  >
                    <SettingsOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
                    Edit Profile &amp; Settings
                  </button>
                  <div className="h-px bg-border my-1.5" />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-7 lg:items-stretch">
          {/* Sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <nav className="bg-white border border-border rounded-2xl p-3 sticky top-24">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const active = item.key === tab
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => selectTab(item.key)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors mb-0.5',
                      active ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary font-semibold hover:bg-surface'
                    )}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    {TAB_LABELS[item.key]}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Mobile tab select */}
          <div className="lg:hidden w-full mb-2">
            <select
              value={tab}
              onChange={e => selectTab(e.target.value as TabKey)}
              className="w-full h-11 rounded-md border border-border bg-white px-3.5 text-sm font-semibold text-text-primary outline-none"
            >
              {NAV_ITEMS.map(item => (
                <option key={item.key} value={item.key}>{TAB_LABELS[item.key]}</option>
              ))}
            </select>
          </div>

          {/* Active tab */}
          <div className="flex-1 min-w-0">
            {tab === 'overview' && <OverviewTab onSelectTab={selectTab} />}
            {tab === 'blogposts' && <BlogPostsTab />}
            {tab === 'videos' && <VideosTab />}
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
