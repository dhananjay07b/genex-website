import { Navigate, useParams } from 'react-router-dom'

/** Permanently-moved route: redirects to `to`, carrying the `:id` param if present. */
export function LegacyRedirect({ to }: { to: string }) {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={id ? `${to}/${id}` : to} replace />
}
