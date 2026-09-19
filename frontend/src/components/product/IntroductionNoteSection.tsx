import { motion } from 'framer-motion'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { RichText } from '@/components/ui/RichText'

interface IntroductionNoteSectionProps {
  heading?: string | null
  description: string
  note?: string | null
}

export function IntroductionNoteSection({ heading, description, note }: IntroductionNoteSectionProps) {
  return (
    <section className="bg-white py-16 lg:py-20 border-t border-[#f1f5f9]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          className="bg-[#f0f4f8] rounded-3xl p-8 lg:p-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          {heading && <h2 className="text-2xl font-bold text-[#162456] leading-tight mb-4">{heading}</h2>}
          <RichText
            html={description}
            className="text-base text-[#45556c] leading-relaxed [&_h2]:text-[#162456] [&_h3]:text-[#162456] [&_h4]:text-[#162456] [&_strong]:text-[#162456] [&_b]:text-[#162456]"
          />
          {note && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#e2e8f0]">
              <VerifiedOutlinedIcon style={{ fontSize: 16 }} className="text-primary shrink-0" />
              <span className="text-sm font-semibold text-[#0f2930]">{note}</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
