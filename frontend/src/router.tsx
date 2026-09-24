import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { GeLearnLayout } from '@/components/layout/GeLearnLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

const NotFound               = lazy(() => import('@/pages/NotFound'))
const Home                  = lazy(() => import('@/pages/Home'))
const Contact               = lazy(() => import('@/pages/Contact'))
const Careers                = lazy(() => import('@/pages/Careers'))
const DynamicSectionPage    = lazy(() => import('@/pages/DynamicSectionPage'))
const DynamicContentPage    = lazy(() => import('@/pages/DynamicContentPage'))

const GeLearn               = lazy(() => import('@/pages/GeLearn'))
const CaseStudies           = lazy(() => import('@/pages/GeLearn/sections/CaseStudies'))
const CaseStudyDetail       = lazy(() => import('@/pages/GeLearn/sections/CaseStudyDetail'))
const Technology            = lazy(() => import('@/pages/GeLearn/sections/Technology'))
const TechnologyDetail      = lazy(() => import('@/pages/GeLearn/sections/TechnologyDetail'))
const Blog                  = lazy(() => import('@/pages/GeLearn/sections/Blog'))
const BlogPost              = lazy(() => import('@/pages/GeLearn/sections/BlogPost'))
const VideoLibrary          = lazy(() => import('@/pages/GeLearn/sections/VideoLibrary'))
const VideoDetail           = lazy(() => import('@/pages/GeLearn/sections/VideoDetail'))
const Tenders               = lazy(() => import('@/pages/GeLearn/sections/Tenders'))
const Whitepapers           = lazy(() => import('@/pages/GeLearn/sections/Whitepapers'))
const Podcasts              = lazy(() => import('@/pages/GeLearn/sections/Podcasts'))
const PodcastDetail         = lazy(() => import('@/pages/GeLearn/sections/PodcastDetail'))
const Login                 = lazy(() => import('@/pages/Account/Login'))
const Register              = lazy(() => import('@/pages/Account/Register'))
const ForgotPassword        = lazy(() => import('@/pages/Account/ForgotPassword'))
const ResetPasswordConfirm  = lazy(() => import('@/pages/Account/ResetPasswordConfirm'))
const VerifyEmail           = lazy(() => import('@/pages/Account/VerifyEmail'))
const Profile                = lazy(() => import('@/pages/Account/Profile'))
const PublicProfile         = lazy(() => import('@/pages/Account/PublicProfile'))
const SubmitPost            = lazy(() => import('@/pages/Account/SubmitPost'))
const SubmitVideo           = lazy(() => import('@/pages/Account/SubmitVideo'))

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
      {
        path: '/portfolio',
        element: s(
          <DynamicSectionPage
            sectionSlug="portfolio"
            fallbackTitle="Software Products for Power & Energy"
            fallbackDescription="Production-grade software products for India's energy sector, engineered by Genex Technocrats."
          />
        ),
      },
      { path: '/portfolio/*',              element: s(<DynamicContentPage sectionSlug="portfolio" fallbackPath="/portfolio" />) },
      {
        path: '/innovations',
        element: s(
          <DynamicSectionPage
            sectionSlug="innovations"
            fallbackTitle="Innovations — Genex Technocrats"
            fallbackDescription="Innovation platforms built for India's power sector."
          />
        ),
      },
      { path: '/innovations/*',            element: s(<DynamicContentPage sectionSlug="innovations" fallbackPath="/innovations" />) },
      {
        path: '/about',
        element: s(
          <DynamicSectionPage
            sectionSlug="about"
            fallbackTitle="About Genex Technocrats — India's Energy Intelligence Platform"
            fallbackDescription="Genex Technocrats builds the software and systems that run India's renewable energy infrastructure."
          />
        ),
      },
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
      { path: '/videos/:id',               element: s(<VideoDetail />) },
      { path: '/tenders',                  element: s(<Tenders />) },
      { path: '/whitepapers',              element: s(<Whitepapers />) },
      { path: '/podcasts',                 element: s(<Podcasts />) },
      { path: '/podcasts/:id',             element: s(<PodcastDetail />) },
      { path: '/login',                    element: s(<Login />) },
      { path: '/register',                 element: s(<Register />) },
      { path: '/forgot-password',          element: s(<ForgotPassword />) },
      { path: '/reset-password/:uid/:token', element: s(<ResetPasswordConfirm />) },
      { path: '/verify-email/:key',        element: s(<VerifyEmail />) },
      { path: '/u/:username',              element: s(<PublicProfile />) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/account',              element: s(<Profile />) },
          { path: '/submit-post',          element: s(<SubmitPost />) },
          { path: '/submit-post/:id/edit', element: s(<SubmitPost />) },
          { path: '/submit-video',         element: s(<SubmitVideo />) },
          { path: '/submit-video/:id/edit', element: s(<SubmitVideo />) },
        ],
      },
      { path: '*',                         element: s(<NotFound />) },
    ],
  },
])
