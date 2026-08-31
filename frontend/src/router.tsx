import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'

const Home                  = lazy(() => import('@/pages/Home'))
const Contact               = lazy(() => import('@/pages/Contact'))
const Careers               = lazy(() => import('@/pages/Careers'))
const Portfolio             = lazy(() => import('@/pages/Portfolio'))
const CategoryPage          = lazy(() => import('@/pages/Portfolio/CategoryPage'))
const Innovations           = lazy(() => import('@/pages/Innovations'))
const InnovationProductPage = lazy(() => import('@/pages/Innovations/ProductPage'))
const GeLearn               = lazy(() => import('@/pages/GeLearn'))
const CaseStudies           = lazy(() => import('@/pages/GeLearn/sections/CaseStudies'))
const CaseStudyDetail       = lazy(() => import('@/pages/GeLearn/sections/CaseStudyDetail'))
const Technology            = lazy(() => import('@/pages/GeLearn/sections/Technology'))
const TechnologyDetail      = lazy(() => import('@/pages/GeLearn/sections/TechnologyDetail'))
const HowWeWork             = lazy(() => import('@/pages/GeLearn/sections/HowWeWork'))
const Blog                  = lazy(() => import('@/pages/GeLearn/sections/Blog'))
const BlogPost              = lazy(() => import('@/pages/GeLearn/sections/BlogPost'))
const FAQ                   = lazy(() => import('@/pages/GeLearn/sections/FAQ'))
const VideoLibrary          = lazy(() => import('@/pages/GeLearn/sections/VideoLibrary'))
const Tenders               = lazy(() => import('@/pages/GeLearn/sections/Tenders'))
const Whitepapers           = lazy(() => import('@/pages/GeLearn/sections/Whitepapers'))
const Podcasts              = lazy(() => import('@/pages/GeLearn/sections/Podcasts'))
const About                 = lazy(() => import('@/pages/About'))
const Media                 = lazy(() => import('@/pages/About/Media'))
const Team                  = lazy(() => import('@/pages/About/Team'))

const s = (el: React.ReactNode) => (
  <Suspense fallback={<div className="min-h-screen" />}>{el}</Suspense>
)

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',                         element: s(<Home />) },
      { path: '/portfolio',                element: s(<Portfolio />) },
      { path: '/portfolio/:category',      element: s(<CategoryPage />) },
      { path: '/innovations',              element: s(<Innovations />) },
      { path: '/innovations/:slug',        element: s(<InnovationProductPage />) },
      { path: '/gelearn',                  element: s(<GeLearn />) },
      { path: '/gelearn/case-studies',         element: s(<CaseStudies />) },
      { path: '/gelearn/case-studies/:id',    element: s(<CaseStudyDetail />) },
      { path: '/gelearn/technology',          element: s(<Technology />) },
      { path: '/gelearn/technology/:id',     element: s(<TechnologyDetail />) },
      { path: '/gelearn/how-we-work',      element: s(<HowWeWork />) },
      { path: '/gelearn/blog',             element: s(<Blog />) },
      { path: '/gelearn/blog/:id',         element: s(<BlogPost />) },
      { path: '/gelearn/faq',              element: s(<FAQ />) },
      { path: '/gelearn/videos',           element: s(<VideoLibrary />) },
      { path: '/gelearn/tenders',          element: s(<Tenders />) },
      { path: '/gelearn/whitepapers',      element: s(<Whitepapers />) },
      { path: '/gelearn/podcasts',         element: s(<Podcasts />) },
      { path: '/about',                    element: s(<About />) },
      { path: '/about/media',              element: s(<Media />) },
      { path: '/about/teams',              element: s(<Team />) },
      { path: '/contact',                  element: s(<Contact />) },
      { path: '/careers',                  element: s(<Careers />) },
    ],
  },
])
