import { Link } from 'react-router-dom'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '@/context/useAuth'

/** Company accounts publish from the Studio, not the personal dashboard — point them there. */
export function StudioShortcut() {
  const { user } = useAuth()
  if (user?.account_type !== 'company') return null

  return (
    <Link
      to="/studio"
      className="mb-6 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 hover:border-primary transition-colors group"
    >
      <span className="size-10 shrink-0 rounded-full bg-white text-primary flex items-center justify-center">
        <EditNoteOutlinedIcon sx={{ fontSize: 20 }} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-text-primary">Publish for {user.company?.name ?? 'your company'}</span>
        <span className="block text-xs text-text-muted mt-0.5">
          GeAcademy, Research, Policies &amp; Tenders, Whitepapers and Podcasts are managed in the Company Studio.
        </span>
      </span>
      <ArrowForwardIcon sx={{ fontSize: 18 }} className="text-primary shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </Link>
  )
}
