import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const Home       = lazy(() => import('@/pages/Home'))
const ComingSoon = lazy(() => import('@/pages/ComingSoon'))

const s = (el: React.ReactNode) => (
  <Suspense fallback={<div className="min-h-screen" />}>{el}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',                         element: s(<Home />) },

      // ── All inner pages → Coming Soon until full launch ──
      { path: '/portfolio',                element: s(<ComingSoon />) },
      { path: '/portfolio/:category',      element: s(<ComingSoon />) },
      { path: '/innovations',              element: s(<ComingSoon />) },
      { path: '/innovations/:slug',        element: s(<ComingSoon />) },
      { path: '/gelearn',                  element: s(<ComingSoon />) },
      { path: '/gelearn/case-studies',     element: s(<ComingSoon />) },
      { path: '/gelearn/technology',       element: s(<ComingSoon />) },
      { path: '/gelearn/how-we-work',      element: s(<ComingSoon />) },
      { path: '/gelearn/blog',             element: s(<ComingSoon />) },
      { path: '/gelearn/faq',              element: s(<ComingSoon />) },
      { path: '/gelearn/videos',           element: s(<ComingSoon />) },
      { path: '/gelearn/tenders',          element: s(<ComingSoon />) },
      { path: '/gelearn/whitepapers',      element: s(<ComingSoon />) },
      { path: '/gelearn/podcasts',         element: s(<ComingSoon />) },
      { path: '/about',                    element: s(<ComingSoon />) },
      { path: '/about/media',              element: s(<ComingSoon />) },
      { path: '/contact',                  element: s(<ComingSoon />) },
      { path: '/careers',                  element: s(<ComingSoon />) },

      // Catch-all — any unmatched route shows Coming Soon
      { path: '*',                          element: s(<ComingSoon />) },
    ],
  },
])
