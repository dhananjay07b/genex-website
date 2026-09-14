/**
 * GeLearn is served from its own subdomain (gelearn.genextechnocrats.com) but
 * shares this same codebase and build — which "app shell" renders is decided
 * at runtime by hostname, not by a separate deploy.
 *
 * Local dev has no real subdomain to visit, so this also supports flipping
 * shells in the same browser tab via a URL query param — see isGeLearnHost().
 * Visit `/?shell=gelearn` or `/?shell=marketing`; the choice persists in
 * localStorage until you switch again.
 */

const DEV_SHELL_KEY = 'genex-dev-shell'

const EXPLICIT_GELEARN_URL = import.meta.env.VITE_GELEARN_URL as string | undefined
const EXPLICIT_MARKETING_URL = import.meta.env.VITE_MARKETING_URL as string | undefined

const PROD_GELEARN_BASE = EXPLICIT_GELEARN_URL ?? 'https://gelearn.genextechnocrats.com'
const PROD_MARKETING_BASE = EXPLICIT_MARKETING_URL ?? 'https://genextechnocrats.com'

/** Full GeLearn base URL — real subdomain in production, dev toggle in local dev. */
export const GELEARN_URL = import.meta.env.DEV && !EXPLICIT_GELEARN_URL
  ? `${window.location.origin}/?shell=gelearn`
  : PROD_GELEARN_BASE

/** Full marketing base URL — real domain in production, dev toggle in local dev. */
export const MARKETING_URL = import.meta.env.DEV && !EXPLICIT_MARKETING_URL
  ? `${window.location.origin}/?shell=marketing`
  : PROD_MARKETING_BASE

/**
 * Builds a link INTO the GeLearn shell at the given path (e.g. "/technology").
 * Always use this — never hand-concatenate GELEARN_URL + path — since in dev
 * the base URL already carries a "?shell=gelearn" query string, and a path
 * appended after that would land inside the query string instead of the URL.
 */
export function gelearnPath(path = '/'): string {
  if (import.meta.env.DEV && !EXPLICIT_GELEARN_URL) {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('shell', 'gelearn')
    return url.toString()
  }
  return `${PROD_GELEARN_BASE}${path === '/' ? '' : path}`
}

/** Same as gelearnPath(), but for links back into the marketing shell. */
export function marketingPath(path = '/'): string {
  if (import.meta.env.DEV && !EXPLICIT_MARKETING_URL) {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('shell', 'marketing')
    return url.toString()
  }
  return `${PROD_MARKETING_BASE}${path === '/' ? '' : path}`
}

/**
 * In dev only: reads `?shell=gelearn` / `?shell=marketing` from the URL once,
 * persists the choice to localStorage (so it survives navigation/refresh
 * within the tab), and reports which shell is currently selected.
 */
function readDevShellOverride(): 'gelearn' | 'marketing' | null {
  if (!import.meta.env.DEV) return null

  const params = new URLSearchParams(window.location.search)
  const requested = params.get('shell')
  if (requested === 'gelearn' || requested === 'marketing') {
    localStorage.setItem(DEV_SHELL_KEY, requested)
    return requested
  }

  const stored = localStorage.getItem(DEV_SHELL_KEY)
  return stored === 'gelearn' || stored === 'marketing' ? stored : null
}

export function isGeLearnHost(): boolean {
  const devOverride = readDevShellOverride()
  if (devOverride) return devOverride === 'gelearn'
  return window.location.hostname.startsWith('gelearn.')
}
