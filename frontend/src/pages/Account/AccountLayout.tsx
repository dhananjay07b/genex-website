import { Outlet, useLocation } from 'react-router-dom'
import { WorkspaceShell } from '@/components/gelearn/workspace/WorkspaceShell'
import { useAuth } from '@/context/useAuth'
import { navItemsFor } from './dashboard/navConfig'
import { TAB_LABELS, type TabKey } from './dashboard/types'
import { useAccountTab } from './dashboard/useAccountTab'

/**
 * My account for every account type: the shared dashboard frame with the account menu.
 * Wraps /account (its tabs) and the Professional course builder, which shows "My Courses" as current.
 */
export default function AccountLayout() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const tab = useAccountTab()
  const current: TabKey = pathname.startsWith('/account/courses') ? 'courses' : tab

  const items = navItemsFor(user?.account_type).map(item => ({
    to: item.key === 'overview' ? '/account' : `/account?tab=${item.key}`,
    label: TAB_LABELS[item.key],
    icon: item.icon,
    active: item.key === current,
  }))

  return (
    <WorkspaceShell
      navLabel="Account"
      items={items}
      navFooter={
        <div className="rounded-xl bg-surface p-3.5 text-xs text-text-muted leading-relaxed">
          <span className="font-bold text-text-primary">Coming to GeLearn:</span> checkout for paid
          courses and content, so you can buy and unlock them right here.
        </div>
      }
    >
      <Outlet />
    </WorkspaceShell>
  )
}
