import { motion } from 'framer-motion'

interface SectionHeaderProps {
  label: string
  heading: string
  subtext?: string
  align?: 'left' | 'center'
}

export function SectionHeader({ label, heading, subtext, align = 'left' }: SectionHeaderProps) {
  const isCenter = align === 'center'
  return (
    <motion.div
      className={isCenter ? 'text-center' : ''}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{label}</p>
      <h2 className={`text-3xl lg:text-4xl font-extrabold text-text-primary leading-tight ${isCenter ? 'mx-auto' : ''}`}>
        {heading}
      </h2>
      {subtext && (
        <p className={`mt-4 text-base text-text-muted leading-relaxed ${isCenter ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}
