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
import type { BlockComponentMap } from './renderStreamField'
import type {
  CapabilitiesSectionValue,
  DeploymentStepsSectionValue,
  DocumentSectionValue,
  FAQSectionValue,
  IntroductionSectionValue,
  OverviewSectionValue,
  ProductTestimonialSectionValue,
  ProductVideoSectionValue,
  StatsGridSectionValue,
  TechHighlightsSectionValue,
} from '@/types/api'

/**
 * Site-wide block-type -> component map for renderStreamField.
 *
 * Used by PortfolioPage/InnovationPage's shared `body` schema. `cta` is
 * deliberately NOT registered here — each page renders it separately (like
 * `hero`) because its empty-state fallback copy is page-specific messaging,
 * not something a shared registry entry can supply generically.
 */
export const blockRegistry: BlockComponentMap = {
  overview: ({ value }) => <OverviewSection {...(value as OverviewSectionValue)} />,
  capabilities: ({ value }) => <CapabilitiesSection {...(value as CapabilitiesSectionValue)} />,
  stats: ({ value }) => <StatsGridSection {...(value as StatsGridSectionValue)} />,
  tech_highlights: ({ value }) => {
    const v = value as TechHighlightsSectionValue
    return <TechHighlightsSection highlights={v.items} eyebrow={v.eyebrow} intro={v.intro} />
  },
  deployment_steps: ({ value }) => <DeploymentStepsSection {...(value as DeploymentStepsSectionValue)} />,
  video_section: ({ value }) => <ProductVideoSection {...(value as ProductVideoSectionValue)} />,
  testimonials_section: ({ value }) => <ProductTestimonialsSection {...(value as ProductTestimonialSectionValue)} />,
  compliance_note: ({ value }) => <IntroductionNoteSection {...(value as IntroductionSectionValue)} />,
  documents: ({ value }) => <DocumentsSection {...(value as DocumentSectionValue)} />,
  faq_section: ({ value }) => <FAQAccordionSection {...(value as FAQSectionValue)} />,
}
