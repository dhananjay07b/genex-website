import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, ApiError } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'
import { GoogleProfileDialog, type GoogleProfile, type GoogleProfilePrefill } from './GoogleProfileDialog'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; width?: number; text?: string }) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined

/** POST /api/accounts/google/ (backend accounts.views.GoogleLoginView). */
type GoogleResult =
  | { status: 'signed_in'; created: boolean }
  | { status: 'needs_profile'; email: string; name: string; signup_token: string }

interface GoogleLoginButtonProps {
  /** Where to land once signed in (the page that sent the visitor to log in). */
  redirectTo?: string
  /** On the sign-up form: what's already chosen there, so the profile step starts from it. */
  prefill?: () => GoogleProfilePrefill
  /** Google's button wording: "Sign in with Google" or "Sign up with Google". */
  text?: 'signin_with' | 'signup_with'
}

export function GoogleLoginButton({ redirectTo = '/account', prefill, text = 'signin_with' }: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { refetch } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  // A new Google user: their verified token and details, while they finish the profile step.
  // signupToken: the server's signed ticket for finishing the sign-up (Google's own token can only be checked once).
  const [pending, setPending] = useState<{ signupToken: string; email: string; name: string; prefill?: GoogleProfilePrefill } | null>(null)

  async function send(body: { id_token: string } | ({ signup_token: string } & GoogleProfile)) {
    const result = await apiFetch<GoogleResult>('/api/accounts/google/', { method: 'POST', body })
    if (result.status === 'needs_profile') {
      setPending({ signupToken: result.signup_token, email: result.email, name: result.name, prefill: prefill?.() })
      return
    }
    setPending(null)
    await refetch()
    navigate(redirectTo, { replace: true })
  }

  // Google calls back long after render; keep it pointed at the latest props.
  const onCredential = useRef<(credential: string) => void>(() => {})
  useEffect(() => {
    onCredential.current = credential => {
      setError('')
      send({ id_token: credential }).catch(err => setError(err instanceof ApiError ? err.message : "Couldn't sign in with Google. Please try again."))
    }
  })

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return

    function render() {
      if (!window.google || !containerRef.current) return
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID!, callback: resp => onCredential.current(resp.credential) })
      window.google.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large', width: 320, text })
    }

    if (window.google) {
      render()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = render
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [text])

  if (!GOOGLE_CLIENT_ID) {
    // No VITE_GOOGLE_OAUTH_CLIENT_ID set — Google's script can't render a real
    // button without one. Stay silent in production (a real deploy should
    // always have this configured), but show a disabled placeholder in dev
    // so it's obvious *why* the button is missing instead of just vanishing.
    if (!import.meta.env.DEV) return null
    return (
      <div
        title="Set VITE_GOOGLE_OAUTH_CLIENT_ID in frontend/.env to enable this"
        className="h-11 w-full max-w-xs mx-auto rounded-md border border-border bg-white flex items-center justify-center gap-2 text-sm font-semibold text-text-primary cursor-pointer select-none hover:border-primary hover:shadow-lg transition-colors duration-300"
      >
        <GoogleGlyph />
        Google Sign-In not configured
      </div>
    )
  }

  return (
    <div>
      <div ref={containerRef} className="flex justify-center" />
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
