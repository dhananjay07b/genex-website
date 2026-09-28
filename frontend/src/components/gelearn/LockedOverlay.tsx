import { useNavigate, useLocation } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '@/context/useAuth'

export function LockedOverlay() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Logged in but simply under-tiered is a different situation than being
  // logged out — telling an already-authenticated visitor to "log in" is
  // just wrong, not merely unhelpful.
  if (user) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px] text-white text-center px-6"
        aria-label="Upgrade required to unlock this content"
      >
        <span className="size-12 rounded-full bg-white/15 flex items-center justify-center">
          <LockIcon style={{ fontSize: 22 }} />
        </span>
        <span className="text-sm font-bold">Upgrade Required</span>
        <span className="text-xs text-white/80">This content needs a higher membership tier</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/login', { state: { from: location.pathname } })}
      className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 backdrop-blur-[2px] text-white text-center px-6"
      aria-label="Log in to unlock this content"
    >
      <span className="size-12 rounded-full bg-white/15 flex items-center justify-center">
        <LockIcon style={{ fontSize: 22 }} />
      </span>
      <span className="text-sm font-bold">Members Only</span>
      <span className="text-xs text-white/80">Log in to watch this content</span>
    </button>
  )
}
