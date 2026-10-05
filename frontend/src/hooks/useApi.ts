import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'

interface ApiState<T> {
  data: T | null
  /** True until the response for the current `path` arrives. */
  loading: boolean
  /** True when the current `path` failed (e.g. 404 for an unknown slug). */
  failed: boolean
}

/**
 * GETs `path` and re-fetches when it changes. State is keyed by path, so a
 * stale response is never shown for a new path. Pass null to skip.
 */
export function useApi<T>(path: string | null): ApiState<T> {
  const [state, setState] = useState<{ path: string | null; data: T | null; failed: boolean }>({ path: null, data: null, failed: false })

  useEffect(() => {
    if (path === null) return
    let cancelled = false
    apiFetch<T>(path)
      .then(data => { if (!cancelled) setState({ path, data, failed: false }) })
      .catch(() => { if (!cancelled) setState({ path, data: null, failed: true }) })
    return () => { cancelled = true }
  }, [path])

  const current = state.path === path
  return { data: current ? state.data : null, loading: path !== null && !current, failed: current && state.failed }
}
