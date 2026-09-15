import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

interface PageHeroProps {
  label: string
  headline: string
  subline?: string
  ctaText?: string | null
  ctaLink?: string | null
  backgroundImage?: string | null
}

export function PageHero({ label, headline, subline, ctaText, ctaLink, backgroundImage }: PageHeroProps) {
  return (
    <section className="relative bg-brand-tint pt-36 pb-20 lg:pt-44 lg:pb-28 overflow-hidden" aria-label="Page hero">
      {backgroundImage && (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Light overlay keeps heading/subline legible over any background image */}
          <div className="absolute inset-0 bg-white/75" aria-hidden="true" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {label}
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-text-primary leading-tight">
            {headline}
          </h1>
          {subline && (
            <p className="mt-4 text-base text-text-muted max-w-2xl leading-relaxed">
              {subline}
            </p>
          )}
          {ctaText && ctaLink && (
            <div className="mt-8">
              <Link to={ctaLink}>
                <Button variant="primary" size="lg">{ctaText}</Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
