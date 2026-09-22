import { motion } from 'framer-motion'
import { getMediaUrl } from '@/lib/utils'
import { MosaicGrid } from './MosaicGrid'
import type { PressItemApiValue } from '@/types/api'

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function PressCell({ item }: { item: PressItemApiValue }) {
  return (
    <motion.div
      variants={staggerChild}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' as const }}
      className="group relative w-full h-full overflow-hidden rounded-2xl border border-border shadow-sm cursor-pointer"
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(26,174,232,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      <img
        src={getMediaUrl(item.image.url)}
        alt={item.alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
      {(item.caption || item.subcaption) && (
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(22,36,86,0.88)] via-[rgba(22,36,86,0.25)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {item.caption && <p className="text-white font-bold text-base leading-tight">{item.caption}</p>}
            {item.subcaption && <p className="text-blue-200 text-sm mt-1">{item.subcaption}</p>}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export function PressItemsSection({ value }: { value: PressItemApiValue[] }) {
  const ordered = [...value].sort((a, b) => Number(b.featured) - Number(a.featured))

  return (
    <section className="bg-[#F1F3F5] border-y border-border py-20 lg:py-28" aria-label="Media and press">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10">
          <h2 className="text-3xl lg:text-[36px] font-extrabold text-text-primary leading-tight">Press &amp; Media</h2>
        </motion.div>

        <MosaicGrid items={ordered} renderCell={(item) => <PressCell item={item} />} />
      </div>
    </section>
  )
}
