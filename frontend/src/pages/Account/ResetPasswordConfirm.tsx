import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'

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
    <main>
      <PageMeta title="Reset Password — Genex GeLearn" description="Set a new password for your Genex GeLearn account." canonical="/reset-password" />
      <PageHero label="Account" headline="Reset Password" subline="Choose a new password for your account." />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-md mx-auto px-6">
          {status === 'done' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center space-y-3">
              <p className="text-text-primary font-semibold">Password updated</p>
              <p className="text-sm text-text-muted">You can now log in with your new password.</p>
              <Button variant="primary" size="lg" className="w-full justify-center mt-2" onClick={() => navigate('/login', { replace: true })}>
                Go to Log In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white rounded-2xl shadow-sm border border-border p-8">
              <Input label="New Password" type="password" placeholder="At least 8 characters" error={errors.password1?.message} {...register('password1')} />
              <Input label="Confirm New Password" type="password" placeholder="Re-enter password" error={errors.password2?.message} {...register('password2')} />

              {status === 'error' && (
                <p className="text-sm text-red-500">This reset link is invalid or has expired. Request a new one below.</p>
              )}

              <Button type="submit" variant="primary" size="lg" disabled={status === 'loading'} className="w-full justify-center">
                {status === 'loading' ? (
                  <>
                    <AutorenewIcon className="w-4 h-4 animate-spin mr-2" sx={{ fontSize: 16 }} />
                    Saving…
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <p className="text-sm text-text-muted text-center">
                <Link to="/forgot-password" className="text-primary font-semibold">Request a new link</Link>
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
