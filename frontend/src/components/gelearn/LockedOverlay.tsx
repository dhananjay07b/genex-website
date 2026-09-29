import { useLocation, useNavigate } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '@/context/useAuth'
import { cn, formatPrice } from '@/lib/utils'
import type { GatedFields } from '@/types/api'

interface LockedOverlayProps extends Pick<GatedFields, 'access' | 'price' | 'currency'> {
  /** 'overlay' covers a thumbnail/player; 'panel' is a standalone block (e.g. in place of a blog body). */
  layout?: 'overlay' | 'panel'
}

const SHELL = 'flex flex-col items-center justify-center gap-2 text-white text-center px-6'
const LAYOUT = {
  overlay: 'absolute inset-0 bg-black/55 backdrop-blur-[2px]',
  panel: 'relative rounded-2xl bg-[#0f2930] py-14',
}

/**
 * What a viewer sees in place of content they can't open (the API has already
 * withheld the media/body — this is presentation only).
 *   members + signed out → "Members only", click to log in
 *   paid + signed out    → price, click to log in (buying needs an account)
 *   paid + signed in     → price, checkout not yet available
 */
export function LockedOverlay({ access, price, currency, layout = 'overlay' }: LockedOverlayProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isPaid = access === 'paid'
  const priceLabel = isPaid && price ? formatPrice(price, currency) : null
  const goToLogin = () => navigate('/login', { state: { from: location.pathname } })

  const icon = (
    <span className="size-12 rounded-full bg-white/15 flex items-center justify-center">
      <LockIcon style={{ fontSize: 22 }} />
    </span>
  )

  if (isPaid && user) {
    return (
      <div className={cn(SHELL, LAYOUT[layout])} aria-label={`Paid content${priceLabel ? `, ${priceLabel}` : ''}`}>
        {icon}
        {priceLabel && <span className="text-2xl font-extrabold">{priceLabel}</span>}
        <span className="text-xs text-white/80">Purchase to unlock this content</span>
        <span
          className="mt-1 inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold text-white/80"
          aria-disabled="true"
        >
          Checkout coming soon
        </span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={goToLogin}
      className={cn(SHELL, LAYOUT[layout], 'w-full cursor-pointer')}
      aria-label={isPaid ? 'Log in to buy this content' : 'Log in to unlock this content'}
    >
      {icon}
      {isPaid ? (
        <>
          {priceLabel && <span className="text-2xl font-extrabold">{priceLabel}</span>}
          <span className="text-xs text-white/80">Log in to buy and unlock this content</span>
        </>
      ) : (
        <>
          <span className="text-sm font-bold">Members Only</span>
          <span className="text-xs text-white/80">Log in to unlock this content</span>
        </>
      )}
    </button>
  )
}
