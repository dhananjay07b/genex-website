import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { returnState } from '@/lib/authRedirect'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="min-h-screen" />
  if (!user) return <Navigate to="/login" replace state={returnState(location)} />
  return <Outlet />
}
