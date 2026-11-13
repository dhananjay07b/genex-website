/** Google's sign-in popup (Google Identity Services), shared by the sign-in button and Settings → Connect Google. */
import { useEffect, useState } from 'react'

/** The part of Google Identity Services used here: the sign-in popup that returns a one-time code. */
export interface GoogleCodeResponse { code?: string; error?: string }
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

/** Whether this build has a Google client ID (VITE_GOOGLE_OAUTH_CLIENT_ID). */
export const GOOGLE_CONFIGURED = Boolean(GOOGLE_CLIENT_ID)

/** True once Google's script has loaded; `onError` gets a message when Google can't be reached. */
export function useGoogleReady(onError: (message: string) => void) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false
    loadGoogleScript()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(() => { if (!cancelled) onError("Couldn't reach Google. Check your connection and reload the page.") })
    return () => { cancelled = true }
  }, [onError])
  return ready
}

/**
 * Opens Google's sign-in popup; call it straight from a click, so browsers don't
 * block the popup. `onResponse` gets the one-time code (or Google's refusal);
 * `onError` a message when the popup couldn't open.
 */
export function requestGoogleCode(onResponse: (response: GoogleCodeResponse) => void, onError: (message: string) => void) {
  window.google?.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID!,
    scope: 'openid email profile',
    ux_mode: 'popup',
    callback: onResponse,
    error_callback: err => {
      if (err.type !== 'popup_closed') onError("Google's sign-in window couldn't open. Allow pop-ups for this site and try again.")
    },
  }).requestCode()
}
