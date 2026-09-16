import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { GeLearnLayout } from '@/components/layout/GeLearnLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const NotFound               = lazy(() => import('@/pages/NotFound'))
const Home                  = lazy(() => import('@/pages/Home'))
const Contact               = lazy(() => import('@/pages/Contact'))
const Careers                = lazy(() => import('@/pages/Careers'))
const Portfolio             = lazy(() => import('@/pages/Portfolio'))
const Innovations           = lazy(() => import('@/pages/Innovations'))
const About                 = lazy(() => import('@/pages/About'))
const DynamicContentPage    = lazy(() => import('@/pages/DynamicContentPage'))

const GeLearn               = lazy(() => import('@/pages/GeLearn'))
const CaseStudies           = lazy(() => import('@/pages/GeLearn/sections/CaseStudies'))
const CaseStudyDetail       = lazy(() => import('@/pages/GeLearn/sections/CaseStudyDetail'))
const Technology            = lazy(() => import('@/pages/GeLearn/sections/Technology'))
const TechnologyDetail      = lazy(() => import('@/pages/GeLearn/sections/TechnologyDetail'))
const Blog                  = lazy(() => import('@/pages/GeLearn/sections/Blog'))
const BlogPost              = lazy(() => import('@/pages/GeLearn/sections/BlogPost'))
const VideoLibrary          = lazy(() => import('@/pages/GeLearn/sections/VideoLibrary'))
const Tenders               = lazy(() => import('@/pages/GeLearn/sections/Tenders'))
const Whitepapers           = lazy(() => import('@/pages/GeLearn/sections/Whitepapers'))
const Podcasts              = lazy(() => import('@/pages/GeLearn/sections/Podcasts'))
const Login                 = lazy(() => import('@/pages/Account/Login'))
const Register              = lazy(() => import('@/pages/Account/Register'))
const Profile                = lazy(() => import('@/pages/Account/Profile'))
const SubmitPost            = lazy(() => import('@/pages/Account/SubmitPost'))

const s = (el: React.ReactNode) => (
  <Suspense fallback={<div className="min-h-screen" />}>{el}</Suspense>
)

// Marketing site — genextechnocrats.com. No GeLearn content, no accounts/auth.
export const marketingRouter = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: s(<NotFound />),
    children: [
      { path: '/',                         element: s(<Home />) },
      { path: '/portfolio',                element: s(<Portfolio />) },
      { path: '/portfolio/*',              element: s(<DynamicContentPage sectionSlug="portfolio" fallbackPath="/portfolio" />) },
      { path: '/innovations',              element: s(<Innovations />) },
      { path: '/innovations/*',            element: s(<DynamicContentPage sectionSlug="innovations" fallbackPath="/innovations" />) },
      { path: '/about',                    element: s(<About />) },
      { path: '/about/*',                  element: s(<DynamicContentPage sectionSlug="about" fallbackPath="/about" />) },
      { path: '/contact',                  element: s(<Contact />) },
      { path: '/careers',                  element: s(<Careers />) },
      { path: '*',                         element: s(<NotFound />) },
    ],
  },
])

// GeLearn platform — gelearn.genextechnocrats.com. All account/auth features live here.
export const gelearnRouter = createBrowserRouter([
  {
    element: <GeLearnLayout />,
    errorElement: s(<NotFound />),
    children: [
      { path: '/',                         element: s(<GeLearn />) },
      { path: '/case-studies',             element: s(<CaseStudies />) },
      { path: '/case-studies/:id',         element: s(<CaseStudyDetail />) },
      { path: '/technology',               element: s(<Technology />) },
      { path: '/technology/:id',           element: s(<TechnologyDetail />) },
      { path: '/blog',                     element: s(<Blog />) },
      { path: '/blog/:id',                 element: s(<BlogPost />) },
      { path: '/videos',                   element: s(<VideoLibrary />) },
      { path: '/tenders',                  element: s(<Tenders />) },
      { path: '/whitepapers',              element: s(<Whitepapers />) },
      { path: '/podcasts',                 element: s(<Podcasts />) },
      { path: '/login',                    element: s(<Login />) },
      { path: '/register',                 element: s(<Register />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/account',              element: s(<Profile />) },
          { path: '/submit-post',          element: s(<SubmitPost />) },
        ],
      },
      { path: '*',                         element: s(<NotFound />) },
    ],
  },
])
