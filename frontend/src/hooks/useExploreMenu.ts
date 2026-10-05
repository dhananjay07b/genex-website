import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api/client'
import type { ExploreMenuData } from '@/types/discovery'

const EMPTY: ExploreMenuData = { topic_groups: [], roles: [], companies: [] }

// One request per page load, shared by every header render.
let cached: Promise<ExploreMenuData> | null = null

function load() {
  cached ??= apiFetch<ExploreMenuData>('/api/discovery/explore/').catch(() => {
    cached = null
    return EMPTY
  })
  return cached
}

/** Grouped topics, career roles and companies for the header's Explore menu. */
export function useExploreMenu(): ExploreMenuData {
  const [data, setData] = useState<ExploreMenuData>(EMPTY)
  useEffect(() => {
    let cancelled = false
    load().then(next => { if (!cancelled) setData(next) })
    return () => { cancelled = true }
  }, [])
  return data
}
