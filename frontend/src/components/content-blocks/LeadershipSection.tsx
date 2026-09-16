import { motion } from 'framer-motion'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import type { LeadershipCardApiValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

export function LeadershipSection({ value }: { value: LeadershipCardApiValue[] }) {
  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">Leadership</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight">
            The team behind the platform.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {value.map((person) => (
            <motion.div
              key={person.title}
              variants={staggerChild}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.12)', borderColor: '#1AAEE8' }}
              transition={{ duration: 0.22 }}
              className="group bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-8 transition-all duration-200"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white mb-5 group-hover:scale-105 transition-transform duration-200"
                style={{ background: 'linear-gradient(135deg, #1AAEE8, #00D97E)' }}
                aria-hidden="true"
              >
                {person.initials}
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-2">{person.title}</p>
              <p className="text-sm text-text-muted leading-relaxed mb-4">{person.bio}</p>
              {person.linkedin ? (
                <a
                  href={person.linkedin}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-primary transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`LinkedIn profile of ${person.title}`}
                >
                  <LinkedInIcon style={{ fontSize: 16 }} /> LinkedIn
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted/50" aria-hidden="true">
                  <LinkedInIcon style={{ fontSize: 16 }} /> LinkedIn
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
