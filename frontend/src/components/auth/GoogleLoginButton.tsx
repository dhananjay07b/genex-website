import { useEffect, useRef } from 'react'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void
          renderButton: (parent: HTMLElement, options: { theme: string; size: string; width?: number }) => void
        }
      }
    }
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined

export function GoogleLoginButton() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { refetch } = useAuth()

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !containerRef.current) return

    async function handleCredential(response: { credential: string }) {
      await apiFetch('/api/accounts/google/', { method: 'POST', body: { id_token: response.credential } })
      await refetch()
      window.location.href = '/account'
    }

    function render() {
      if (!window.google || !containerRef.current) return
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID!, callback: handleCredential })
      window.google.accounts.id.renderButton(containerRef.current, { theme: 'outline', size: 'large', width: 320 })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 w-full">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-semibold text-text-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div ref={containerRef} />
    </div>
  )
}
