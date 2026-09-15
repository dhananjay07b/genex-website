import { motion } from 'framer-motion'

interface OverviewSectionProps {
  heading: string
  paragraphs: string[]
}

export function OverviewSection({ heading, paragraphs }: OverviewSectionProps) {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <h2 className="text-4xl font-bold text-[#162456] leading-tight capitalize mb-6">
            {heading}
          </h2>
          <div className="space-y-5 max-w-4xl">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-lg text-[#45556c] leading-7.25">{para}</p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
