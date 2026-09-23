import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { AuthLayout } from './AuthLayout'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'sent'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await apiFetch('/api/auth/password/reset/', { method: 'POST', body: { email: data.email } })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PageMeta title="Forgot Password — Genex GeLearn" description="Reset your Genex GeLearn account password." canonical="/forgot-password" />

      <AuthLayout
        eyebrow="Account Recovery"
        headline="Locked out happens. Let's get you back in."
        description="Enter the email on your GeLearn account and we'll send a secure link to reset your password."
        panelExtra={
          <div className="bg-white/6 border border-white/10 rounded-2xl px-4 py-4 flex items-start gap-3">
            <ShieldOutlinedIcon sx={{ fontSize: 18 }} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-white/70">
              Reset links expire after a short window and can only be used once, for your account&apos;s security.
            </p>
          </div>
        }
        footerIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 16 }} />}
        footerText="Reset links are sent only to verified addresses"
      >
        {status === 'sent' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-center">
            <span className="inline-flex size-12 rounded-full bg-secondary/10 text-secondary items-center justify-center mb-4">
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 24 }} />
            </span>
            <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Check your email</h2>
            <p className="text-sm text-text-muted mb-6 leading-relaxed">
              If an account exists for that address, we&apos;ve sent a link to reset your password.
            </p>
            <Link to="/login" className="text-primary font-bold text-sm">Back to log in</Link>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.02 }}>
              <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Forgot password</h2>
              <p className="text-sm text-text-muted mb-7">Enter your email and we&apos;ll send you a link to reset it.</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.06 }}
              className="space-y-4"
            >
              <Input label="Email" type="email" placeholder="rahul@company.com" error={errors.email?.message} {...register('email')} />

              {status === 'error' && (
                <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center mt-2">
                {status === 'loading' ? (
                  <>
                    <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                    Sending…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-sm text-text-muted text-center mt-6"
            >
              Remembered it? <Link to="/login" className="text-primary font-bold">Log in</Link>
            </motion.p>
          </>
        )}
      </AuthLayout>
    </>
  )
}
