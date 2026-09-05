import { createContext } from 'react'
import type { User } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
