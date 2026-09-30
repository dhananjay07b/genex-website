import { NavLink, Outlet } from 'react-router-dom'
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import { useAuth } from '@/context/useAuth'
import { cn, getMediaUrl } from '@/lib/utils'
import { STUDIO_TYPES } from './studioTypes'

const NAV = [
  { to: '/studio', label: 'Overview', icon: SpaceDashboardOutlinedIcon, end: true },
  ...STUDIO_TYPES.map(t => ({ to: `/studio/${t.key}`, label: t.label, icon: t.icon, end: false })),
  { to: '/studio/team', label: 'Team', icon: GroupsOutlinedIcon, end: false },
]

/** Company Studio shell: company header + section nav. Company accounts only (see RoleRoute). */
export default function StudioLayout() {
  const { user } = useAuth()
  const company = user?.company

  return (
    <div className="flex flex-col min-h-screen pb-10">
      <div className="bg-brand-tint border-b border-border pt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-9 flex items-center gap-4">
          {company?.logo_url && (
            <span className="size-14 rounded-2xl bg-white border border-border flex items-center justify-center p-2.5 shrink-0">
              <img src={getMediaUrl(company.logo_url)} alt="" className="w-full h-full object-contain" />
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5">Company Studio</p>
            <h1 className="text-3xl font-extrabold text-text-primary truncate">{company?.name ?? 'Your company'}</h1>
          </div>
        </div>
      </div>

      <section className="bg-white py-10 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-7 lg:items-start">
          <nav aria-label="Studio" className="lg:w-60 shrink-0 lg:sticky lg:top-24">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:pb-0 bg-white lg:border lg:border-border lg:rounded-2xl lg:p-3">
              {NAV.map(({ to, label, icon: Icon, end }) => (
                <li key={to} className="shrink-0">
                  <NavLink
                    to={to}
                    end={end}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors',
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary font-semibold hover:bg-surface',
                    )}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  )
}
