import { useSyncExternalStore } from 'react'
import { startAnalytics, stopAnalytics } from '@/lib/analytics'

/**
 * The visitor's answer to the cookie banner: analytics allowed or not. Nothing
 * that tracks visitors runs until they allow it (India's DPDP Act).
 *
 * Kept in a cookie on .genextechnocrats.com so one answer covers both the
 * marketing site and GeLearn, for a year. Raise CONSENT_VERSION to ask everyone
 * again, e.g. after adding another tracking tool.
 */
export type Consent = 'granted' | 'denied'

const COOKIE = 'genex_consent'
const CONSENT_VERSION = '1'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365
const SHARED_DOMAIN = 'genextechnocrats.com'

/** ".genextechnocrats.com" on the real sites; none on localhost or a preview host. */
export function sharedCookieDomain(): string | null {
  const host = window.location.hostname
  return host === SHARED_DOMAIN || host.endsWith(`.${SHARED_DOMAIN}`) ? `.${SHARED_DOMAIN}` : null
}

function readCookie(): Consent | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  if (!match) return null
  const [version, value] = decodeURIComponent(match[1]).split(':')
  return version === CONSENT_VERSION && (value === 'granted' || value === 'denied') ? value : null
}

function writeCookie(value: Consent) {
  const domain = sharedCookieDomain()
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE}=${CONSENT_VERSION}:${value}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}${domain ? `; Domain=${domain}` : ''}`
}

interface ConsentState {
  consent: Consent | null
  /** The banner was reopened from "Cookie settings" to change an earlier answer. */
  reopened: boolean
}

let state: ConsentState = { consent: readCookie(), reopened: false }
const listeners = new Set<() => void>()

function update(next: Partial<ConsentState>) {
  state = { ...state, ...next }
  listeners.forEach(listener => listener())
}

/** Runs analytics if the visitor already allowed it on an earlier visit. Call once at start-up. */
export function applyStoredConsent() {
  if (state.consent === 'granted') startAnalytics()
}

export function setConsent(value: Consent) {
  const wasGranted = state.consent === 'granted'
  writeCookie(value)
  update({ consent: value, reopened: false })
  if (value === 'granted') startAnalytics()
  else if (wasGranted) stopAnalytics()
}

/** "Cookie settings" in the footers: show the banner again to change the answer. */
export function reopenConsent() {
  update({ reopened: true })
}

export function useConsent(): ConsentState {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => state,
  )
}
