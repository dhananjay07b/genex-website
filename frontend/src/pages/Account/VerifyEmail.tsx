import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { AuthLayout } from './AuthLayout'

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
    <>
      <PageMeta title="Verify Email — Genex GeLearn" description="Confirm your Genex GeLearn account email address." canonical="/verify-email" />

      <AuthLayout
        eyebrow="Account Setup"
        headline="One last step to join GeLearn."
        description="Confirming your email keeps your account secure and unlocks commenting, saving, and contributing."
        panelExtra={
          <div className="bg-white/6 border border-white/10 rounded-2xl px-4 py-4 flex items-start gap-3">
            <VerifiedOutlinedIcon sx={{ fontSize: 18 }} className="text-secondary shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-white/70">
              Verified accounts are the only ones that can publish blog posts, videos, and comments.
            </p>
          </div>
        }
        footerIcon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 16 }} />}
        footerText="This link can only be used once"
      >
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-center">
          {status === 'loading' && (
            <>
              <span className="inline-flex size-12 rounded-full bg-primary/10 text-primary items-center justify-center mb-4">
                <AutorenewIcon sx={{ fontSize: 24 }} className="animate-spin" />
              </span>
              <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Confirming your email…</h2>
              <p className="text-sm text-text-muted">This will just take a moment.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <span className="inline-flex size-12 rounded-full bg-secondary/10 text-secondary items-center justify-center mb-4">
                <MarkEmailReadOutlinedIcon sx={{ fontSize: 24 }} />
              </span>
              <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Email confirmed</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">Your email address has been verified.</p>
              <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => navigate('/login', { replace: true })}>
                Go to Log In
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <span className="inline-flex size-12 rounded-full bg-red-50 text-red-500 items-center justify-center mb-4">
                <ErrorOutlineOutlinedIcon sx={{ fontSize: 24 }} />
              </span>
              <h2 className="text-2xl font-extrabold text-text-primary mb-1.5">Couldn&apos;t verify this link</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">It may have expired or already been used.</p>
              <Button variant="primary" size="lg" className="w-full justify-center" onClick={() => navigate('/login', { replace: true })}>
                Go to Log In
              </Button>
            </>
          )}
        </motion.div>
      </AuthLayout>
    </>
  )
}
