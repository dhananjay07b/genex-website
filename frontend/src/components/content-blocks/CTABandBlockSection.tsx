import { CTABand } from '@/components/ui/CTABand'
import type { CTABandValue } from '@/types/api'

export function CTABandBlockSection({ value }: { value: CTABandValue }) {
  return (
    <CTABand
      cta={value}
      heading={value.heading}
      description={value.description ?? ''}
      primaryText={value.primary_cta_text || 'Contact Us'}
      primaryLink={value.primary_cta_link || '/contact'}
      secondaryText={value.secondary_cta_text ?? undefined}
      secondaryLink={value.secondary_cta_link ?? undefined}
    />
  )
}
