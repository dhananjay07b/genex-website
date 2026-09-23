import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { AuthLayout } from './AuthLayout'

const schema = z
  .object({
    password1: z.string().min(8, 'Password must be at least 8 characters'),
    password2: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.password1 === data.password2, {
    message: 'Passwords do not match',
    path: ['password2'],
  })

type FormData = z.infer<typeof schema>

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams<{ uid: string; token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!uid || !token) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      await apiFetch('/api/auth/password/reset/confirm/', {
        method: 'POST',
        body: { uid, token, new_password1: data.password1, new_password2: data.password2 },
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PageMeta title="Reset Password — Genex GeLearn" description="Set a new password for your Genex GeLearn account." canonical="/reset-password" />

      <AuthLayout
        eyebrow="Account Recovery"
        headline="Choose a new password."
        description="Pick something strong and memorable — it's the key to your blogs, saved posts, and GeLearn activity."
        panelExtra={
          <div className="bg-white/6 border border-white/10 rounded-2xl px-4 py-4 flex items-start gap-3">
            <LockResetOutlinedIcon sx={{ fontSize: 18 }} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-white/70">
              Use at least 8 characters, and avoid reusing a password from another account.
            </p>
          </div>
        }
        footerIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
        footerText="Your new password takes effect immediately"
      >
        {status === 'done' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-center">
            <span className="inline-flex size-12 rounded-full bg-secondary/10 text-secondary items-center justify-center mb-4">
              <CheckCircleOutlineIcon sx={{ fontSize: 24 }} />
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Password updated</h2>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">You can now log in with your new password.</p>
            <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => navigate('/login', { replace: true })}>
              Go to Log In
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.02 }}>
              <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Reset password</h2>
              <p className="text-sm text-text-muted mb-7">Choose a new password for your account.</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="space-y-4"
            >
              <PasswordInput label="New Password" placeholder="At least 8 characters" error={errors.password1?.message} {...register('password1')} />
              <PasswordInput label="Confirm New Password" placeholder="Re-enter password" error={errors.password2?.message} {...register('password2')} />

              {status === 'error' && (
                <p className="text-sm text-red-500">This reset link is invalid or has expired. Request a new one below.</p>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center mt-2">
                {status === 'loading' ? (
                  <>
                    <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                    Saving…
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-sm text-text-muted text-center mt-6"
            >
              <Link to="/forgot-password" className="text-primary font-bold">Request a new link</Link>
            </motion.p>
          </>
        )}
      </AuthLayout>
    </>
  )
}
