import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch, refreshSession } from '@/lib/api/client'
import type { RegisterInput, User } from '@/types/auth'
import { AuthContext } from './auth-context'

/** Renew a little before the 5-minute sign-in cookie runs out. */
const RENEW_EVERY_MS = 4 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState(0)

  const refetch = useCallback(async () => {
    try {
      const me = await apiFetch<User>('/api/accounts/me/')
      setUser(me)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    async function hydrate() {
      await refetch()
      setIsLoading(false)
    }
    void hydrate()
  }, [refetch])

  const login = useCallback(async (email: string, password: string) => {
    // The backend is configured for email-only login (ACCOUNT_LOGIN_METHODS
    // = {"email"}) — dj-rest-auth's LoginSerializer only ever looks at the
    // "email" key in that mode, so sending "username" here always 400s
    // regardless of whether the credentials are correct.
    await apiFetch('/api/auth/login/', { method: 'POST', body: { email, password } })
    await refetch()
  }, [refetch])

  const register = useCallback(
    async ({ username, email, password, displayName, accountType, companyId, companyOther, roleTitle }: RegisterInput) => {
      await apiFetch('/api/auth/registration/', {
        method: 'POST',
        body: {
          username,
          email,
          password1: password,
          password2: password,
          display_name: displayName,
          account_type: accountType,
          company_id: accountType === 'professional' ? (companyId ?? null) : null,
          company_other: accountType === 'professional' && !companyId ? companyOther : '',
          role_title: accountType === 'professional' ? roleTitle : '',
        },
      })
      await refetch()
    },
    [refetch]
  )

  // Keep the session fresh while signed in. The sign-in cookie lasts 5 minutes and is
  // only renewed when a request is refused; public pages never are, so without this a
  // signed-in learner who idles for 5 minutes gets the visitor version of public pages.
  const signedIn = Boolean(user)
  useEffect(() => {
    if (!signedIn) return
    let last = Date.now()
    const renew = async () => {
      last = Date.now()
      if (!(await refreshSession())) await refetch()  // refresh cookie expired too: show as signed out
    }
    const timer = window.setInterval(() => { void renew() }, RENEW_EVERY_MS)
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - last > RENEW_EVERY_MS) void renew()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [signedIn, refetch])

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout/', { method: 'POST' })
    setUser(null)
    setSession(s => s + 1)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, session, login, register, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}
