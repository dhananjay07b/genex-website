import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Contact from '@/pages/Contact'
import Careers from '@/pages/Careers'
import Portfolio from '@/pages/Portfolio'
import Innovations from '@/pages/Innovations'
import GenexLearn from '@/pages/GenexLearn'
import About from '@/pages/About'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/portfolio/*', element: <Portfolio /> },
      { path: '/innovations/*', element: <Innovations /> },
      { path: '/genex-learn/*', element: <GenexLearn /> },
      { path: '/about/*', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/careers', element: <Careers /> },
    ],
  },
])
