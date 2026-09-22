import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getMuiIcon } from '@/lib/muiIconRegistry'
import { getMediaUrl } from '@/lib/utils'
import type { InnovationCardValue } from '@/types/api'

const staggerChild = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function InnovationCard({ item }: { item: InnovationCardValue }) {
  const Icon = getMuiIcon(item.icon)

  return (
    <motion.div
      variants={staggerChild}
      className="flex flex-col p-10 bg-white border border-[#e2e8f0]"
      whileHover={{ y: -6, boxShadow: 'inset 0 3px 0 #1AAEE8, 0 16px 32px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {item.icon ? (
        <div className="size-12 rounded-xl bg-[#f1f5f8] flex items-center justify-center mb-6">
          <Icon style={{ fontSize: 24 }} className="text-primary" />
        </div>
      ) : item.icon_url ? (
        <img src={getMediaUrl(item.icon_url)} alt="" aria-hidden="true" className="w-12 h-12 mb-6 rounded-xl object-cover" />
      ) : (
        <div className="w-12 h-12 mb-6 rounded-xl bg-linear-to-br from-slate-200 to-slate-300" />
      )}

      <p className="text-2xl font-bold text-[#1d293d] leading-tight mb-3">{item.title}</p>
      <p className="text-[15px] text-[#45556c] leading-7 flex-1">{item.summary}</p>

      <Link
        to={item.url}
        className="mt-8 inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-widest text-primary hover:text-primary/70 transition-colors duration-200 self-start"
      >
        Read More &rarr;
      </Link>
    </motion.div>
  )
}
