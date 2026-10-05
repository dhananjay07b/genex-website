import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { AccessBadge } from '@/components/gelearn/AccessBadge'
import { cn } from '@/lib/utils'
import type { DiscoveryCard } from '@/types/discovery'
import { Byline } from './Byline'
import { CardThumb } from './CardThumb'
import { cardMeta } from './meta'

const TONES = {
  sky: 'bg-surface',
  mint: 'bg-surface-alt',
  slate: 'bg-slate-100',
} as const

export type ListBoxTone = keyof typeof TONES

interface ListBoxProps {
  title: string
  href?: string
  tone?: ListBoxTone
  children: ReactNode
  className?: string
}

/** A tinted box with a linked heading and a short stack of rows ("New and popular"). */
export function ListBox({ title, href, tone = 'sky', children, className }: ListBoxProps) {
  return (
    <section className={cn('flex min-w-0 flex-col gap-2.5 rounded-xl p-3.5', TONES[tone], className)}>
      <h3 className="px-1 pb-1 text-sm font-extrabold text-text-primary">
        {href ? (
          <Link to={href} className="inline-flex items-center gap-0.5 hover:text-primary">
            {title} <ChevronRightIcon sx={{ fontSize: 18 }} />
          </Link>
        ) : title}
      </h3>
      <div className="grid min-w-0 grid-cols-1 gap-2.5">{children}</div>
    </section>
  )
}

/** A compact row: small thumbnail, byline, two-line title, meta. */
export function ListRow({ card }: { card: DiscoveryCard }) {
  return (
    <Link
      to={card.path}
      className="flex min-w-0 items-center gap-3 rounded-lg bg-white p-2.5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-md">
        <CardThumb type={card.type} imageUrl={card.image_url} iconSize={26} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Byline author={card.author} company={card.company} />
        <h4 className="line-clamp-2 text-sm font-bold leading-snug text-text-primary">{card.title}</h4>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-text-muted">
          {cardMeta(card)}
          <AccessBadge access={card.access} price={card.price} currency={card.currency} />
        </p>
      </div>
    </Link>
  )
}
