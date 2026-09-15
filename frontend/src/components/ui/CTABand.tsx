import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { CTABandValue } from '@/types/api'

interface CTABandProps {
  cta?: CTABandValue
  eyebrow?: string
  heading: string
  description: string
  primaryText: string
  primaryLink: string
  secondaryText?: string
  secondaryLink?: string
  /** Skip rendering entirely — driven by a page's BasePage.hide_footer_cta flag. */
  hideFooterCta?: boolean
}

export function CTABand({
  cta,
  eyebrow,
  heading,
  description,
  primaryText,
  primaryLink,
  secondaryText,
  secondaryLink,
  hideFooterCta,
}: CTABandProps) {
  if (hideFooterCta) return null

  const resolvedHeading = cta?.heading || heading
  const resolvedDescription = cta?.description || description
  const resolvedPrimaryText = cta?.primary_cta_text || primaryText
  const resolvedPrimaryLink = cta?.primary_cta_link || primaryLink
  const resolvedSecondaryText = cta?.secondary_cta_text || secondaryText
  const resolvedSecondaryLink = cta?.secondary_cta_link || secondaryLink

  return (
    <section className="bg-brand-tint py-20 lg:py-28">
      <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">
              {eyebrow}
            </p>
          )}
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-4">
            {resolvedHeading}
          </h2>
          <p className="text-base text-text-muted leading-relaxed mb-10 max-w-lg mx-auto">
            {resolvedDescription}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={resolvedPrimaryLink}>
              <Button variant="primary" size="lg">{resolvedPrimaryText}</Button>
            </Link>
            {resolvedSecondaryText && resolvedSecondaryLink && (
              <Link to={resolvedSecondaryLink}>
                <Button variant="secondary" size="lg">{resolvedSecondaryText}</Button>
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
