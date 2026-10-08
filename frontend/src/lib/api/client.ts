export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Thrown by `apiFetch` on a non-2xx response — `message` is the backend's own error text when it can be read, not a generic label.
 * `fields` maps each field name to its first error message (DRF validation errors), for inline form errors.
 */
export class ApiError extends Error {
  status: number
  fields: Record<string, string>
  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fields = fields
  }
}

function extractFieldErrors(body: unknown): Record<string, string> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {}
  const fields: Record<string, string> = {}
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (Array.isArray(value) && typeof value[0] === 'string') fields[key] = value[0]
    else if (typeof value === 'string') fields[key] = value
  }
  return fields
}

function extractErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  if (typeof record.detail === 'string') return record.detail
  for (const value of Object.values(record)) {
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
    if (typeof value === 'string') return value
  }
  return null
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: { 'X-CSRFToken': getCookie('csrftoken') ?? '' },
    })
      .then(res => res.ok)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

async function request<T>(path: string, options: ApiOptions = {}, isRetry = false): Promise<T> {
  const method = options.method ?? 'GET'
  const isMutation = method !== 'GET'
  const isFormData = options.body instanceof FormData

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    credentials: 'include',
    // Every call here hits a dynamic, per-user, often auth-sensitive
    // endpoint — never let the browser's HTTP cache serve a stale response
    // (this is what let a cleared-cookie logout still "look" logged in
    // after a refresh, before this was added).
    cache: 'no-store',
    headers: {
      // Omitted for FormData — the browser sets multipart/form-data with the
      // correct boundary itself; a manual Content-Type here breaks the upload.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(isMutation ? { 'X-CSRFToken': getCookie('csrftoken') ?? '' } : {}),
      ...options.headers,
    },
    body: isFormData ? (options.body as FormData) : options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshSession()
    if (refreshed) return request<T>(path, options, true)
  }

  if (!res.ok) {
    let message = `API error ${res.status}: ${path}`
    let fields: Record<string, string> = {}
    try {
      const body: unknown = await res.clone().json()
      message = extractErrorMessage(body) ?? message
      fields = extractFieldErrors(body)
    } catch {
      // Response wasn't JSON (or already consumed) — keep the generic message.
    }
    throw new ApiError(res.status, message, fields)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function apiFetch<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, options)
}

/**
 * Downloads a file the API serves to a signed-in user (e.g. a certificate PDF) and saves
 * it as `filename`. Renews an expired session first, like apiFetch.
 */
export async function apiDownload(path: string, filename: string, isRetry = false): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', cache: 'no-store' })
  if (res.status === 401 && !isRetry && (await refreshSession())) return apiDownload(path, filename, true)
  if (!res.ok) throw new ApiError(res.status, `Download failed (${res.status})`)
  const url = URL.createObjectURL(await res.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
