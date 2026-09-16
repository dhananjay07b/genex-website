import { motion } from 'framer-motion'
import StarIcon from '@mui/icons-material/Star'
import type { MilestoneApiValue } from '@/types/api'

export function MilestonesSection({ value }: { value: MilestoneApiValue[] }) {
  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight">Milestones</h2>
        </motion.div>

        <div className="relative">
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ originY: 0, background: 'linear-gradient(to bottom, #96f7e4, #1AAEE8)' }}
            className="absolute left-5 lg:left-1/2 top-0 bottom-0 w-1 rounded-full lg:-translate-x-0.5"
            aria-hidden="true"
          />

          <div className="space-y-12">
            {value.map((m, i) => {
              const isLeft = i % 2 === 0
              return (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: 0.05 }}
                  className="relative pl-16 lg:pl-0 lg:grid lg:grid-cols-2 lg:gap-12 items-center"
                >
                  <div
                    className={[
                      'absolute left-2 top-8 lg:top-1/2 lg:left-1/2 z-10',
                      'flex items-center justify-center rounded-full border-4 border-solid',
                      '-translate-y-1/2 lg:-translate-x-1/2',
                      m.is_current
                        ? 'w-10 h-10 bg-[#00bba7] border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.12)]'
                        : 'w-8 h-8 bg-white border-[#00bba7] shadow-md',
                    ].join(' ')}
                    aria-hidden="true"
                  >
                    {m.is_current
                      ? <StarIcon style={{ fontSize: 14, color: 'white' }} />
                      : <div className="w-2 h-2 rounded-full bg-[#00bba7]" />}
                  </div>

                  <div
                    className={[
                      'hidden lg:flex flex-col gap-1',
                      isLeft ? 'items-end pr-14' : 'items-start pl-14 col-start-2 row-start-1',
                    ].join(' ')}
                  >
                    <span
                      className="font-extrabold leading-none text-5xl"
                      style={{ color: m.is_current ? '#96f7e4' : '#dbeafe' }}
                    >
                      {m.year}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#009689]">{m.label}</span>
                  </div>

                  <div className={isLeft ? 'lg:col-start-2 lg:pl-14' : 'lg:col-start-1 lg:pr-14 lg:row-start-1'}>
                    <div className="lg:hidden mb-2 flex items-baseline gap-3">
                      <span className="text-xl font-extrabold text-primary">{m.year}</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#009689]">{m.label}</span>
                    </div>
                    <motion.div
                      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.13)' }}
                      transition={{ duration: 0.2 }}
                      className={[
                        'rounded-2xl px-6 py-5 transition-all duration-200',
                        m.is_current
                          ? 'bg-[#f0fff9] border border-[#00d783] shadow-[0_0_0_2px_rgba(0,187,167,0.15)]'
                          : 'bg-white border border-[#e2e8f0] shadow-sm hover:border-primary/40',
                      ].join(' ')}
                    >
                      <h3 className="text-base font-extrabold text-[#162456] mb-2">{m.title}</h3>
                      <p className="text-sm text-text-muted leading-relaxed">{m.description}</p>
                    </motion.div>
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
