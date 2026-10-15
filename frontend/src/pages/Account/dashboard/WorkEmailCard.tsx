import { useEffect, useState, type FormEvent } from 'react'
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { apiFetch, ApiError } from '@/lib/api/client'

/** GET/POST /api/accounts/me/work-email/ (backend accounts.work_email). */
interface WorkEmailState {
  email: string | null
  verified: boolean
  company: { name: string; slug: string } | null
}

/**
 * For a Professional who signed in with a personal address: add a work email on
 * their company's domain and confirm it by link to show as a verified expert.
 * Sign-in keeps using their own email.
 */
export function WorkEmailCard({ signInEmail, companyVerified }: { signInEmail: string; companyVerified: boolean }) {
  const [state, setState] = useState<WorkEmailState | null>(null)
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    apiFetch<WorkEmailState>('/api/accounts/me/work-email/').then(setState).catch(() => setState(null))
  }, [])

  async function send(address: string) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const next = await apiFetch<WorkEmailState>('/api/accounts/me/work-email/', { method: 'POST', body: { email: address } })
      setState(next)
      setEmail('')
      if (!next.verified) setNotice(`Confirmation link sent to ${next.email}. Open it from that inbox to finish.`)
    } catch (err) {
      setError(err instanceof ApiError ? (err.fields.email ?? err.message) : "Couldn't send the link. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await apiFetch('/api/accounts/me/work-email/', { method: 'DELETE' })
      setState({ email: null, verified: false, company: null })
    } catch {
      setError("Couldn't remove it. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (email.trim()) void send(email.trim())
  }

  if (!state) return null
  // Already verified through their sign-in email: nothing to add.
  if (companyVerified && !state.email) return null

  return (
    <section aria-labelledby="work-email-title" className="rounded-xl border border-border bg-surface px-4 py-4">
      <h3 id="work-email-title" className="flex items-center gap-2 text-sm font-bold text-text-primary">
        <MarkEmailReadOutlinedIcon sx={{ fontSize: 18 }} className="text-primary" /> Work email
      </h3>

      {state.email && state.verified ? (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-1.5 text-sm text-text-primary">
            <VerifiedOutlinedIcon sx={{ fontSize: 16 }} className="text-primary" />
            <span><b className="font-semibold">{state.email}</b> confirmed{state.company ? ` — verified ${state.company.name} expert` : ''}.</span>
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={busy}>Remove</Button>
        </div>
      ) : state.email ? (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-sm text-text-muted">
            Waiting for you to confirm <b className="font-semibold text-text-primary">{state.email}</b>
            {state.company ? ` (${state.company.name})` : ''}. Check that inbox for the link.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => send(state.email!)} disabled={busy}>Resend link</Button>
            <Button type="button" variant="ghost" size="sm" onClick={remove} disabled={busy}>Remove</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="mt-2 flex flex-col gap-2">
          <p className="text-xs leading-relaxed text-text-muted">
            You sign in with {signInEmail}. Add your company email to show as a verified expert of your company — we&apos;ll
            send a confirmation link to it. Your sign-in doesn&apos;t change.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                id="work-email"
                type="email"
                aria-label="Work email"
                placeholder="you@yourcompany.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="justify-center" disabled={busy || !email.trim()}>
              {busy ? 'Sending…' : 'Send link'}
            </Button>
          </div>
        </form>
      )}

      {notice && <p role="status" className="mt-2 text-xs font-semibold text-emerald-700">{notice}</p>}
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  )
}
