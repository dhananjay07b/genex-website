import { motion } from 'framer-motion'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { VisionMissionCardApiValue } from '@/types/api'

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const staggerChild = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
}

function VisionMissionSection({
  variant,
  cards,
}: {
  variant: 'vision' | 'mission'
  cards: VisionMissionCardApiValue[]
}) {
  const isVision = variant === 'vision'
  return (
    <section className={`${isVision ? 'bg-white' : 'bg-[#F0F9FF]'} py-20 lg:py-28 overflow-hidden`}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-12 h-12 rounded-3xl flex items-center justify-center shrink-0 ${
              isVision ? 'bg-[#f0fdfa] border border-[#cbfbf1]' : 'bg-[#dbeafe] border border-[#bedbff]'
            }`}
          >
            {isVision
              ? <LanguageOutlinedIcon style={{ fontSize: 22, color: '#00bba7' }} />
              : <CheckCircleOutlinedIcon style={{ fontSize: 22, color: '#193cb8' }} />}
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456]">
            {isVision ? 'Our Vision' : 'Our Mission'}
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {cards.map(({ icon, title, text }) => {
            const Icon = getMuiIcon(icon)
            return (
              <motion.div
                key={title}
                variants={staggerChild}
                whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(26,174,232,0.10)', borderColor: '#1AAEE8' }}
                transition={{ duration: 0.2 }}
                className="bg-[#f8fafc] border border-[#f1f5f9] rounded-2xl p-5 transition-all duration-200"
              >
                <Icon style={{ fontSize: 24, color: '#009689' }} />
                <p className="mt-3 text-sm font-bold text-[#1c398e]">{title}</p>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">{text}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export function VisionCardsSection({ value }: { value: VisionMissionCardApiValue[] }) {
  return <VisionMissionSection variant="vision" cards={value} />
}

export function MissionPointsSection({ value }: { value: VisionMissionCardApiValue[] }) {
  return <VisionMissionSection variant="mission" cards={value} />
}
