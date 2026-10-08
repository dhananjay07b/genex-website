import { useState } from 'react'
import { apiFetch } from '@/lib/api/client'
import { useAuth } from '@/context/useAuth'

/** Settings: the learner's choice to list their certificates on their public profile (off by default; saves at once). */
export function CertificatePrivacy() {
  const { user, refetch } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  if (!user) return null

  async function toggle(show: boolean) {
    setSaving(true)
    setError('')
    try {
      await apiFetch('/api/accounts/me/', { method: 'PATCH', body: { show_certificates: show } })
      await refetch()
    } catch {
      setError("Couldn't save this setting. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="border border-border rounded-2xl p-5">
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={user.show_certificates} disabled={saving} onChange={e => toggle(e.target.checked)}
          className="mt-0.5 size-4 accent-primary" />
        <span>
          <span className="block text-sm font-bold text-text-primary">Show my certificates on my public profile</span>
          <span className="block text-xs text-text-muted leading-relaxed mt-1">
            Anyone who opens your profile sees the GeLearn courses you&apos;ve completed, each linking to its certificate.
            Your certificate links work either way.
          </span>
        </span>
      </label>
      {error && <p role="alert" className="text-xs font-semibold text-red-600 mt-3">{error}</p>}
    </section>
  )
}
