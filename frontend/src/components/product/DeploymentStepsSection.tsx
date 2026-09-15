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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => {
            const Icon = getMuiIcon(step.icon)
            return (
              <motion.div
                key={i}
                className="relative bg-white border border-[#e2e8f0] rounded-3xl p-7 flex flex-col gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' as const }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' as const }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#9aa5b1] tabular-nums">{step.num}</span>
                  <div className="size-10 rounded-xl bg-[#f0f4f8] text-[#0f2930] flex items-center justify-center">
                    <Icon style={{ fontSize: 20 }} />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0f2930] leading-snug mb-1.5">{step.title}</h3>
                  <p className="text-sm text-[#62748e] leading-relaxed">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-[#e2e8f0]" aria-hidden="true" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
