import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import { MosaicGrid } from './MosaicGrid'
import type { GalleryItemApiValue } from '@/types/api'

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function GalleryCell({ item }: { item: GalleryItemApiValue }) {
  return (
    <motion.div
      variants={staggerChild}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' as const }}
      className="group relative w-full h-full overflow-hidden rounded-2xl border border-border cursor-pointer"
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={getMediaUrl(item.image.url)}
        alt={item.alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[rgba(22,36,86,0.12)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  )
}

export function GallerySection({ value }: { value: GalleryItemApiValue[] }) {
  return (
    <section className="bg-white py-20 lg:py-28" aria-label="Photo gallery">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <h2 className="text-3xl lg:text-[36px] font-extrabold text-text-primary leading-tight">Gallery</h2>
        </motion.div>

        <MosaicGrid items={value} renderCell={(item) => <GalleryCell item={item} />} />
      </div>
    </section>
  )
}
