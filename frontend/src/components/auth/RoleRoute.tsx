import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import type { AccountType } from '@/types/auth'

/** Like ProtectedRoute, but also requires one of `roles`; everyone else goes to their dashboard. */
export function RoleRoute({ roles }: { roles: AccountType[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="min-h-screen" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!roles.includes(user.account_type)) return <Navigate to="/account" replace />
  return <Outlet />
}
