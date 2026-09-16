import { PageHero } from '@/components/ui/PageHero'
import { getMediaUrl } from '@/lib/utils'
import type { HeroSectionApiValue } from '@/types/api'

export function HeroBlockSection({ value }: { value: HeroSectionApiValue }) {
  return (
    <PageHero
      label={value.label ?? ''}
      headline={value.heading}
      subline={value.description ?? undefined}
      ctaText={value.cta_text}
      ctaLink={value.cta_link}
      backgroundImage={value.background_image ? getMediaUrl(value.background_image.url) : null}
    />
  )
}
