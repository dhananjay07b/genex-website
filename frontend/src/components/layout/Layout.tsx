import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from '@/components/utils/ScrollToTop'
import { DevShellUrlSync } from '@/components/utils/DevShellUrlSync'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <DevShellUrlSync shell="marketing" />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
