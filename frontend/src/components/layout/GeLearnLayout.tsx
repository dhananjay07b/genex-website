import { Outlet } from 'react-router-dom'
import { GeLearnHeader } from './GeLearnHeader'
import { GeLearnFooter } from './GeLearnFooter'
import { ScrollToTop } from '@/components/utils/ScrollToTop'

export function GeLearnLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <GeLearnHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <GeLearnFooter />
    </div>
  )
}
