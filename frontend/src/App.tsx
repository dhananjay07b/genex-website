import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { router } from '@/router'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AuthProvider } from '@/context/AuthContext'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AuthProvider>
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
