const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

let refreshPromise: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      credentials: 'include',
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

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(isMutation ? { 'X-CSRFToken': getCookie('csrftoken') ?? '' } : {}),
      ...options.headers,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshSession()
    if (refreshed) return request<T>(path, options, true)
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function apiFetch<T>(path: string, options?: ApiOptions): Promise<T> {
  return request<T>(path, options)
}
