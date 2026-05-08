import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function FeaturedCaseStudy() {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="case-study-label">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Label */}
        <motion.p
          id="case-study-label"
          className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          Case Study
        </motion.p>

        {/* Card */}
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <img
            src="/images/case-study/featured.jpeg"
            alt="50 MW solar power plant in Rajasthan"
            className="w-full h-72 sm:h-96 lg:h-125 object-cover"
          />

          {/* Overlay card — bottom-left */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 lg:right-auto lg:w-[45%] p-7 lg:p-10 bg-white/95"
            initial={{ y: 32, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="text-text-muted text-xs font-semibold uppercase tracking-widest mb-4">
              Solar Power Plant · Rajasthan · 50 MW
            </p>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-text-primary leading-snug">
              40% reduction in<br />unplanned downtime.
            </h2>

            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              Full SCADA and remote monitoring deployment reduced fault response time from hours to minutes.
            </p>

            <Link
              to="/genex-learn/case-studies"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:underline"
            >
              Read Full Story
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
