import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import type { HowWeWorkPageBlockValue, HowWeWorkStepApiValue } from '@/types/api'

// Hardcoded per-step accent — cycles through the 3 brand colors, never CMS-editable.
const STEP_COLORS = ['#2CCEFB', '#00BBA7', '#1C398E']

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: d, ease: 'easeOut' as const } }),
}

const slideFrom = (x: number) => ({
  hidden: { opacity: 0, x },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
})

function StepRow({ step, index }: { step: HowWeWorkStepApiValue; index: number }) {
  const isRight = index % 2 === 0
  const color = STEP_COLORS[index % STEP_COLORS.length]
  const cardSlide = slideFrom(isRight ? 60 : -60)
  const imgSlide = slideFrom(isRight ? -60 : 60)

  const image = (
    <motion.div
      variants={imgSlide}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' as const }}
      className="aspect-4/3 h-48 rounded-3xl overflow-hidden bg-[#f3f4f6] shadow-sm"
    >
      {step.image && (
        <motion.img
          src={getMediaUrl(step.image.url)}
          alt={step.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  )

  const card = (
    <motion.div
      variants={cardSlide}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' as const }}
      whileHover={{ y: -5 }}
      className="relative z-20 rounded-3xl p-8 border border-[#e2e8f0] bg-white w-full transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(26,174,232,0.15)]"
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2, type: 'spring', bounce: 0.4 }}
        className={`absolute top-1/2 -translate-y-1/2 size-12 rounded-full flex items-center justify-center text-white text-lg font-bold z-10 ${isRight ? '-left-6' : '-right-6'}`}
        style={{ background: color }}
      >
        {step.num}
      </motion.div>
      <div className={isRight ? 'pl-8' : 'pr-8 text-right'}>
        <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
        <p className="text-sm text-[#949494] leading-6">{step.desc}</p>
      </div>
    </motion.div>
  )

  return (
    <div className="hidden lg:flex items-center w-full gap-0">
      <div className="flex-1 flex items-center justify-end pr-12">{isRight ? image : card}</div>
      <div className="relative z-10 flex-none flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.1, type: 'spring', bounce: 0.5 }}
          className="size-4 rounded-full bg-white border-4 relative"
          style={{ borderColor: color }}
        >
          <div
            className="absolute top-1/2 -translate-y-1/2 h-px w-12"
            style={{ background: color, left: isRight ? '100%' : 'auto', right: isRight ? 'auto' : '100%' }}
          />
        </motion.div>
      </div>
      <div className="flex-1 flex items-center pl-12">{isRight ? card : image}</div>
    </div>
  )
}

function MobileStep({ step, index }: { step: HowWeWorkStepApiValue; index: number }) {
  const color = STEP_COLORS[index % STEP_COLORS.length]
  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' as const }} className="flex gap-5">
      <div className="flex flex-col items-center">
        <div className="size-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>
          {step.num}
        </div>
        <div className="flex-1 w-0.5 mt-3" style={{ background: color }} />
      </div>
      <div className="pb-10 flex-1 min-w-0">
        {step.image && (
          <div className="rounded-2xl overflow-hidden aspect-video mb-4">
            <img src={getMediaUrl(step.image.url)} alt={step.title} className="w-full h-full object-cover" />
          </div>
        )}
        <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
        <p className="text-sm text-[#949494] leading-6">{step.desc}</p>
      </div>
    </motion.div>
  )
}

export function HowWeWorkSection({ value }: { value: HowWeWorkPageBlockValue }) {
  const steps = value.steps ?? []
  const principles = value.principles ?? []

  return (
    <>
      <section className="bg-white py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' as const }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">{value.heading}</h2>
            <p className="text-sm text-[#949494] max-w-lg mx-auto leading-6">
              {value.description}
            </p>
          </motion.div>

          <div className="relative hidden lg:block">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              style={{ originY: 0 }}
              className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px border-l-2 border-dashed border-[#bedbff]"
            />
            <div className="flex flex-col gap-24">
              {steps.map((step, i) => (
                <StepRow key={i} step={step} index={i} />
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            {steps.map((step, i) => (
              <MobileStep key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </section>

      {principles.length > 0 && (
        <section className="bg-white border-t border-[#e5e7eb] py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' as const }} className="mb-10">
              <h2 className="text-4xl font-bold text-[#111827] mb-4">Engineering Principles</h2>
              <p className="text-sm text-[#6b7280] max-w-lg leading-6">
                We combine decentralized renewable energy with smart monitoring tools to ensure long-term sustainability and transparency in rural development.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {principles.map((p, i) => (
                <motion.div
                  key={i}
                  custom={i * 0.08}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' as const }}
                  whileHover={{ y: -5, borderColor: '#1AAEE8', transition: { duration: 0.2, ease: 'easeOut' } }}
                  className="bg-white/50 border border-[#e5e7eb] rounded-3xl p-8 cursor-default transition-shadow hover:shadow-[0px_10px_30px_rgba(26,174,232,0.1)]"
                >
                  <h3 className="text-xl font-bold text-[#111827] mb-3">{p.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-6">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
