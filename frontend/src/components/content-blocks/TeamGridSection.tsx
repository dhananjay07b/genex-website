import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import type { TeamMemberApiValue, TeamSectionApiValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function TeamCard({ member }: { member: TeamMemberApiValue }) {
  return (
    <motion.div
      variants={staggerChild}
      className="group relative overflow-hidden rounded-[15px] shadow-[0px_4px_8.3px_0px_rgba(0,0,0,0.25)] aspect-[342/401] cursor-pointer"
      whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,217,126,0.2)' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {member.image && (
        <img
          src={getMediaUrl(member.image.url)}
          alt={member.name}
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.05]"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,216,129,0.92)] from-[0%] via-[rgba(0,216,129,0)] via-[30%] to-transparent to-[30%]" />
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-10">
        <p className="text-white font-bold text-[22px] leading-snug">{member.name}</p>
        <p className="text-[#eeeeee] font-semibold text-[16px] leading-snug mt-0.5">{member.role}</p>
      </div>
    </motion.div>
  )
}

export function TeamGridSection({ value }: { value: TeamSectionApiValue }) {
  return (
    <section className="bg-white py-20 lg:py-24 border-t border-border" aria-label={value.title}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 max-w-xl mx-auto"
        >
          <h2 className="text-[24px] font-bold text-[#162456] leading-tight capitalize mb-2">{value.title}</h2>
          {value.description && <p className="text-[#45556c] text-[18px] leading-relaxed">{value.description}</p>}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' as const }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {value.members.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
