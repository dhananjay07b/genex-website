import type { LayoutSection, MyHomeData, PublicHomeData } from '@/types/discovery'
import {
  CareersSection, CompanyStripSection, ContentRailSection, CourseRailSection, FaqSection, GoalTilesSection,
  HeroSection, IntentStripSection, LibraryTabsSection, LiveSessionsSection, NewAndPopularSection, PromoPairSection,
  RoleBandSection, StatsBannerSection, TestimonialsSection, TopicChipsSection, TrendingSearchesSection, type Viewer,
} from './sections'
import {
  BecauseSection, ClosingTendersSection, GoalCoursesSection, QuickVideosSection, ResumeSection, WelcomeSection,
} from './memberSections'
import type {
  BandValue, ContentRailValue, CourseRailValue, FaqValue, GoalTilesValue, HeadingValue, HeroValue, IntentStripValue,
  NewAndPopularValue, PrefixValue, PromoPairValue, StatsBannerValue, WelcomeValue,
} from './types'

interface HomeLayoutProps {
  /** Public home data; its `layout` is used for visitors. */
  data: PublicHomeData
  /** Signed-in data (/api/discovery/home/me/); when present, its `layout` is used instead. */
  me?: MyHomeData | null
  /** First name or display name, for the welcome section. */
  name?: string
  /** Who is viewing, for promos aimed at one audience. */
  viewer?: Viewer
}

/**
 * Renders the sections arranged in the CMS (GeLearn page → "Home page for
 * visitors" or "…for signed-in learners"), in order. Each section's words come
 * from the CMS; its courses, content and people come from the home APIs.
 * Signed-in-only sections are skipped when there's no signed-in data.
 */
export function HomeLayout({ data, me, name = '', viewer = 'visitor' }: HomeLayoutProps) {
  const layout = me ? me.layout : data.layout
  return (
    <>
      {layout.map(section => (
        <SectionSwitch key={section.id} section={section} data={data} me={me ?? null} name={name} viewer={viewer} />
      ))}
    </>
  )
}

interface SectionSwitchProps {
  section: LayoutSection
  data: PublicHomeData
  me: MyHomeData | null
  name: string
  viewer: Viewer
}

function SectionSwitch({ section, data, me, name, viewer }: SectionSwitchProps) {
  const v = section.value
  if (me) {
    switch (section.type) {
      case 'welcome': return <WelcomeSection value={v as unknown as WelcomeValue} me={me} name={name} />
      case 'resume': return <ResumeSection value={v as unknown as HeadingValue} me={me} />
      case 'because': return <BecauseSection value={v as unknown as PrefixValue} me={me} />
      case 'goal_courses': return <GoalCoursesSection value={v as unknown as PrefixValue} me={me} />
      case 'closing_tenders': return <ClosingTendersSection value={v as unknown as HeadingValue} me={me} />
      case 'quick_videos': return <QuickVideosSection value={v as unknown as HeadingValue} me={me} />
    }
  }
  switch (section.type) {
    case 'hero': return <HeroSection value={v as unknown as HeroValue} />
    case 'new_and_popular': return <NewAndPopularSection value={v as unknown as NewAndPopularValue} data={data} />
    case 'course_rail': return <CourseRailSection value={v as unknown as CourseRailValue} items={section.items ?? []} />
    case 'content_rail': return <ContentRailSection value={v as unknown as ContentRailValue} items={section.items ?? []} />
    case 'role_band': return <RoleBandSection value={v as unknown as BandValue} data={data} />
    case 'library_tabs': return <LibraryTabsSection value={v as unknown as BandValue} data={data} />
    case 'promo_pair': return <PromoPairSection value={v as unknown as PromoPairValue} viewer={viewer} />
    case 'company_strip': return <CompanyStripSection value={v as unknown as HeadingValue} data={data} />
    case 'goal_tiles': return <GoalTilesSection value={v as unknown as GoalTilesValue} />
    case 'topic_chips': return <TopicChipsSection value={v as unknown as HeadingValue} data={data} />
    case 'trending_searches': return <TrendingSearchesSection value={v as unknown as HeadingValue} data={data} />
    case 'intent_strip': return <IntentStripSection value={v as unknown as IntentStripValue} />
    case 'live_sessions': return <LiveSessionsSection value={v as unknown as HeadingValue} data={data} />
    case 'careers': return <CareersSection value={v as unknown as HeadingValue} data={data} />
    case 'stats_banner': return <StatsBannerSection value={v as unknown as StatsBannerValue} data={data} />
    case 'testimonials': return <TestimonialsSection value={v as unknown as HeadingValue} data={data} />
    case 'faq': return <FaqSection value={v as unknown as FaqValue} />
    default: return null
  }
}
