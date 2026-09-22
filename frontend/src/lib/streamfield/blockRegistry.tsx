import { DeploymentStepsSection } from '@/components/product/DeploymentStepsSection'
import { ProductVideoSection } from '@/components/product/ProductVideoSection'
import { ProductTestimonialsSection } from '@/components/product/ProductTestimonialsSection'
import { IntroductionNoteSection } from '@/components/product/IntroductionNoteSection'
import { DocumentsSection } from '@/components/product/DocumentsSection'
import { FAQAccordionSection } from '@/components/product/FAQAccordionSection'
import { OverviewSection } from '@/components/product/OverviewSection'
import { CapabilitiesSection } from '@/components/product/CapabilitiesSection'
import { StatsGridSection } from '@/components/product/StatsGridSection'
import { TechHighlightsSection } from '@/components/product/TechHighlightsSection'
import { HeroBlockSection } from '@/components/content-blocks/HeroBlockSection'
import { CardGridSection } from '@/components/content-blocks/CardGridSection'
import { PortfolioSection } from '@/components/content-blocks/PortfolioSection'
import { InnovationsSection } from '@/components/content-blocks/InnovationsSection'
import { SideImageSection } from '@/components/content-blocks/SideImageSection'
import { MilestonesSection } from '@/components/content-blocks/MilestonesSection'
import { VisionCardsSection, MissionPointsSection } from '@/components/content-blocks/VisionMissionSection'
import { LeadershipSection } from '@/components/content-blocks/LeadershipSection'
import { CertificationsSection } from '@/components/content-blocks/CertificationsSection'
import { PartnerNamesSection } from '@/components/content-blocks/PartnerNamesSection'
import { AchievementsSection } from '@/components/content-blocks/AchievementsSection'
import { PressItemsSection } from '@/components/content-blocks/PressItemsSection'
import { GallerySection } from '@/components/content-blocks/GallerySection'
import { LeaderSection } from '@/components/content-blocks/LeaderSection'
import { TeamGridSection } from '@/components/content-blocks/TeamGridSection'
import { HowWeWorkSection } from '@/components/content-blocks/HowWeWorkSection'
import { CTABandBlockSection } from '@/components/content-blocks/CTABandBlockSection'
import type { BlockComponentMap } from './renderStreamField'
import type {
  AchievementApiValue,
  CapabilitiesSectionValue,
  CardGridSectionValue,
  CTABandValue,
  DeploymentStepsSectionValue,
  DocumentSectionValue,
  FAQSectionValue,
  GalleryItemApiValue,
  HeroSectionApiValue,
  HowWeWorkPageBlockValue,
  InnovationsSectionValue,
  IntroductionSectionValue,
  LeaderApiValue,
  LeadershipCardApiValue,
  MilestoneApiValue,
  OverviewSectionValue,
  PortfolioSectionValue,
  PressItemApiValue,
  ProductTestimonialSectionValue,
  ProductVideoSectionValue,
  SideImageSectionValue,
  StatsGridSectionValue,
  TechHighlightsSectionValue,
  TeamSectionApiValue,
  VisionMissionCardApiValue,
  CertificationApiValue,
} from '@/types/api'

/**
 * Site-wide block-type -> component map for renderStreamField.
 *
 * This is the CONTENT_BODY_BLOCKS palette (backend/pages/models.py) shared by
 * every SectionPage and ContentPage — Portfolio, Innovations, and About all
 * render through this exact same set of components, so any block can be
 * added to any Section/Content page with zero frontend code changes.
 */
export const blockRegistry: BlockComponentMap = {
  hero: ({ value }) => <HeroBlockSection value={value as HeroSectionApiValue} />,
  intro: ({ value }) => <IntroductionNoteSection {...(value as IntroductionSectionValue)} />,
  card_section: ({ value }) => <CardGridSection value={value as CardGridSectionValue} />,
  portfolio_section: ({ value }) => <PortfolioSection value={value as PortfolioSectionValue} />,
  innovations_section: ({ value }) => <InnovationsSection value={value as InnovationsSectionValue} />,
  stats: ({ value }) => <StatsGridSection {...(value as StatsGridSectionValue)} />,
  side_section: ({ value }) => <SideImageSection value={value as SideImageSectionValue} />,
  overview: ({ value }) => <OverviewSection {...(value as OverviewSectionValue)} />,
  capabilities: ({ value }) => <CapabilitiesSection {...(value as CapabilitiesSectionValue)} />,
  tech_highlights: ({ value }) => {
    const v = value as TechHighlightsSectionValue
    return <TechHighlightsSection highlights={v.items} eyebrow={v.eyebrow} intro={v.intro} />
  },
  deployment_steps: ({ value }) => <DeploymentStepsSection {...(value as DeploymentStepsSectionValue)} />,
  video_section: ({ value }) => <ProductVideoSection {...(value as ProductVideoSectionValue)} />,
  testimonials_section: ({ value }) => <ProductTestimonialsSection {...(value as ProductTestimonialSectionValue)} />,
  documents: ({ value }) => <DocumentsSection {...(value as DocumentSectionValue)} />,
  faq_section: ({ value }) => <FAQAccordionSection {...(value as FAQSectionValue)} />,
  how_we_work: ({ value }) => <HowWeWorkSection value={value as HowWeWorkPageBlockValue} />,
  milestones: ({ value }) => <MilestonesSection value={value as MilestoneApiValue[]} />,
  vision_cards: ({ value }) => <VisionCardsSection value={value as VisionMissionCardApiValue[]} />,
  mission_points: ({ value }) => <MissionPointsSection value={value as VisionMissionCardApiValue[]} />,
  leadership: ({ value }) => <LeadershipSection value={value as LeadershipCardApiValue[]} />,
  certifications: ({ value }) => <CertificationsSection value={value as CertificationApiValue[]} />,
  partner_names: ({ value }) => <PartnerNamesSection value={value as string[]} />,
  achievements: ({ value }) => <AchievementsSection value={value as AchievementApiValue[]} />,
  press_items: ({ value }) => <PressItemsSection value={value as PressItemApiValue[]} />,
  gallery: ({ value }) => <GallerySection value={value as GalleryItemApiValue[]} />,
  leader: ({ value }) => <LeaderSection value={value as LeaderApiValue} />,
  team_section: ({ value }) => <TeamGridSection value={value as TeamSectionApiValue} />,
  cta: ({ value }) => <CTABandBlockSection value={value as CTABandValue} />,
}
