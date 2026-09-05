import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { useAuth } from '@/context/useAuth'

const schema = z.object({
  displayName: z.string().min(2, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[\w.@+-]+$/, 'Letters, numbers, and . @ + - _ only'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setStatus('loading')
    try {
      await registerUser(data.username, data.email, data.password, data.displayName)
      navigate('/account', { replace: true })
    } catch {
      setStatus('error')
      setErrorMessage('Could not create your account. The username or email may already be taken.')
    }
  }

  return (
    <main>
      <PageMeta title="Create an Account — Genex GeLearn" description="Register for a Genex account to comment, submit articles, and unlock member content." canonical="/register" />
      <PageHero label="Account" headline="Join GeLearn" subline="Create an account to comment on articles, submit your own posts, and unlock member-only videos and podcasts." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-md mx-auto px-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
            <Input label="Full Name" placeholder="Rahul Sharma" error={errors.displayName?.message} {...register('displayName')} />
            <Input label="Username" placeholder="rahulsharma" error={errors.username?.message} {...register('username')} />
            <Input label="Email" type="email" placeholder="rahul@company.com" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" placeholder="At least 8 characters" error={errors.password?.message} {...register('password')} />

            {status === 'error' && <p className="text-sm text-red-500">{errorMessage}</p>}

            <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center">
              {status === 'loading' ? (
                <>
                  <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-sm text-text-muted text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold">Log in</Link>
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
