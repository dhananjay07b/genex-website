import { motion } from 'framer-motion'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function PartnerNamesSection({ value }: { value: string[] }) {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Technology Partners</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap gap-3"
        >
          {value.map((name) => (
            <motion.span
              key={name}
              variants={staggerChild}
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.15 }}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#e2e8f0] text-sm font-semibold text-[#162456] hover:border-primary hover:text-primary transition-colors duration-200 cursor-default"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
