import { motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import type { DeploymentStepValue } from '@/types/api'

interface DeploymentStepsSectionProps {
  heading: string
  description?: string | null
  steps: DeploymentStepValue[]
}

export function DeploymentStepsSection({ heading, description, steps }: DeploymentStepsSectionProps) {
  return (
    <section className="bg-[#f8fafc] py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-2xl mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
        >
          <h2 className="text-4xl font-bold text-[#162456] leading-tight mb-4">{heading}</h2>
          {description && <p className="text-base text-[#45556c] leading-relaxed">{description}</p>}
        </motion.div>

        <div className="relative">
          {steps.length > 1 && (
            <motion.div
              className="absolute left-6 top-6 bottom-6 w-px bg-[#dbe2ea] origin-top"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-60px' as const }}
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
            />
          )}

          <div className="flex flex-col gap-6">
            {steps.map((step, i) => {
              const Icon = getMuiIcon(step.icon)
              return (
                <motion.div
                  key={i}
                  className="group relative flex flex-col gap-5 bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-7 lg:p-8 transition-[border-color,box-shadow,transform] duration-300 hover:border-primary/30 hover:shadow-[0_20px_40px_-12px_rgba(26,174,232,0.15)]"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -4 }}
                  viewport={{ once: true, margin: '-40px' as const }}
                  transition={{ duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const }}
                >
                  <div className="flex items-center justify-between">
                    <div className="relative z-10 size-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shrink-0 transition-transform duration-300 group-hover:scale-110">
                      {step.num}
                    </div>

                    <div className="size-14 sm:size-16 lg:size-20 rounded-2xl bg-[#f0f4f8] text-[#0f2930] flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105 group-hover:shadow-[0_0_16px_2px_rgba(26,174,232,0.2)]">
                      <Icon style={{ fontSize: 28 }} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-[#0f2930] leading-snug mb-2">{step.title}</h3>
                    <p className="text-base text-[#62748e] leading-relaxed max-w-2xl">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
