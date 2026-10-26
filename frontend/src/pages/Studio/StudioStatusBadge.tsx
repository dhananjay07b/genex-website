import { cn } from '@/lib/utils'

/** "Draft" or "Live" next to a Studio item. */
export function StudioStatusBadge({ isDraft, className }: { isDraft: boolean; className?: string }) {
  return (
    <span className={cn(
      'shrink-0 px-2.5 py-0.5 rounded-full text-xs font-bold',
      isDraft ? 'bg-surface text-text-primary border border-border' : 'bg-secondary/10 text-secondary',
      className,
    )}>
      {isDraft ? 'Draft' : 'Live'}
    </span>
  )
}
