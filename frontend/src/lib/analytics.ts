/**
 * Google Analytics (GA4), loaded only after the visitor allows it in the cookie
 * banner (lib/consent.ts). Production builds only, so local development doesn't
 * add test visits to the real statistics.
 */
const GA_ID = 'G-LVZQ71PDCP'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let loaded = false

export function startAnalytics() {
  if (!import.meta.env.PROD) return
  // Allowed again after declining in the same visit: the script is already there.
  delete (window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`]
  if (loaded) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // Google's loader expects the `arguments` object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

/** The visitor withdrew consent: stop sending and delete Google's cookies. */
export function stopAnalytics() {
  ;(window as unknown as Record<string, unknown>)[`ga-disable-${GA_ID}`] = true

  const host = window.location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const name of document.cookie.split('; ').map(c => c.split('=')[0])) {
    if (!/^_ga(_|$)|^_gid$|^_gat/.test(name)) continue
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${domain ? `; Domain=${domain}` : ''}`
    }
  }
}
