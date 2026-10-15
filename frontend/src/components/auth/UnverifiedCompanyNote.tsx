import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import { domainList } from '@/hooks/useCompanies'
import type { CompanyOption } from '@/types/auth'

/**
 * Shown wherever a Professional links a registered company without a confirmed
 * email on its domain: it's linked, but unverified until they confirm a work email,
 * and claiming a company they don't work for can get the account banned.
 */
export function UnverifiedCompanyNote({ company, where }: { company: CompanyOption; where: 'signup' | 'settings' }) {
  return (
    <p role="note" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
      <WarningAmberOutlinedIcon sx={{ fontSize: 16 }} className="mt-px shrink-0 text-amber-600" />
      <span>
        {company.name} shows on your profile without the verified badge for now. To get the badge, confirm your{' '}
        {domainList(company)} work email {where === 'signup' ? 'in Settings after signing up' : 'below'}.{' '}
        <b className="font-semibold">Claiming a company you don&apos;t work for can get your account banned.</b>
      </span>
    </p>
  )
}
