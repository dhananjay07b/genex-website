import { useEffect, useState } from 'react'
import { navConfig as staticNavConfig } from '@/config/navigation'
import { apiFetch } from '@/lib/api/client'
import { gelearnPath } from '@/lib/host'
import type { NavConfig, NavItem } from '@/types/navigation'
import { useSiteSettings } from './useSiteSettings'

/** One menu entry from GET /api/snippets/nav/ (backend pages.api.NavView). */
interface ApiNavItem {
  label: string
  href?: string
  children?: { label: string; href: string }[]
  /** "gelearn": the links open the GeLearn site, whose address differs in dev and production. */
  site?: 'gelearn'
}

/**
 * GeLearn's links are the only ones that leave this site. GeLearn is planned to
 * move to a separate project; when it does, only this mapping (and the backend's
 * GeLearn branch) needs to change.
 */
function toNavItem(item: ApiNavItem): NavItem {
  const link = (href: string) => (item.site === 'gelearn' ? gelearnPath(href) : href)
  if (item.children?.length) {
    return {
      label: item.label,
      dropdown: { sections: [{ items: item.children.map(child => ({ label: child.label, href: link(child.href) })) }] },
    }
  }
  return { label: item.label, href: link(item.href ?? '/') }
}

// One request per page load, shared by every header on the page.
let cached: Promise<NavItem[]> | null = null

function loadNavItems() {
  cached ??= apiFetch<{ items: ApiNavItem[] }>('/api/snippets/nav/')
    .then(res => res.items.map(toNavItem))
    .catch(() => {
      cached = null  // let the next mount try again
      return []
    })
  return cached
}

/**
 * The whole top-level navigation, built by the backend from the Wagtail page
 * tree in a single request: adding a page and ticking "Show in menus" makes it
 * appear here, no code change needed. Falls back to the static shell in
 * config/navigation.ts only if the request fails or returns nothing.
 */
export function useNavConfig(): NavConfig {
  const [config, setConfig] = useState<NavConfig>(staticNavConfig)

  useEffect(() => {
    let cancelled = false
    void loadNavItems().then(items => {
      if (!cancelled && items.length) setConfig(prev => ({ ...prev, items }))
    })
    return () => { cancelled = true }
  }, [])

  // The header button and contact details are edited in Wagtail → Settings → Site Settings.
  const site = useSiteSettings()
  return site ? { ...config, cta: site.cta, contact: { phone: site.phone, whatsapp: site.whatsapp } } : config
}
