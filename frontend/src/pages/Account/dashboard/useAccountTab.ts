import { useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { navItemsFor } from './navConfig'
import type { TabKey } from './types'

/** The tab shown on /account: `?tab=…` when it's one this account has, else the overview. */
export function useAccountTab(): TabKey {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const raw = searchParams.get('tab')
  return raw && navItemsFor(user?.account_type).some(item => item.key === raw) ? (raw as TabKey) : 'overview'
}
