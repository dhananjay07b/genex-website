import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { apiFetch } from '@/lib/api/client'
import type { User } from '@/types/auth'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    async (username: string, email: string, password: string, displayName: string) => {
      await apiFetch('/api/auth/registration/', {
        method: 'POST',
        body: {
          username,
          email,
          password1: password,
          password2: password,
          display_name: displayName,
        },
      })
      await refetch()
    },
    [refetch]
  )

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout/', { method: 'POST' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  )
}
