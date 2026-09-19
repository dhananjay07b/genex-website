import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import type { LeaderApiValue } from '@/types/api'

export function LeaderSection({ value }: { value: LeaderApiValue }) {
  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden" aria-label="Leader spotlight">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {(value.heading || value.description) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            className="text-center mb-12 max-w-xl mx-auto"
          >
            {value.heading && (
              <h2 className="text-[32px] font-bold text-[#162456] leading-tight mb-2">{value.heading}</h2>
            )}
            {value.description && (
              <p className="text-[#45556c] text-[18px] leading-relaxed">{value.description}</p>
            )}
          </motion.div>
        )}

        <div className="bg-[#f8fafc] rounded-3xl p-6 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              className="group relative overflow-hidden rounded-[15px] shadow-[0px_4px_8.3px_0px_rgba(0,0,0,0.25)] w-full max-w-110 mx-auto lg:mx-0"
              style={{ aspectRatio: '440 / 517' }}
              whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(27,175,231,0.22)' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {value.image && (
                <img
                  src={getMediaUrl(value.image.url)}
                  alt={value.name}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  loading="eager"
                />
              )}
              <div className="absolute inset-0 bg-linear-to-t from-[rgba(27,175,231,0.92)] from-0% via-[rgba(27,175,231,0)] via-28% to-transparent to-28%" />
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-12">
                <p className="text-white font-bold text-[24px] leading-snug">{value.name}</p>
                <p className="text-[#eeeeee] font-semibold text-[20px] leading-snug mt-1">{value.role}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="flex flex-col px-4 lg:px-10"
            >
              <span className="text-[100px] font-black leading-[0.8] text-text-primary/15 select-none pointer-events-none self-start" aria-hidden="true">
                &ldquo;
              </span>
              <p className="text-[#45556c] text-[22px] lg:text-[26px] font-normal leading-[1.7] text-center px-2">
                {value.quote}
              </p>
              <span className="text-[100px] font-black leading-[0.8] text-text-primary/15 select-none pointer-events-none self-end mt-2" aria-hidden="true">
                &rdquo;
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
