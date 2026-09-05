import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/context/useAuth'

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
    <main>
      <PageMeta title="Log In — Genex GeLearn" description="Log in to your Genex account." canonical="/login" />
      <PageHero label="Account" headline="Welcome Back" subline="Log in to comment, submit articles, and access member content." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-md mx-auto px-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
            <Input label="Username" placeholder="yourname" error={errors.username?.message} {...register('username')} />
            <Input label="Password" type="password" placeholder="••••••••" error={errors.password?.message} {...register('password')} />

            {status === 'error' && (
              <p className="text-sm text-red-500">Invalid username or password.</p>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center">
              {status === 'loading' ? (
                <>
                  <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                  Logging in…
                </>
              ) : (
                'Log In'
              )}
            </Button>

            <p className="text-sm text-text-muted text-center">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary font-semibold">Register</Link>
            </p>
          </form>

          <div className="mt-6">
            <GoogleLoginButton />
          </div>
        </div>
      </section>
    </main>
  )
}
