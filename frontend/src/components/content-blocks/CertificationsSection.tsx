import { motion } from 'framer-motion'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import type { CertificationApiValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export function CertificationsSection({ value }: { value: CertificationApiValue[] }) {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Certifications & Accreditations</p>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {value.map(({ name, label }) => (
            <motion.div
              key={name}
              variants={staggerChild}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,174,232,0.10)', borderColor: '#1AAEE8' }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#e2e8f0] rounded-2xl px-6 py-5 flex items-start gap-4 transition-all duration-200"
            >
              <VerifiedOutlinedIcon className="text-primary shrink-0 mt-0.5" style={{ fontSize: 22 }} />
              <div>
                <p className="text-sm font-extrabold text-[#162456] mb-0.5">{name}</p>
                <p className="text-xs text-text-muted">{label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
