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

  const login = useCallback(async (username: string, password: string) => {
    await apiFetch('/api/auth/login/', { method: 'POST', body: { username, password } })
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
