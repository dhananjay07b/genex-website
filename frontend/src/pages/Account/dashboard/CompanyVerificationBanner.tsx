import { useState } from 'react'
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/useAuth'
import { apiFetch } from '@/lib/api/client'

/**
 * Shown to a Professional linked to a registered company who hasn't proven it
 * yet — verification completes when they click the confirmation link sent to
 * their company-domain email.
 */
export function CompanyVerificationBanner() {
  const { user } = useAuth()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  if (!user || user.account_type !== 'professional' || !user.company?.slug || user.company_verified) return null

  async function resend() {
    if (!user) return
    setStatus('sending')
    try {
      await apiFetch('/api/auth/registration/resend-email/', { method: 'POST', body: { email: user.email } })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
      <span className="size-10 shrink-0 rounded-full bg-white text-primary flex items-center justify-center">
        <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 20 }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary">Confirm your email to get verified as a {user.company.name} expert</p>
        <p className="text-xs text-text-muted mt-1 leading-relaxed">
          We sent a confirmation link to <span className="font-semibold text-text-primary">{user.email}</span>. Until it&apos;s
          confirmed, your content shows without the {user.company.name} logo and verified badge.
        </p>
        {status === 'sent' && <p className="text-xs font-semibold text-secondary mt-1.5">New link sent. Check your inbox.</p>}
        {status === 'error' && <p className="text-xs font-semibold text-red-600 mt-1.5">Couldn&apos;t send the email. Try again in a few minutes.</p>}
      </div>
      <Button variant="secondary" size="sm" onClick={resend} disabled={status === 'sending' || status === 'sent'} className="shrink-0">
        {status === 'sending' ? 'Sending…' : 'Resend link'}
      </Button>
    </div>
  )
}
