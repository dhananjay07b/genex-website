import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Contact from '@/pages/Contact'
import Careers from '@/pages/Careers'
import Portfolio from '@/pages/Portfolio'
import CategoryPage from '@/pages/Portfolio/CategoryPage'
import Innovations from '@/pages/Innovations'
import InnovationProductPage from '@/pages/Innovations/ProductPage'
import GenexLearn from '@/pages/GenexLearn'
import About from '@/pages/About'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/portfolio/:category', element: <CategoryPage /> },
      { path: '/innovations', element: <Innovations /> },
      { path: '/innovations/:slug', element: <InnovationProductPage /> },
      { path: '/genex-learn/*', element: <GenexLearn /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/careers', element: <Careers /> },
    ],
  },
])
