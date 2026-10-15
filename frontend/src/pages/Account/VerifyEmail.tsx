import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import { PageMeta } from '@/components/seo/PageMeta'
import { Button } from '@/components/ui/Button'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'

/** POST /api/auth/registration/verify-email/ (backend accounts.views.GenexVerifyEmailView). */
interface ConfirmationResult {
  already_confirmed: boolean
  email: string
  /** The account's sign-in email, or a work email added to prove where they work. */
  kind: 'sign_in' | 'work'
  account: { username: string; display_name: string }
  /** Set when the account now shows as a verified expert of this company. */
  verified_company: string | null
}

/** How long a confirmation link works (allauth EMAIL_CONFIRMATION_EXPIRE_DAYS). */
const LINK_DAYS = 3

// One request per key, however often the page mounts (React runs effects twice in development,
// which used to confirm the email and then report the now-used link as invalid).
const confirmations = new Map<string, Promise<ConfirmationResult>>()

function confirmKey(key: string) {
  if (!confirmations.has(key)) {
    confirmations.set(key, apiFetch<ConfirmationResult>('/api/auth/registration/verify-email/', { method: 'POST', body: { key } }))
  }
  return confirmations.get(key)!
}

/**
 * Where an email confirmation link lands. A standalone screen (no site header)
 * that says exactly what happened: which address, whose account and what kind,
 * whether it made the account a verified company expert — or why the link failed.
 * A work email's link is often opened by the colleague who owns that inbox, not
 * the account holder, so the wording doesn't assume it's "your" account.
 */
export default function VerifyEmail() {
  const { key } = useParams<{ key: string }>()
  const navigate = useNavigate()
  const { user, refetch } = useAuth()
  const [result, setResult] = useState<ConfirmationResult | null>(null)
  const [failed, setFailed] = useState(!key)

  useEffect(() => {
    if (!key) return
    let cancelled = false
    confirmKey(key)
      .then(res => {
        if (cancelled) return
        setResult(res)
        void refetch()  // a confirmed company email may have just verified the signed-in account
      })
      .catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [key, refetch])

  const mine = Boolean(user && result && user.username === result.account.username)

  return (
    <>
      <PageMeta title="Email Confirmation" description="Confirm an email address for a GeLearn account." canonical="/verify-email" noIndex />
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-10">
        <Link to="/" aria-label="GeLearn home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <img src="/brand/gelearn-logo.svg" alt="GeLearn" className="h-9 w-auto" />
        </Link>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-live="polite"
          className="mt-8 w-full max-w-md rounded-2xl border border-border bg-white px-6 py-8 text-center shadow-sm sm:px-8"
        >
          {failed ? (
            <Outcome icon={<ErrorOutlineOutlinedIcon sx={{ fontSize: 26 }} />} tone="error" title="This link can't be used">
              <p>
                It may have expired (confirmation links work for {LINK_DAYS} days), or a newer link was sent for the same
                address — only the latest one works.
              </p>
              <p>
                {user
                  ? 'Send a fresh link from Settings → Work email, or with “Resend link” on your dashboard.'
                  : 'Log in to GeLearn and send a fresh link from your account.'}
              </p>
              <Button variant="primary" size="lg" className="mt-2 w-full justify-center"
                onClick={() => navigate(user ? '/account?tab=settings' : '/login', { replace: true })}>
                {user ? 'Go to Settings' : 'Go to Log In'}
              </Button>
            </Outcome>
          ) : !result ? (
            <Outcome icon={<AutorenewIcon sx={{ fontSize: 26 }} className="animate-spin" />} tone="neutral" title="Confirming the email…">
              <p>This takes a moment.</p>
            </Outcome>
          ) : (
            <Outcome
              icon={<MarkEmailReadOutlinedIcon sx={{ fontSize: 26 }} />}
              tone="success"
              title={result.already_confirmed ? 'Already confirmed' : result.kind === 'work' ? 'Work email confirmed' : 'Email confirmed'}
            >
              <p>
                <b className="font-semibold wrap-break-word text-text-primary">{result.email}</b>{' '}
                {result.already_confirmed ? 'was already confirmed' : 'is now confirmed'} as{' '}
                {mine ? 'your' : <><b className="font-semibold text-text-primary">{result.account.display_name}</b>&apos;s</>}{' '}
                {result.kind === 'work' ? 'work email' : 'sign-in email'} on GeLearn.
                {result.already_confirmed && ' This link has been used, so there’s nothing more to do.'}
              </p>
              {result.verified_company && (
                <p className="flex items-center justify-center gap-1.5 rounded-lg bg-brand-tint px-3 py-2.5 text-text-primary">
                  <VerifiedIcon sx={{ fontSize: 18 }} className="text-primary" />
                  <span>
                    {mine ? 'You' : 'They'} {result.already_confirmed ? '' : 'now '}show as a verified{' '}
                    <b className="font-semibold">{result.verified_company}</b> expert.
                  </span>
                </p>
              )}
              <Button variant="primary" size="lg" className="mt-2 w-full justify-center"
                onClick={() => navigate(user ? '/' : result.kind === 'sign_in' ? '/login' : '/', { replace: true })}>
                {user ? 'Start Learning' : result.kind === 'sign_in' ? 'Log in' : 'Visit GeLearn'}
              </Button>
            </Outcome>
          )}
        </motion.section>

        <p className="mt-6 text-xs text-text-muted">
          Questions? <a href="mailto:info@genextechnocrats.com" className="font-semibold text-sky-700 hover:text-sky-800">info@genextechnocrats.com</a>
        </p>
      </main>
    </>
  )
}

const TONES = {
  success: 'bg-secondary/10 text-secondary',
  error: 'bg-red-50 text-red-500',
  neutral: 'bg-primary/10 text-primary',
}

function Outcome({ icon, tone, title, children }: { icon: ReactNode; tone: keyof typeof TONES; title: string; children: ReactNode }) {
  return (
    <>
      <span className={`mb-4 inline-flex size-14 items-center justify-center rounded-full ${TONES[tone]}`}>{icon}</span>
      <h1 className="mb-3 text-2xl font-extrabold text-text-primary">{title}</h1>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-text-muted">{children}</div>
    </>
  )
}
