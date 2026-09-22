import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/context/useAuth'
import { AuthLayout } from './AuthLayout'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await login(data.username, data.password)
      const from = (location.state as { from?: string } | null)?.from ?? '/account'
      navigate(from, { replace: true })
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <PageMeta title="Log In — Genex GeLearn" description="Log in to your Genex account." canonical="/login" />

      <AuthLayout
        eyebrow="Genex Technocrats"
        headline="Where power & energy practitioners build together."
        description="Blogs, field-tested case studies, whitepapers and podcasts from engineers running India's energy infrastructure — sign in to save, comment, and contribute."
        panelExtra={
          <div className="flex gap-3">
            <div className="flex-1 bg-white/6 border border-white/10 rounded-2xl px-4 py-4">
              <p className="text-xl font-extrabold text-white">120+</p>
              <p className="text-xs font-semibold text-white/60 mt-0.5">Projects Delivered</p>
            </div>
            <div className="flex-1 bg-white/6 border border-white/10 rounded-2xl px-4 py-4">
              <p className="text-xl font-extrabold text-white">15+</p>
              <p className="text-xs font-semibold text-white/60 mt-0.5">Years in Operation</p>
            </div>
          </div>
        }
        footerIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
        footerText="Every submission reviewed by our editorial team"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.02 }}
        >
          <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Welcome back</h2>
          <p className="text-sm text-text-muted mb-7">Sign in to continue to your GeLearn account.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}>
          <GoogleLoginButton />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex items-center gap-3 my-6"
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
          <Input label="Username or email" placeholder="you@company.com" error={errors.username?.message} {...register('username')} />
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-sm font-semibold text-text-primary">Password</label>
              <Link to="/forgot-password" className="text-xs font-bold text-primary">Forgot password?</Link>
            </div>
            <PasswordInput id="login-password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          </div>

          {status === 'error' && (
            <p className="text-sm text-red-500">Invalid username or password.</p>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center mt-2">
            {status === 'loading' ? (
              <>
                <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                Signing in…
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="text-sm text-text-muted text-center mt-6"
        >
          New to GeLearn? <Link to="/register" className="text-primary font-bold">Create an account</Link>
        </motion.p>
      </AuthLayout>
    </>
  )
}
