import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import { useAuth } from '@/context/useAuth'
import { useRole } from '@/hooks/useRole'
import { API_BASE } from '@/lib/api/client'
import { isPrivatePath, returnState } from '@/lib/authRedirect'
import { getMediaUrl } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function AccountMenu() {
  const { user, isLoading, logout } = useAuth()
  const { isAdmin, isCompany, isProfessional } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  async function handleLogout() {
    setMenuOpen(false)
    // Signed-in-only pages (dashboard, studio, editors) go home first, so the route guard doesn't bounce to /login.
    // Public pages stay put and reload as a visitor (see GeLearnLayout).
    if (isPrivatePath(location.pathname)) navigate('/', { replace: true })
    await logout()
  }

  if (isLoading) return null

  if (!user) {
    return (
      <Link to="/register" state={returnState(location)} className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
        Get Started
      </Link>
    )
  }

  const initials = (user.display_name || user.username).slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Account menu"
        className="size-9 rounded-full bg-primary text-white text-xs font-extrabold flex items-center justify-center overflow-hidden shrink-0 border border-transparent hover:border-primary transition-colors"
      >
        {user.avatar_url ? (
          <img src={getMediaUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-12 right-0 w-56 bg-white border border-border rounded-2xl shadow-lg p-2 z-20 origin-top-right"
          >
            {isAdmin && (
              <a
                href={`${API_BASE}/cms/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
              >
                <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
                Admin &amp; CMS
              </a>
            )}
            {isProfessional && (
              <Link
                to="/account/courses/new"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
              >
                <SchoolOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
                Build a Course
              </Link>
            )}
            {isCompany && (
              <Link
                to="/studio"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
              >
                <EditNoteOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
                Company Studio
              </Link>
            )}
            <Link
              to="/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
            >
              <DashboardOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
              Visit Dashboard
            </Link>
            <Link
              to={`/u/${user.username}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
            >
              <PersonOutlineOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
              View Public Profile
            </Link>
            <Link
              to="/account?tab=settings"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-text-primary hover:bg-surface transition-colors"
            >
              <SettingsOutlinedIcon sx={{ fontSize: 17 }} className="text-primary" />
              Edit Profile &amp; Settings
            </Link>
            <div className="h-px bg-border my-1.5" />
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
