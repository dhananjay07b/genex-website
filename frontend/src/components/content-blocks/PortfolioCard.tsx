import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getMediaUrl } from '@/lib/utils'
import type { LinkedPageCardValue } from '@/types/api'

export function PortfolioCard({ item, index }: { item: LinkedPageCardValue; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: 'easeOut' as const }}
      className="group flex flex-col lg:flex-row h-auto lg:h-100 overflow-hidden border border-border hover:border-primary hover:shadow-[0_8px_32px_rgba(26,174,232,0.12)] transition-all duration-300"
    >
      <div className="relative w-full lg:flex-1 h-56 lg:h-auto overflow-hidden shrink-0 bg-linear-to-br from-slate-100 to-slate-200">
        {item.icon_url && (
          <img
            src={getMediaUrl(item.icon_url)}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent" />
        {item.tag && (
          <span className="absolute bottom-4 left-4 text-xs font-semibold text-white/60 uppercase tracking-wider">
            {item.tag}
          </span>
        )}
      </div>

      <div className="bg-[#f1f5f8] w-full lg:w-83.75 shrink-0 flex flex-col p-10">
        <p className="text-[24px] font-bold text-[#1d293d] leading-tight mb-2">{item.title}</p>
        {item.tag && (
          <p className="text-[14px] uppercase font-normal text-[#62748e] tracking-wide mb-6">{item.tag}</p>
        )}
        <p className="text-[16px] text-[#45556c] leading-7.5 flex-1">{item.summary}</p>
        <Link
          to={item.url}
          className="mt-8 inline-flex items-center gap-2 text-[14px] font-bold text-[#1d293d] hover:text-primary transition-colors duration-200 self-start"
        >
          See More
          <ArrowForwardIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>
    </motion.div>
  )
}
