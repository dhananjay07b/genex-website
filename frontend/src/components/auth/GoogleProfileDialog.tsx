import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ApiError } from '@/lib/api/client'
import { OTHER_COMPANY, companyOptions, emailMatchesCompany, useCompanies } from '@/hooks/useCompanies'
import { GoogleGlyph } from './GoogleLoginButton'
import { UnverifiedCompanyNote } from './UnverifiedCompanyNote'

export type AccountChoice = 'learner' | 'professional'

/** What the "Finish creating your account" step sends with the Google token. */
export interface GoogleProfile {
  account_type: AccountChoice
  display_name: string
  company_id: number | null
  company_other: string
  role_title: string
}

/** Values carried over from the sign-up form, so nothing is asked twice. */
export interface GoogleProfilePrefill {
  accountType?: AccountChoice
  companyChoice?: string
  companyOther?: string
  roleTitle?: string
}

const schema = z.object({
  displayName: z.string().trim().min(2, 'Name is required'),
  accountType: z.enum(['learner', 'professional']),
  companyChoice: z.string().optional(),
  companyOther: z.string().optional(),
  roleTitle: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.accountType !== 'professional') return
  if (!data.companyChoice) {
    ctx.addIssue({ code: 'custom', message: "Select your company, or choose 'Other'", path: ['companyChoice'] })
  } else if (data.companyChoice === OTHER_COMPANY && !data.companyOther?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Company name is required', path: ['companyOther'] })
  }
  if (!data.roleTitle?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Role is required', path: ['roleTitle'] })
  }
})

type FormData = z.infer<typeof schema>

// Backend field → form field, so server validation errors land inline.
const SERVER_FIELD: Record<string, keyof FormData> = {
  display_name: 'displayName',
  account_type: 'accountType',
  company_id: 'companyChoice',
  company_other: 'companyOther',
  role_title: 'roleTitle',
}

interface GoogleProfileDialogProps {
  email: string
  name: string
  prefill?: GoogleProfilePrefill
  /** Creates the account; rejects with the server's ApiError so it can be shown here. */
  onSubmit: (profile: GoogleProfile) => Promise<void>
  onCancel: () => void
}

/**
 * The step a new Google user completes before their account exists: what kind
 * of account it is (fixed for good once created) and, for a Professional,
 * their company and role. A native <dialog> keeps focus inside and closes on Escape.
 */
export function GoogleProfileDialog({ email, name, prefill, onSubmit, onCancel }: GoogleProfileDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { companies } = useCompanies()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: name,
      accountType: prefill?.accountType ?? 'learner',
      companyChoice: prefill?.companyChoice ?? '',
      companyOther: prefill?.companyOther ?? '',
      roleTitle: prefill?.roleTitle ?? '',
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    return () => dialog?.close()
  }, [])

  const accountType = useWatch({ control, name: 'accountType' })
  const companyChoice = useWatch({ control, name: 'companyChoice' })
  const selectedCompany = companies.find(c => String(c.id) === companyChoice)
  const companyMismatch = accountType === 'professional' && selectedCompany && !emailMatchesCompany(email, selectedCompany)

  async function submit(data: FormData) {
    setFormError('')
    const isProfessional = data.accountType === 'professional'
    try {
      await onSubmit({
        account_type: data.accountType,
        display_name: data.displayName.trim(),
        company_id: isProfessional ? (selectedCompany?.id ?? null) : null,
        company_other: isProfessional && data.companyChoice === OTHER_COMPANY ? (data.companyOther ?? '').trim() : '',
        role_title: isProfessional ? (data.roleTitle ?? '').trim() : '',
      })
    } catch (err) {
      let placedInline = false
      for (const [serverField, message] of Object.entries(err instanceof ApiError ? err.fields : {})) {
        const field = SERVER_FIELD[serverField]
        if (field) {
          setError(field, { message })
          placedInline = true
        }
      }
      if (!placedInline) setFormError(err instanceof ApiError ? err.message : "Couldn't create your account. Please try again.")
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="google-profile-title"
      // Escape (the dialog's own "cancel") goes through onCancel so the parent can reset.
      onCancel={e => { e.preventDefault(); if (!isSubmitting) onCancel() }}
      className="m-auto w-11/12 max-w-lg overflow-y-auto rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-dark-bg/50"
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <div className="px-6 pt-6 pb-2">
          <h2 id="google-profile-title" className="text-xl font-extrabold text-text-primary">Finish creating your account</h2>
          <p className="mt-1.5 flex items-start gap-1.5 text-sm text-text-muted">
            <span className="mt-0.5 shrink-0"><GoogleGlyph /></span>
            <span className="min-w-0">Signing up with <b className="font-semibold break-words text-text-primary">{email}</b></span>
          </p>

          <div className="mt-5 flex flex-col gap-4">
            <Input label="Display name" error={errors.displayName?.message} {...register('displayName')} />

            <fieldset>
              <legend className="mb-0.5 block text-sm font-semibold text-text-primary">I am a…</legend>
              <span className="mb-2 block text-xs text-text-muted">This can&apos;t be changed later, so choose carefully.</span>
              <div className="grid grid-cols-2 gap-3">
                {(['learner', 'professional'] as const).map(option => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 transition-colors ${
                      accountType === option ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <input type="radio" value={option} className="accent-primary" {...register('accountType')} />
                    <span className="text-sm font-semibold capitalize text-text-primary">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {accountType === 'professional' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Select
                    id="google-profile-company"
                    label="Company"
                    placeholder="Select your company"
                    options={companyOptions(companies)}
                    error={errors.companyChoice?.message}
                    {...register('companyChoice')}
                    value={companyChoice ?? ''}
                  />
                  <Input id="google-profile-role" label="Role" placeholder="e.g. Grid Engineer" error={errors.roleTitle?.message} {...register('roleTitle')} />
                </div>
                {companyChoice === OTHER_COMPANY && (
                  <Input id="google-profile-company-name" label="Company name" placeholder="e.g. Acme Energy" error={errors.companyOther?.message} {...register('companyOther')} />
                )}
                {selectedCompany && !companyMismatch && !errors.companyChoice && (
                  <p className="flex items-start gap-1.5 text-xs leading-relaxed text-text-muted">
                    <VerifiedOutlinedIcon sx={{ fontSize: 14 }} className="mt-px shrink-0 text-primary" />
                    Google has confirmed this email, so your content shows as verified {selectedCompany.name} straight away.
                  </p>
                )}
                {/* Not their company email: linking is allowed, the badge needs a confirmed work email. */}
                {companyMismatch && !errors.companyChoice && <UnverifiedCompanyNote company={selectedCompany} where="signup" />}
                {companyChoice === OTHER_COMPANY && (
                  <p className="text-xs leading-relaxed text-text-muted">Unlisted companies are shown by name only, without a verified badge.</p>
                )}
              </div>
            )}

            {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          </div>
        </div>

        <div className="flex gap-3 border-t border-border px-6 py-4">
          <Button type="button" variant="secondary" size="md" className="flex-1 justify-center" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" className="flex-1 justify-center" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </div>
      </form>
    </dialog>
  )
}
