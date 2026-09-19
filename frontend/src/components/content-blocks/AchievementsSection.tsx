import { motion } from 'framer-motion'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import { getMediaUrl } from '@/lib/utils'
import { RichText } from '@/components/ui/RichText'
import type { AchievementApiValue } from '@/types/api'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' as const },
  transition: { duration: 0.6, ease: 'easeOut' as const, delay },
})

const ACHIEVEMENT_ICON: Record<AchievementApiValue['icon_type'], typeof WorkspacePremiumOutlinedIcon> = {
  certificate: WorkspacePremiumOutlinedIcon,
  award: EmojiEventsOutlinedIcon,
}

export function AchievementsSection({ value }: { value: AchievementApiValue[] }) {
  return (
    <section className="bg-white overflow-hidden" aria-label="Awards and certifications">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {value.map((ach, i) => {
          const Icon = ACHIEVEMENT_ICON[ach.icon_type] ?? WorkspacePremiumOutlinedIcon
          const isOdd = i % 2 !== 0
          return (
            <div
              key={ach.heading}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                i === 0 ? 'py-20 lg:py-28' : 'pb-20 lg:pb-28 pt-16 lg:pt-24 border-t border-border'
              }`}
            >
              <motion.div {...fadeUp(0)} className={`group relative ${isOdd ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="relative overflow-hidden rounded-2xl border border-[#dcebfe] shadow-lg aspect-video transition-shadow duration-300 group-hover:shadow-xl">
                  {ach.image && (
                    <img
                      src={getMediaUrl(ach.image.url)}
                      alt={ach.image_alt ?? ach.heading}
                      className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      loading={i === 0 ? 'eager' : 'lazy'}
                      width={ach.image.width}
                      height={ach.image.height}
                    />
                  )}
                </div>
              </motion.div>

              <motion.div {...fadeUp(0.14)} className={`space-y-6 ${isOdd ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary/10 border border-primary/20">
                  <Icon sx={{ fontSize: 16, color: '#1AAEE8' }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-primary">{ach.badge}</span>
                </div>
                <h2 className="text-2xl lg:text-[32px] font-extrabold text-text-primary leading-tight">{ach.heading}</h2>
                <RichText
                  html={ach.body}
                  className="text-[17px] text-text-muted leading-relaxed [&_h2]:text-text-primary [&_h3]:text-text-primary [&_h4]:text-text-primary [&_strong]:text-text-primary [&_b]:text-text-primary"
                />
              </motion.div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
