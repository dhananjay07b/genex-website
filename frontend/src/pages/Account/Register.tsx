import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/context/useAuth'
import { OTHER_COMPANY, companyOptions, domainList, emailMatchesCompany, useCompanies } from '@/hooks/useCompanies'
import { ApiError } from '@/lib/api/client'
import { returnState, safeReturnPath } from '@/lib/authRedirect'
import { AuthLayout } from './AuthLayout'

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Include at least one lowercase letter')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number')

const schema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[\w.@+-]+$/, 'Letters, numbers, and . @ + - _ only'),
  email: z.string().email('Enter a valid email address'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please retype your password'),
  accountType: z.enum(['learner', 'professional']),
  companyChoice: z.string().optional(),
  companyOther: z.string().optional(),
  roleTitle: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
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

// Backend field name → form field, so server validation errors land inline.
const SERVER_FIELD: Record<string, keyof FormData> = {
  username: 'username',
  email: 'email',
  password1: 'password',
  display_name: 'displayName',
  account_type: 'accountType',
  company_id: 'companyChoice',
  company_other: 'companyOther',
  role_title: 'roleTitle',
}

const FEATURES = [
  'Publish blog posts & videos',
  'Get followed & build your profile',
  'Save articles & join the conversation',
]

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Back to the page that sent the visitor here (e.g. a course they wanted to enroll in), else the dashboard.
  const returnTo = safeReturnPath(location.state) ?? '/account'
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const { companies } = useCompanies()

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { accountType: 'learner', companyChoice: '' } })

  const accountType = watch('accountType')
  const companyChoice = watch('companyChoice')
  const selectedCompany = companies.find(c => String(c.id) === companyChoice)

  async function onSubmit(data: FormData) {
    const isProfessional = data.accountType === 'professional'
    const company = isProfessional ? companies.find(c => String(c.id) === data.companyChoice) : undefined
    if (company && !emailMatchesCompany(data.email, company)) {
      setError('email', {
        message: `Use your official ${domainList(company)} email to get verified as a ${company.name} expert, or choose 'Other'.`,
      })
      return
    }

    setStatus('loading')
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        accountType: data.accountType,
        companyId: company?.id ?? null,
        companyOther: isProfessional && data.companyChoice === OTHER_COMPANY ? data.companyOther : '',
        roleTitle: data.roleTitle,
      })
      navigate(returnTo, { replace: true })
    } catch (err) {
      setStatus('error')
      const fields = err instanceof ApiError ? err.fields : {}
      let placedInline = false
      for (const [serverField, message] of Object.entries(fields)) {
        const field = SERVER_FIELD[serverField]
        if (field) {
          setError(field, { message })
          placedInline = true
        }
      }
      setErrorMessage(
        placedInline
          ? 'Please fix the highlighted fields.'
          : err instanceof ApiError ? err.message : 'Could not create your account. Please try again.'
      )
    }
  }

  return (
    <>
      <PageMeta title="Create an Account — Genex GeLearn" description="Register for a Genex account to comment, submit articles, and unlock member content." canonical="/register" />

      <AuthLayout
        eyebrow="Join GeLearn"
        headline="Your work belongs in front of the people running the grid."
        description="Create an account to publish blog posts and videos, get featured on podcasts, comment on policies, tenders & whitepapers, and build a public profile the industry can follow."
        panelExtra={
          <div className="flex flex-col gap-3.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <CheckCircleOutlineIcon sx={{ fontSize: 15 }} className="text-secondary shrink-0" />
                <span className="text-sm font-semibold text-white/75">{f}</span>
              </div>
            ))}
          </div>
        }
        footerIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
        footerText="Free to join — GeLearn is Genex Technocrats' knowledge hub"
        panelWidthClassName="max-w-2xl"
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.02 }}>
          <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Create your account</h2>
          <p className="text-sm text-text-muted mb-6">Join the GeLearn community in under a minute.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
          <GoogleLoginButton redirectTo={returnTo} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-center gap-3 my-5"
        >
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">or</span>
          <div className="h-px flex-1 bg-border" />
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Left column — identity */}
            <div className="flex flex-col gap-4">
              <Input label="Display name" placeholder="Jane Doe" error={errors.displayName?.message} {...register('displayName')} />
              <Input label="Username" placeholder="janedoe" error={errors.username?.message} {...register('username')} />

              <div>
                <span className="block text-sm font-semibold text-text-primary mb-0.5">I am a…</span>
                <span className="block text-xs text-text-muted mb-2">This can&apos;t be changed later, so choose carefully.</span>
                <div className="grid grid-cols-2 gap-3">
                  {(['learner', 'professional'] as const).map(option => (
                    <label
                      key={option}
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                        accountType === option ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <input type="radio" value={option} className="accent-primary" {...register('accountType')} />
                      <span className="text-sm font-semibold text-text-primary capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {accountType === 'professional' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="Company"
                      placeholder="Select your company"
                      options={companyOptions(companies)}
                      error={errors.companyChoice?.message}
                      {...register('companyChoice')}
                      value={companyChoice ?? ''}
                    />
                    <Input label="Role" placeholder="e.g. Grid Engineer" error={errors.roleTitle?.message} {...register('roleTitle')} />
                  </div>
                  {companyChoice === OTHER_COMPANY && (
                    <Input
                      label="Company name"
                      placeholder="e.g. Acme Energy"
                      error={errors.companyOther?.message}
                      {...register('companyOther')}
                    />
                  )}
                  {selectedCompany && (
                    <p className="flex items-start gap-1.5 text-xs text-text-muted leading-relaxed">
                      <VerifiedOutlinedIcon sx={{ fontSize: 14 }} className="text-primary shrink-0 mt-px" />
                      Sign up with your {domainList(selectedCompany)} email. We&apos;ll send a link to confirm it, then
                      your content shows as verified {selectedCompany.name}.
                    </p>
                  )}
                  {companyChoice === OTHER_COMPANY && (
                    <p className="text-xs text-text-muted leading-relaxed">
                      Unlisted companies are shown by name only, without a verified badge.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right column — credentials */}
            <div className="flex flex-col gap-4">
              <Input label="Email" type="email" placeholder="you@company.com" error={errors.email?.message} {...register('email')} />
              <PasswordInput label="Password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />
              <PasswordInput label="Retype password" placeholder="Re-enter your password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
            </div>
          </div>

          {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}

          <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center mt-2">
            {status === 'loading' ? (
              <>
                <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                Creating account…
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="text-sm text-text-muted text-center mt-6"
        >
          Already have an account? <Link to="/login" state={returnState(location)} className="text-primary font-bold">Sign in</Link>
        </motion.p>
      </AuthLayout>
    </>
  )
}
