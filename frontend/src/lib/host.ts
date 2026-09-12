/**
 * GeLearn is served from its own subdomain (gelearn.genextechnocrats.com) but
 * shares this same codebase and build — which "app shell" renders is decided
 * at runtime by hostname, not by a separate deploy.
 */

const FORCE_GELEARN_HOST = import.meta.env.VITE_FORCE_GELEARN_HOST === 'true'

export const GELEARN_URL = import.meta.env.VITE_GELEARN_URL ?? 'https://gelearn.genextechnocrats.com'
export const MARKETING_URL = import.meta.env.VITE_MARKETING_URL ?? 'https://genextechnocrats.com'

export function isGeLearnHost(): boolean {
  if (FORCE_GELEARN_HOST) return true
  return window.location.hostname.startsWith('gelearn.')
}
