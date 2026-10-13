import { apiFetch } from '@/lib/api/client'

/**
 * Which items the signed-in user has saved, as "model:id" keys, shared by every
 * Save button on the page: one request per user per visit instead of one per
 * button. Saving, unsaving and removals on the dashboard update it in place.
 */
let ownerId: number | null = null
let keys = new Set<string>()
let request: Promise<void> | null = null
const listeners = new Set<() => void>()

const notify = () => listeners.forEach(fn => fn())

export const savedKey = (contentType: string, objectId: number) => `${contentType}:${objectId}`

export function loadSavedKeys(userId: number) {
  if (ownerId !== userId) {  // first load, or a different account signed in
    ownerId = userId
    keys = new Set()
    request = null
  }
  request ??= apiFetch<{ keys: string[] }>('/api/engagement/saved-items/keys/')
    .then(data => { if (ownerId === userId) { keys = new Set(data.keys); notify() } })
    .catch(() => { request = null })  // try again on the next Save button
  return request
}

export function setSaved(key: string, saved: boolean) {
  keys = new Set(keys)
  if (saved) keys.add(key)
  else keys.delete(key)
  notify()
}

export function isSaved(key: string) {
  return keys.has(key)
}

export function subscribeSaved(fn: () => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
