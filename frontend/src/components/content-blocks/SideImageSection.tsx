import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import type { SideImageSectionValue } from '@/types/api'

export function SideImageSection({ value }: { value: SideImageSectionValue }) {
  const imageOnRight = value.image?.position !== 'left'

  return (
    <section className="bg-white py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: imageOnRight ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={imageOnRight ? 'lg:order-1' : 'lg:order-2'}
          >
            {value.heading && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#162456] leading-tight mb-6">{value.heading}</h2>
            )}
            {value.description && (
              <div
                className="text-base text-text-muted leading-relaxed [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: value.description }}
              />
            )}
          </motion.div>

          {value.image && (
            <motion.div
              initial={{ opacity: 0, x: imageOnRight ? 24 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className={imageOnRight ? 'lg:order-2' : 'lg:order-1'}
            >
              <div className="relative rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10)]">
                <img
                  src={getMediaUrl(value.image.url)}
                  alt={value.image.alt ?? ''}
                  className="w-full aspect-[4/3] object-cover"
                  loading="lazy"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
