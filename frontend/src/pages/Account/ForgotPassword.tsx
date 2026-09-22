import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'

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
    <main>
      <PageMeta title="Forgot Password — Genex GeLearn" description="Reset your Genex GeLearn account password." canonical="/forgot-password" />
      <PageHero label="Account" headline="Forgot Password" subline="Enter your email and we'll send you a link to reset it." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-md mx-auto px-6">
          {status === 'sent' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center space-y-3">
              <p className="text-text-primary font-semibold">Check your email</p>
              <p className="text-sm text-text-muted">
                If an account exists for that address, we've sent a link to reset your password.
              </p>
              <Link to="/login" className="text-primary font-semibold text-sm inline-block mt-2">Back to log in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
              <Input label="Email" type="email" placeholder="rahul@company.com" error={errors.email?.message} {...register('email')} />

              {status === 'error' && (
                <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center">
                {status === 'loading' ? (
                  <>
                    <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                    Sending…
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <p className="text-sm text-text-muted text-center">
                Remembered it?{' '}
                <Link to="/login" className="text-primary font-semibold">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
