import { useNavigate, useLocation } from 'react-router-dom'
import LockIcon from '@mui/icons-material/Lock'

export function LockedOverlay() {
  const navigate = useNavigate()
  const location = useLocation()

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
