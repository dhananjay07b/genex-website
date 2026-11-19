import type { ComponentType, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { DashboardHeader } from '@/components/gelearn/DashboardHeader'
import { cn } from '@/lib/utils'

export interface WorkspaceNavItem {
  to: string
  label: string
  icon: ComponentType<SvgIconProps>
  active: boolean
}

interface WorkspaceShellProps {
  /** The header's context label; defaults to the account type ("My account · Professional"). */
  label?: string
  /** Names the menu for screen readers, e.g. "Account" or "Studio". */
  navLabel: string
  items: WorkspaceNavItem[]
  /** Shown under the menu on large screens. */
  navFooter?: ReactNode
  children: ReactNode
}

/**
 * The page frame shared by every dashboard: My account (Learners, Professionals,
 * company logins) and Company Studio, the course builder included. Header band,
 * a left menu that sticks on large screens (a scrolling strip on phones), then the page.
 */
export function WorkspaceShell({ label, navLabel, items, navFooter, children }: WorkspaceShellProps) {
  return (
    <div className="flex flex-col min-h-screen pb-10">
      <DashboardHeader label={label} />

      <section className="bg-white py-10 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row gap-7 lg:items-start">
          <nav aria-label={navLabel} className="lg:w-60 shrink-0 lg:sticky lg:top-28 min-w-0">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible -mx-1 px-1 pb-1 lg:mx-0 bg-white lg:border lg:border-border lg:rounded-2xl lg:p-3">
              {items.map(({ to, label: itemLabel, icon: Icon, active }) => (
                <li key={to} className="shrink-0">
                  <Link
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors',
                      active ? 'bg-primary/10 text-primary font-bold' : 'text-text-primary font-semibold hover:bg-surface',
                    )}
                  >
                    <Icon sx={{ fontSize: 18 }} />
                    {itemLabel}
                  </Link>
                </li>
              ))}
            </ul>
            {navFooter && <div className="hidden lg:block mt-3">{navFooter}</div>}
          </nav>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </section>
    </div>
  )
}
