import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/Button'

export function FinalCTA() {
  return (
    <section aria-labelledby="cta-heading">
      <motion.div
        className="animate-gradient-pan py-24 lg:py-32 text-center px-6"
        style={{
          background: 'linear-gradient(135deg, #1AAEE8, #00C5B0, #00D97E, #00C5B0, #1AAEE8)',
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          id="cta-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          Ready to build smarter infrastructure?
        </motion.h2>

        <motion.p
          className="mt-5 text-white/80 text-lg max-w-md mx-auto"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Talk to our engineering team — no sales pitch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link
            to="/contact#demo"
            className={buttonVariants({ variant: 'dark', size: 'lg' })}
          >
            Request Demo
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
