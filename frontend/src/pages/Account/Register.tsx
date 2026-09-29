import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/context/useAuth'
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
  companyOther: z.string().optional(),
  roleTitle: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.accountType !== 'professional') return
  if (!data.companyOther?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Company is required', path: ['companyOther'] })
  }
  if (!data.roleTitle?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Role is required', path: ['roleTitle'] })
  }
})

type FormData = z.infer<typeof schema>

const FEATURES = [
  'Publish blog posts & videos',
  'Get followed & build your profile',
  'Save articles & join the conversation',
]

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { accountType: 'learner' } })

  const accountType = watch('accountType')

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        accountType: data.accountType,
        companyOther: data.companyOther,
        roleTitle: data.roleTitle,
      })
      navigate('/account', { replace: true })
    } catch {
      setStatus('error')
      setErrorMessage('Could not create your account. The username or email may already be taken.')
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
          <GoogleLoginButton />
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
                <span className="block text-sm font-semibold text-text-primary mb-2">I am a…</span>
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
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Company" placeholder="e.g. Genex Technocrats" error={errors.companyOther?.message} {...register('companyOther')} />
                  <Input label="Role" placeholder="e.g. Grid Engineer" error={errors.roleTitle?.message} {...register('roleTitle')} />
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
          Already have an account? <Link to="/login" className="text-primary font-bold">Sign in</Link>
        </motion.p>
      </AuthLayout>
    </>
  )
}
