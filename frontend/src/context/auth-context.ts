import { createContext } from 'react'
import type { RegisterInput, User } from '@/types/auth'

export interface AuthContextValue {
  user: User | null
  isLoading: boolean
  /** Goes up on every logout; layouts key their page on it so nothing signed-in stays on screen. */
  session: number
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refetch: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
