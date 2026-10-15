import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, ApiError } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import { cn } from '@/lib/utils'
import { GoogleProfileDialog, type GoogleProfile, type GoogleProfilePrefill } from './GoogleProfileDialog'

/** The part of Google Identity Services this button uses: the sign-in popup that returns a one-time code. */
interface GoogleCodeResponse { code?: string; error?: string }
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode: 'popup'
            callback: (response: GoogleCodeResponse) => void
            error_callback?: (error: { type: string }) => void
          }) => { requestCode: () => void }
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined
const GOOGLE_SCRIPT = 'https://accounts.google.com/gsi/client'

// Google's script, loaded once per page however many buttons there are.
let scriptLoad: Promise<void> | null = null
function loadGoogleScript() {
  scriptLoad ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => { scriptLoad = null; reject(new Error('Google script failed to load')) }
    document.head.appendChild(script)
  })
  return scriptLoad
}

/** POST /api/accounts/google/ (backend accounts.views.GoogleLoginView). */
type GoogleResult =
  | { status: 'signed_in'; created: boolean }
  | { status: 'needs_profile'; email: string; name: string; signup_token: string }

interface GoogleLoginButtonProps {
  /** Where to land once signed in (the page that sent the visitor to log in). */
  redirectTo?: string
  /** On the sign-up form: what's already chosen there, so the profile step starts from it. */
  prefill?: () => GoogleProfilePrefill
  /** "Sign in with Google" or "Sign up with Google". */
  text?: 'signin_with' | 'signup_with'
}

const BUTTON_CLASS =
  'h-11 w-full max-w-xs mx-auto rounded-md border border-border bg-white flex items-center justify-center gap-2 text-sm font-semibold text-text-primary select-none hover:border-primary hover:shadow-lg transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-wait disabled:opacity-70'

/**
 * Our own "Sign in with Google" button (Google's rendered button swaps itself for
 * a personalised "Sign in as …" layout we can't turn off). Clicking opens Google's
 * sign-in popup, which returns a one-time code; the backend exchanges it for the
 * verified identity. A new person then finishes in GoogleProfileDialog.
 */
export function GoogleLoginButton({ redirectTo = '/account', prefill, text = 'signin_with' }: GoogleLoginButtonProps) {
  const { refetch } = useAuth()
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  // A new Google user, while they finish the profile step. signupToken: the server's
  // signed ticket for finishing the sign-up (Google's own token can only be checked once).
  const [pending, setPending] = useState<{ signupToken: string; email: string; name: string; prefill?: GoogleProfilePrefill } | null>(null)

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGoogleScript()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(() => { if (!cancelled) setError("Couldn't reach Google. Check your connection and reload the page.") })
    return () => { cancelled = true }
  }, [])

  async function send(body: { code: string } | ({ signup_token: string } & GoogleProfile)) {
    const result = await apiFetch<GoogleResult>('/api/accounts/google/', { method: 'POST', body })
    if (result.status === 'needs_profile') {
      setPending({ signupToken: result.signup_token, email: result.email, name: result.name, prefill: prefill?.() })
      return
    }
    setPending(null)
    await refetch()
    navigate(redirectTo, { replace: true })
  }

  // Google answers long after the click; keep its callbacks pointed at the latest props.
  const onCode = useRef<(response: GoogleCodeResponse) => void>(() => {})
  useEffect(() => {
    onCode.current = response => {
      if (!response.code) {
        if (response.error !== 'access_denied') setError("Google sign-in didn't complete. Please try again.")
        return
      }
      setBusy(true)
      send({ code: response.code })
        .catch(err => setError(err instanceof ApiError ? err.message : "Couldn't sign in with Google. Please try again."))
        .finally(() => setBusy(false))
    }
  })

  function start() {
    if (!window.google) return
    setError('')
    // Opened straight from the click, so browsers don't block the popup.
    window.google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID!,
      scope: 'openid email profile',
      ux_mode: 'popup',
      callback: response => onCode.current(response),
      error_callback: err => {
        if (err.type !== 'popup_closed') setError("Google's sign-in window couldn't open. Allow pop-ups for this site and try again.")
      },
    }).requestCode()
  }

  const label = text === 'signup_with' ? 'Sign up with Google' : 'Sign in with Google'

  if (!GOOGLE_CLIENT_ID) {
    // No VITE_GOOGLE_OAUTH_CLIENT_ID set. Stay silent in production (a real deploy
    // always has it), but show a disabled placeholder in dev so it's obvious *why*.
    if (!import.meta.env.DEV) return null
    return (
      <div title="Set VITE_GOOGLE_OAUTH_CLIENT_ID in frontend/.env to enable this" className={cn(BUTTON_CLASS, 'cursor-not-allowed')}>
        <GoogleGlyph />
        Google Sign-In not configured
      </div>
    )
  }

  return (
    <div>
      <button type="button" onClick={start} disabled={!ready || busy} className={BUTTON_CLASS}>
        <GoogleGlyph />
        {busy ? 'Signing in…' : label}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-sm text-red-600">{error}</p>}
      {pending && (
        <GoogleProfileDialog
          email={pending.email}
          name={pending.name}
          prefill={pending.prefill}
          onSubmit={profile => send({ signup_token: pending.signupToken, ...profile })}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}

export function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.3C29.3 35.4 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.6-2.7 4.8-5 6.3l6.2 5.3C39.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  )
}
