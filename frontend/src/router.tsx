import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { GeLearnLayout } from '@/components/layout/GeLearnLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleRoute } from '@/components/auth/RoleRoute'
import { LegacyRedirect } from '@/components/utils/LegacyRedirect'

const NotFound               = lazy(() => import('@/pages/NotFound'))
const Home                  = lazy(() => import('@/pages/Home'))
const Contact               = lazy(() => import('@/pages/Contact'))
const Careers                = lazy(() => import('@/pages/Careers'))
const DynamicSectionPage    = lazy(() => import('@/pages/DynamicSectionPage'))
const DynamicContentPage    = lazy(() => import('@/pages/DynamicContentPage'))

const GeLearn               = lazy(() => import('@/pages/GeLearn'))
const Research              = lazy(() => import('@/pages/GeLearn/sections/Research'))
const ResearchDetail        = lazy(() => import('@/pages/GeLearn/sections/ResearchDetail'))
const GeAcademy             = lazy(() => import('@/pages/GeLearn/sections/GeAcademy'))
const GeAcademyDetail       = lazy(() => import('@/pages/GeLearn/sections/GeAcademyDetail'))
const Blog                  = lazy(() => import('@/pages/GeLearn/sections/Blog'))
const BlogPost              = lazy(() => import('@/pages/GeLearn/sections/BlogPost'))
const VideoLibrary          = lazy(() => import('@/pages/GeLearn/sections/VideoLibrary'))
const VideoDetail           = lazy(() => import('@/pages/GeLearn/sections/VideoDetail'))
const PoliciesTenders       = lazy(() => import('@/pages/GeLearn/sections/PoliciesTenders'))
const Whitepapers           = lazy(() => import('@/pages/GeLearn/sections/Whitepapers'))
const Podcasts              = lazy(() => import('@/pages/GeLearn/sections/Podcasts'))
const PodcastDetail         = lazy(() => import('@/pages/GeLearn/sections/PodcastDetail'))
const Courses               = lazy(() => import('@/pages/GeLearn/sections/Courses'))
const CourseDetail          = lazy(() => import('@/pages/GeLearn/sections/CourseDetail'))
const CourseBuilder         = lazy(() => import('@/pages/Account/CourseBuilder'))
const Login                 = lazy(() => import('@/pages/Account/Login'))
const Register              = lazy(() => import('@/pages/Account/Register'))
const ForgotPassword        = lazy(() => import('@/pages/Account/ForgotPassword'))
const ResetPasswordConfirm  = lazy(() => import('@/pages/Account/ResetPasswordConfirm'))
const VerifyEmail           = lazy(() => import('@/pages/Account/VerifyEmail'))
const Profile                = lazy(() => import('@/pages/Account/Profile'))
const PublicProfile         = lazy(() => import('@/pages/Account/PublicProfile'))
const SubmitPost            = lazy(() => import('@/pages/Account/SubmitPost'))
const SubmitVideo           = lazy(() => import('@/pages/Account/SubmitVideo'))
const StudioLayout          = lazy(() => import('@/pages/Studio/StudioLayout'))
const StudioHome            = lazy(() => import('@/pages/Studio/StudioHome'))
const StudioList            = lazy(() => import('@/pages/Studio/StudioList'))
const StudioEditor          = lazy(() => import('@/pages/Studio/StudioEditor'))
const StudioTeam            = lazy(() => import('@/pages/Studio/StudioTeam'))

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
      { path: '/research',                 element: s(<Research />) },
      { path: '/research/:id',             element: s(<ResearchDetail />) },
      { path: '/geacademy',                element: s(<GeAcademy />) },
      { path: '/geacademy/:id',            element: s(<GeAcademyDetail />) },
      { path: '/blog',                     element: s(<Blog />) },
      { path: '/blog/:id',                 element: s(<BlogPost />) },
      { path: '/videos',                   element: s(<VideoLibrary />) },
      { path: '/videos/:id',               element: s(<VideoDetail />) },
      { path: '/policies-tenders',         element: s(<PoliciesTenders />) },
      { path: '/whitepapers',              element: s(<Whitepapers />) },
      { path: '/podcasts',                 element: s(<Podcasts />) },
      { path: '/podcasts/:id',             element: s(<PodcastDetail />) },
      { path: '/courses',                  element: s(<Courses />) },
      { path: '/courses/:slug',            element: s(<CourseDetail />) },
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
        ],
      },
      {
        // Posting blogs and videos is a Professional feature.
        element: <RoleRoute roles={['professional']} />,
        children: [
          { path: '/submit-post',          element: s(<SubmitPost />) },
          { path: '/submit-post/:id/edit', element: s(<SubmitPost />) },
          { path: '/submit-video',         element: s(<SubmitVideo />) },
          { path: '/submit-video/:id/edit', element: s(<SubmitVideo />) },
          { path: '/account/courses/new',  element: s(<CourseBuilder />) },
          { path: '/account/courses/:id/edit', element: s(<CourseBuilder />) },
        ],
      },
      {
        // Company Studio — publishing for Company accounts (Admin uses the CMS).
        element: <RoleRoute roles={['company']} />,
        children: [
          {
            path: '/studio',
            element: s(<StudioLayout />),
            children: [
              { index: true,                element: s(<StudioHome />) },
              { path: 'team',               element: s(<StudioTeam />) },
              { path: ':type',              element: s(<StudioList />) },
              { path: ':type/new',          element: s(<StudioEditor />) },
              { path: ':type/:id/edit',     element: s(<StudioEditor />) },
            ],
          },
        ],
      },
      // Renamed sections — old URLs stay valid (Apache also 301s these in production).
      { path: '/technology',               element: <LegacyRedirect to="/geacademy" /> },
      { path: '/technology/:id',           element: <LegacyRedirect to="/geacademy" /> },
      { path: '/case-studies',             element: <LegacyRedirect to="/research" /> },
      { path: '/case-studies/:id',         element: <LegacyRedirect to="/research" /> },
      { path: '/tenders',                  element: <LegacyRedirect to="/policies-tenders" /> },
      { path: '*',                         element: s(<NotFound />) },
    ],
  },
])
