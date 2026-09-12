import { useEffect, useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { marketingRouter, gelearnRouter } from '@/router'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { AuthProvider } from '@/context/AuthContext'
import { isGeLearnHost } from '@/lib/host'

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  const onGeLearn = isGeLearnHost()

  const routerProvider = <RouterProvider router={onGeLearn ? gelearnRouter : marketingRouter} />

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen />}</AnimatePresence>
      {onGeLearn ? <AuthProvider>{routerProvider}</AuthProvider> : routerProvider}
    </>
  )
}
