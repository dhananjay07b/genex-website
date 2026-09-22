import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Local dev has no real subdomain to distinguish the marketing site from
 * GeLearn (see lib/host.ts), so which shell renders is decided by a
 * `?shell=` query param backed by a localStorage fallback. That fallback is
 * a single mutable value shared across the whole tab — it isn't tied to any
 * one history entry, so browser back/forward can restore a URL (e.g.
 * `/register`) after the fallback has since changed (e.g. after visiting
 * `/contact?shell=marketing`), causing the wrong router to mount and a 404.
 *
 * Fix: keep `?shell=` present on every URL in this shell via a replace-only
 * navigation, so every history entry is self-describing and immune to the
 * shared fallback going stale. No-op in production, where isGeLearnHost()
 * reads the real hostname on every request and this ambiguity can't occur.
 */
export function DevShellUrlSync({ shell }: { shell: 'gelearn' | 'marketing' }) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const params = new URLSearchParams(location.search)
    if (params.get('shell') === shell) return
    params.set('shell', shell)
    navigate({ pathname: location.pathname, search: params.toString(), hash: location.hash }, { replace: true })
  }, [location.pathname, location.search, location.hash, shell, navigate])

  return null
}
