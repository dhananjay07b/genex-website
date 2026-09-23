import { motion } from 'framer-motion'
import { getMediaUrl, embedVideoUrl } from '@/lib/utils'
import type { ProductVideoSectionValue } from '@/types/api'

export function ProductVideoSection({ heading, description, video_file, video_url, poster_image }: ProductVideoSectionValue) {
  const fileUrl = video_file?.url ? getMediaUrl(video_file.url) : null
  const posterUrl = poster_image?.url ? getMediaUrl(poster_image.url) : undefined
  const embed = !fileUrl && video_url ? embedVideoUrl(video_url) : null
  const directUrl = !fileUrl && video_url && !embed ? video_url : null

  if (!fileUrl && !directUrl && !embed) return null

  return (
    <section className="bg-white py-16 lg:py-24 border-t border-[#f1f5f9]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {(heading || description) && (
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' as const }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
          >
            {heading && <h2 className="text-4xl font-bold text-[#162456] leading-tight mb-4">{heading}</h2>}
            {description && <p className="text-base text-[#45556c] leading-relaxed max-w-2xl mx-auto">{description}</p>}
          </motion.div>
        )}

        <motion.div
          className="relative rounded-3xl overflow-hidden bg-[#0f2930] aspect-video"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' as const }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' as const }}
        >
          {fileUrl || directUrl ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={fileUrl ?? directUrl ?? undefined}
              poster={posterUrl}
              controls
              playsInline
            />
          ) : embed ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={embed}
              title={heading ?? 'Product video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : null}
        </motion.div>
      </div>
    </section>
  )
}
