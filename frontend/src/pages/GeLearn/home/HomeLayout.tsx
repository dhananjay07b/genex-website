import type { LayoutSection, PublicHomeData } from '@/types/discovery'
import {
  CareersSection, CompanyStripSection, ContentRailSection, CourseRailSection, FaqSection, GoalTilesSection,
  HeroSection, IntentStripSection, LibraryTabsSection, LiveSessionsSection, NewAndPopularSection, PromoPairSection,
  RoleBandSection, StatsBannerSection, TestimonialsSection, TopicChipsSection, TrendingSearchesSection,
} from './sections'
import type {
  BandValue, ContentRailValue, CourseRailValue, FaqValue, GoalTilesValue, HeadingValue, HeroValue, IntentStripValue,
  NewAndPopularValue, PromoPairValue, StatsBannerValue,
} from './types'

/**
 * Renders the sections arranged in the CMS (GeLearn page → "Home page for
 * visitors"), in order. Each section's words come from the CMS; its courses,
 * content and people come from the home API. Section types this page doesn't
 * render (signed-in only ones) are skipped.
 */
export function HomeLayout({ data }: { data: PublicHomeData }) {
  return (
    <>
      {data.layout.map(section => (
        <SectionSwitch key={section.id} section={section} data={data} />
      ))}
    </>
  )
}

function SectionSwitch({ section, data }: { section: LayoutSection; data: PublicHomeData }) {
  const v = section.value
  switch (section.type) {
    case 'hero': return <HeroSection value={v as unknown as HeroValue} />
    case 'new_and_popular': return <NewAndPopularSection value={v as unknown as NewAndPopularValue} data={data} />
    case 'course_rail': return <CourseRailSection value={v as unknown as CourseRailValue} items={section.items ?? []} />
    case 'content_rail': return <ContentRailSection value={v as unknown as ContentRailValue} items={section.items ?? []} />
    case 'role_band': return <RoleBandSection value={v as unknown as BandValue} data={data} />
    case 'library_tabs': return <LibraryTabsSection value={v as unknown as BandValue} data={data} />
    case 'promo_pair': return <PromoPairSection value={v as unknown as PromoPairValue} />
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
