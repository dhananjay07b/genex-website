import { cn, getMediaUrl } from '@/lib/utils'
import type { DiscoveryType } from '@/types/discovery'
import { TYPE_ICONS } from './meta'

interface CardThumbProps {
  type: DiscoveryType
  imageUrl: string | null
  className?: string
  iconSize?: number
}

/**
 * A card's cover image. Content without an uploaded image gets a quiet tinted
 * panel with its type icon, so a row of cards still reads as one set.
 */
export function CardThumb({ type, imageUrl, className, iconSize = 40 }: CardThumbProps) {
  if (imageUrl) {
    return <img src={getMediaUrl(imageUrl)} alt="" loading="lazy" className={cn('size-full object-cover', className)} />
  }
  const Icon = TYPE_ICONS[type]
  return (
    <div className={cn('size-full flex items-center justify-center bg-linear-to-br from-surface to-slate-100 text-sky-800/70', className)}>
      <Icon sx={{ fontSize: iconSize }} />
    </div>
  )
}
