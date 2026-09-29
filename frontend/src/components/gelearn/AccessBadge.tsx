import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { cn, formatPrice } from '@/lib/utils'
import type { GatedFields } from '@/types/api'

interface AccessBadgeProps extends Pick<GatedFields, 'access' | 'price' | 'currency'> {
  className?: string
}

/** Small "Members" / "₹499" chip for cards. Free content shows nothing. */
export function AccessBadge({ access, price, currency, className }: AccessBadgeProps) {
  if (access === 'free') return null
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
