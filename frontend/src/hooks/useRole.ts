import { useAuth } from '@/context/useAuth'

/** Role flags for the signed-in user. Admin is the superuser flag, independent of account type. */
export function useRole() {
  const { user } = useAuth()
  const type = user?.account_type
  return {
    isAdmin: Boolean(user?.is_admin),
    isCompany: type === 'company',
    isProfessional: type === 'professional',
    isLearner: type === 'learner',
    /** Can publish content of some kind (Studio or submissions). */
    isContributor: type === 'company' || type === 'professional',
  }
}
