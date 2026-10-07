import StarIcon from '@mui/icons-material/Star'
import { cn } from '@/lib/utils'
import type { CourseCardRating } from '@/types/learning'

/** "★ 4.6 (23)" on course cards. The API only sends a rating once a course has 3 visible reviews; nothing shows before that. */
export function CourseRating({ rating, className }: { rating: CourseCardRating | null | undefined; className?: string }) {
  if (!rating) return null
  const average = rating.average.toFixed(1)
  return (
    <span
      className={cn('inline-flex items-center gap-0.5 text-xs font-medium text-text-muted', className)}
      aria-label={`Rated ${average} out of 5 from ${rating.count} ${rating.count === 1 ? 'review' : 'reviews'}`}
    >
      <StarIcon sx={{ fontSize: 15 }} className="text-amber-600" aria-hidden="true" />
      <b className="font-bold text-text-primary tabular-nums" aria-hidden="true">{average}</b>
      <span className="tabular-nums" aria-hidden="true">({rating.count.toLocaleString('en-IN')})</span>
    </span>
  )
}
