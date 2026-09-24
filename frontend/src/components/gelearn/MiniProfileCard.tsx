import { AnimatePresence, motion } from 'framer-motion'
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined'
import { getMediaUrl } from '@/lib/utils'
import type { ContentAuthor } from '@/types/api'

interface MiniProfileCardProps {
  author: ContentAuthor
  visible: boolean
}

export function MiniProfileCard({ author, visible }: MiniProfileCardProps) {
  const initials = author.display_name.slice(0, 2).toUpperCase()
  const roleAtCompany = author.role_title && author.company
    ? `${author.role_title} at ${author.company}`
    : (author.role_title || author.company)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="absolute top-full left-0 mt-2 z-30 w-104 max-w-[90vw] bg-white border border-border rounded-2xl shadow-2xl p-5 flex items-start gap-4 origin-top-left"
        >
          <span className="size-18 rounded-full bg-primary text-white text-2xl font-extrabold flex items-center justify-center overflow-hidden shrink-0">
            {author.avatar_url ? (
              <img src={getMediaUrl(author.avatar_url)} alt="" className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </span>

          <div className="min-w-0 flex-1 text-left">
            <p className="text-base font-extrabold text-text-primary truncate">{author.display_name}</p>

            {roleAtCompany && (
              <p className="flex items-center justify-start gap-1.5 text-sm text-text-muted mt-1 truncate">
                <WorkOutlineOutlinedIcon sx={{ fontSize: 15 }} className="shrink-0 text-primary" />
                {roleAtCompany}
              </p>
            )}

            {author.years_experience !== null && (
              <p className="text-xs text-text-muted mt-1">{author.years_experience} years of experience</p>
            )}

            {author.bio && (
              <p className="text-sm text-text-muted leading-relaxed mt-3 line-clamp-2">{author.bio}</p>
            )}

            {author.expertise.length > 0 && (
              <div className="flex flex-wrap justify-start gap-1.5 mt-3">
                {author.expertise.map(topic => (
                  <span key={topic.id} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary/10 text-secondary">
                    {topic.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
