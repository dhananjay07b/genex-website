import { Outlet, useLocation } from 'react-router-dom'
import { GeLearnHeader } from './GeLearnHeader'
import { GeLearnFooter } from './GeLearnFooter'
import { DashboardFooterStrip } from './DashboardFooterStrip'
import { ScrollToTop } from '@/components/utils/ScrollToTop'
import { DevShellUrlSync } from '@/components/utils/DevShellUrlSync'

// Full-bleed auth pages: no site header/footer, no page scroll — the page
// itself is the whole viewport (see AuthLayout.tsx).
const FULL_BLEED_PATHS = ['/login', '/register']

// Dashboard + its editor pages: the full site footer is swapped for a
// minimal fixed copyright strip instead — a "Need help?" block lives in the
// dashboard's Settings tab in place of the footer's contact links.
const DASHBOARD_PATHS = ['/account', '/submit-post', '/submit-video']

function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.includes(pathname) || pathname.startsWith('/u/')
}

export function GeLearnLayout() {
  const { pathname } = useLocation()

  if (FULL_BLEED_PATHS.includes(pathname)) {
    return (
      <>
        <ScrollToTop />
        <DevShellUrlSync shell="gelearn" />
        <Outlet />
      </>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <DevShellUrlSync shell="gelearn" />
      <GeLearnHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {isDashboardPath(pathname) ? <DashboardFooterStrip /> : <GeLearnFooter />}
    </div>
  )
}
