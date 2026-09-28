import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import type { MembershipTier } from '@/types/auth'

interface MembershipTierBadgeProps {
  tier: MembershipTier
  className?: string
}

// "free"/"registered" are the baseline tiers everyone lands on — anything
// else (premium, etc.) is a real paid tier and gets a visibly distinct look,
// not just a different word in the same plain text style.
const BASELINE_SLUGS = new Set(['free', 'registered'])

export function MembershipTierBadge({ tier, className = '' }: MembershipTierBadgeProps) {
  const isPremium = !BASELINE_SLUGS.has(tier.slug)

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${
        isPremium
          ? 'text-white bg-linear-to-r from-amber-500 to-yellow-400 shadow-sm'
          : 'text-primary bg-primary/10'
      } ${className}`}
    >
      {isPremium && <WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} />}
      {tier.name}
    </span>
  )
}
