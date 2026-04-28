import { motion } from 'framer-motion'

interface PageHeroProps {
  label: string
  headline: string
  subline?: string
}

export function PageHero({ label, headline, subline }: PageHeroProps) {
  return (
    <section className="bg-dark-bg py-20 lg:py-28" aria-label="Page hero">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
            {label}
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {headline}
          </h1>
          {subline && (
            <p className="mt-4 text-base text-white/60 max-w-2xl leading-relaxed">
              {subline}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
