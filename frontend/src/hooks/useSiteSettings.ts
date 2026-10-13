import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'

/** Wagtail → Settings → Site Settings (backend pages.api.SiteSettingsView). Empty strings mean "not set — hide it". */
export interface SiteSettingsData {
  phone: string
  whatsapp: string
  email: string
  office_hours: string
  social: { linkedin: string; twitter: string; youtube: string }
  cta: { label: string; href: string }
}

// One request per page load, shared by the header, footer and pages that show contact details.
let cached: Promise<SiteSettingsData | null> | null = null

function loadSiteSettings() {
  cached ??= apiFetch<SiteSettingsData>('/api/snippets/site-settings/').catch(() => {
    cached = null  // let the next mount try again
    return null
  })
  return cached
}

/** null until loaded (or if the request fails) — callers fall back or hide the detail. */
export function useSiteSettings(): SiteSettingsData | null {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null)
  useEffect(() => {
    let cancelled = false
    void loadSiteSettings().then(s => { if (!cancelled) setSettings(s) })
    return () => { cancelled = true }
  }, [])
  return settings
}

/** "+91 141 400 0000" → "tel:+911414000000" */
export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
