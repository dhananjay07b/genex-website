import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'
import type { CompanyOption } from '@/types/auth'

/** Registered companies for the Professional company picker (active ones only). */
export function useCompanies() {
  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    apiFetch<CompanyOption[]>('/api/organizations/companies/')
      .then(rows => { if (!cancelled) setCompanies(rows) })
      .catch(() => { if (!cancelled) setCompanies([]) })
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  return { companies, loaded }
}

/** '' = nothing picked, 'other' = unlisted company, otherwise a company id as a string. */
export type CompanyChoice = '' | 'other' | `${number}`

export const OTHER_COMPANY: CompanyChoice = 'other'

export function companyOptions(companies: CompanyOption[]) {
  return [
    ...companies.map(c => ({ value: String(c.id), label: c.name })),
    { value: OTHER_COMPANY, label: 'Other (not listed)' },
  ]
}

export function emailMatchesCompany(email: string, company: CompanyOption) {
  const domain = email.trim().toLowerCase().split('@')[1] ?? ''
  return company.domains.some(d => domain === d || domain.endsWith(`.${d}`))
}

export function domainList(company: CompanyOption) {
  return company.domains.map(d => `@${d}`).join(', ')
}
