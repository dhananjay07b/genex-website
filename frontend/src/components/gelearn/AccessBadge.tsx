import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { cn, formatPrice } from '@/lib/utils'
import type { GatedFields } from '@/types/api'

interface AccessBadgeProps extends Pick<GatedFields, 'access' | 'price' | 'currency'> {
  className?: string
  /** Also label free content ("Free"); off by default so existing cards stay unchanged. */
  showFree?: boolean
}

/** Small "Members" / "₹499" chip for cards. Free content shows nothing unless `showFree`. */
export function AccessBadge({ access, price, currency, className, showFree = false }: AccessBadgeProps) {
  if (access === 'free') {
    if (!showFree) return null
    return (
      <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold bg-surface-alt text-emerald-700', className)}>
        Free
      </span>
    )
  }
  const label = access === 'paid' && price ? formatPrice(price, currency) : 'Members'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
        access === 'paid' ? 'bg-[#0f2930] text-white' : 'bg-primary/10 text-primary',
        className,
      )}
    >
      <LockOutlinedIcon sx={{ fontSize: 12 }} />
      {label}
    </span>
  )
}
