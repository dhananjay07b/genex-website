import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageHero } from '@/components/ui/PageHero'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'

export default function VerifyEmail() {
  const { key } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(key ? 'loading' : 'error')

  useEffect(() => {
    if (!key) return
    apiFetch('/api/auth/registration/verify-email/', { method: 'POST', body: { key } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [key])

  return (
    <main>
      <PageMeta title="Verify Email — Genex GeLearn" description="Confirm your Genex GeLearn account email address." canonical="/verify-email" />
      <PageHero label="Account" headline="Email Verification" />

      <section className="bg-white py-16 lg:py-24">
        <div className="max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-sm border border-border p-8 text-center space-y-3">
            {status === 'loading' && <p className="text-sm text-text-muted">Confirming your email…</p>}

            {status === 'success' && (
              <>
                <p className="text-text-primary font-semibold">Email confirmed</p>
                <p className="text-sm text-text-muted">Your email address has been verified.</p>
              </>
            )}

            {status === 'error' && (
              <>
                <p className="text-text-primary font-semibold">Couldn&apos;t verify this link</p>
                <p className="text-sm text-text-muted">It may have expired or already been used.</p>
              </>
            )}

            <Button variant="primary" size="lg" className="w-full justify-center mt-2" onClick={() => navigate('/login', { replace: true })}>
              Go to Log In
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
