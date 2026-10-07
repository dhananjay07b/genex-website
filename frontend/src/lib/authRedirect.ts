import type { Location } from 'react-router-dom'

// Pages that only exist for a signed-in user (the ProtectedRoute / RoleRoute groups in router.tsx).
// Logging out on one of these goes to the home page; anywhere else the visitor stays put.
const PRIVATE_PATHS = ['/account', '/studio', '/submit-post', '/submit-video']

// Sign-in pages themselves: never a place to come back to.
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

const under = (pathname: string, bases: string[]) => bases.some(base => pathname === base || pathname.startsWith(`${base}/`))

export const isPrivatePath = (pathname: string) => under(pathname, PRIVATE_PATHS)

/** The `from` in router state, if it's a safe in-app path: never another site, never a sign-in page. */
export function safeReturnPath(state: unknown): string | null {
  const from = (state as { from?: unknown } | null)?.from
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//') || from.startsWith('/\\')) return null
  return under(from.split(/[?#]/)[0], AUTH_PATHS) ? null : from
}

/**
 * Router state for a link or redirect to /login or /register, so the visitor comes back here afterwards.
 * On a sign-in page it passes along the page that sent them there instead.
 */
export function returnState(location: Location): { from: string } | undefined {
  if (under(location.pathname, AUTH_PATHS)) {
    const from = safeReturnPath(location.state)
    return from ? { from } : undefined
  }
  return { from: `${location.pathname}${location.search}${location.hash}` }
}
