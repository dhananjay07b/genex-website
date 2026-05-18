import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Contact from '@/pages/Contact'
import Careers from '@/pages/Careers'
import Portfolio from '@/pages/Portfolio'
import CategoryPage from '@/pages/Portfolio/CategoryPage'
import Innovations from '@/pages/Innovations'
import InnovationProductPage from '@/pages/Innovations/ProductPage'
import GeLearn from '@/pages/GeLearn'
import CaseStudies from '@/pages/GeLearn/sections/CaseStudies'
import Technology from '@/pages/GeLearn/sections/Technology'
import HowWeWork from '@/pages/GeLearn/sections/HowWeWork'
import Blog from '@/pages/GeLearn/sections/Blog'
import FAQ from '@/pages/GeLearn/sections/FAQ'
import VideoLibrary from '@/pages/GeLearn/sections/VideoLibrary'
import Tenders from '@/pages/GeLearn/sections/Tenders'
import Whitepapers from '@/pages/GeLearn/sections/Whitepapers'
import Podcasts from '@/pages/GeLearn/sections/Podcasts'
import About from '@/pages/About'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',                         element: <Home /> },
      { path: '/portfolio',                element: <Portfolio /> },
      { path: '/portfolio/:category',      element: <CategoryPage /> },
      { path: '/innovations',              element: <Innovations /> },
      { path: '/innovations/:slug',        element: <InnovationProductPage /> },
      { path: '/gelearn',                  element: <GeLearn /> },
      { path: '/gelearn/case-studies',     element: <CaseStudies /> },
      { path: '/gelearn/technology',       element: <Technology /> },
      { path: '/gelearn/how-we-work',      element: <HowWeWork /> },
      { path: '/gelearn/blog',             element: <Blog /> },
      { path: '/gelearn/faq',              element: <FAQ /> },
      { path: '/gelearn/videos',           element: <VideoLibrary /> },
      { path: '/gelearn/tenders',          element: <Tenders /> },
      { path: '/gelearn/whitepapers',      element: <Whitepapers /> },
      { path: '/gelearn/podcasts',         element: <Podcasts /> },
      { path: '/about',                    element: <About /> },
      { path: '/contact',                  element: <Contact /> },
      { path: '/careers',                  element: <Careers /> },
    ],
  },
])
