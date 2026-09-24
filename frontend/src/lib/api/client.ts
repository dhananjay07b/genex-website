const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/** Thrown by `apiFetch` on a non-2xx response — `message` is the backend's own error text when it can be read, not a generic label. */
export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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
    try {
      message = extractErrorMessage(await res.clone().json()) ?? message
    } catch {
      // Response wasn't JSON (or already consumed) — keep the generic message.
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function apiFetch<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, options)
}
