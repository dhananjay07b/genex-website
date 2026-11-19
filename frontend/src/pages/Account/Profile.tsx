import { useSearchParams } from 'react-router-dom'
import { PageMeta } from '@/components/seo/PageMeta'
import { useAuth } from '@/context/useAuth'
import { useRole } from '@/hooks/useRole'
import { useAccountTab } from './dashboard/useAccountTab'
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
import type { TabKey } from './dashboard/types'
import { LearningTab } from './dashboard/LearningTab'

/** /account: the current tab's content. The header and menu come from AccountLayout. */
export default function Profile() {
  const { user } = useAuth()
  const [, setSearchParams] = useSearchParams()
  const { isProfessional: canPublish } = useRole()
  const tab = useAccountTab()

  function selectTab(next: TabKey) {
    setSearchParams(next === 'overview' ? {} : { tab: next })
  }

  if (!user) return null

  return (
    <div className="flex flex-col">
      <PageMeta title="My Account" description="Manage your Genex GeLearn account." canonical="/account" noIndex />
      <CompanyVerificationBanner />
      <StudioShortcut />
      {tab === 'overview' && <OverviewTab onSelectTab={selectTab} canPublish={canPublish} />}
      {tab === 'learning' && <LearningTab />}
      {tab === 'blogposts' && <BlogPostsTab />}
      {tab === 'videos' && <VideosTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'podcasts' && <PodcastsTab />}
      {tab === 'comments' && <CommentsTab />}
      {tab === 'saved' && <SavedItemsTab />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  )
}
