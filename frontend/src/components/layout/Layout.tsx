import { Outlet } from 'react-router-dom'
import { Header } from './Header'
// import { Footer } from './Footer'
import { ScrollToTop } from '@/components/utils/ScrollToTop'

export function Layout() {
  // const { pathname } = useLocation()
  // const showFooter = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* {showFooter && <Footer />} */}
    </div>
  )
}
