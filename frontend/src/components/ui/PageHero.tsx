import { motion } from 'framer-motion'

interface PageHeroProps {
  label: string
  headline: string
  subline?: string
}

export function PageHero({ label, headline, subline }: PageHeroProps) {
  return (
    <section className="bg-brand-tint pt-36 pb-20 lg:pt-44 lg:pb-28" aria-label="Page hero">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
        </motion.div>
      </div>
    </section>
  )
}
