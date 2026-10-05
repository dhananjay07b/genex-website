import { useEffect } from 'react'
import { apiFetch } from '@/lib/api/client'
import type { DiscoveryType } from '@/types/discovery'

/**
 * Records that this course or piece of content was opened. Feeds "Trending
 * this week" for everyone and "Recently viewed" for signed-in learners.
 * Fire-and-forget: failures never affect the page.
 */
export function useTrackView(type: DiscoveryType, id: number | null | undefined) {
  useEffect(() => {
    if (!id) return
    apiFetch('/api/discovery/views/', { method: 'POST', body: { type, id } }).catch(() => {})
  }, [type, id])
}
