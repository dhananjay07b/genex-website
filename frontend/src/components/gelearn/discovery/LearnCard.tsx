import { Link } from 'react-router-dom'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { cn } from '@/lib/utils'
import type { DiscoveryCard } from '@/types/discovery'
import { Byline } from './Byline'
import { CardThumb } from './CardThumb'
import { cardMeta } from './meta'

const LEVEL_LABELS: Record<string, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

/** The vertical card used in rows and grids for any course or piece of content. */
export function LearnCard({ card, className }: { card: DiscoveryCard; className?: string }) {
  const level = LEVEL_LABELS[card.level]
  return (
    <Link
      to={card.path}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow duration-200',
        'hover:shadow-lg hover:shadow-slate-900/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <CardThumb type={card.type} imageUrl={card.image_url} className="transition-transform duration-300 group-hover:scale-105" />
        <AccessBadge access={card.access} price={card.price} currency={card.currency} showFree className="absolute left-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Byline author={card.author} company={card.company} />
        <h3 className="text-sm font-bold leading-snug text-text-primary group-hover:underline group-hover:decoration-slate-400 group-hover:underline-offset-2">
          {card.title}
        </h3>
        <p className="text-xs font-medium text-text-muted">{cardMeta(card)}</p>
        {level && (
          <span className="mt-auto self-start rounded-md border border-border bg-slate-50 px-1.5 py-0.5 text-xs font-bold text-slate-700">
            {level}
          </span>
        )}
      </div>
    </Link>
  )
}
