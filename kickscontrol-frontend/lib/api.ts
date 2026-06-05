import type { ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// Auth paths that must NOT trigger auto-refresh/logout on 401
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']

// Singleton promise to prevent concurrent refresh calls
let refreshPromise: Promise<string | null> | null = null

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('kc_token')
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('kc_refresh_token')
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('kc_token', accessToken)
  localStorage.setItem('kc_refresh_token', refreshToken)
  document.cookie = `kc_token=${accessToken}; path=/; max-age=3600; SameSite=Lax`
}

function clearAuth() {
  localStorage.removeItem('kc_token')
  localStorage.removeItem('kc_refresh_token')
  localStorage.removeItem('kc_user')
  document.cookie = 'kc_token=; path=/; max-age=0'
  window.dispatchEvent(new Event('kc:session-expired'))
}

async function tryRefresh(): Promise<string | null> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return null

      const json = await res.json()
      const data = json.data
      if (!data?.token || !data?.refreshToken) return null

      storeTokens(data.token, data.refreshToken)
      return data.token as string
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<ApiResponse<T>> {
  const token = getToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  const contentType = res.headers.get('content-type') ?? ''
  const hasBody = contentType.includes('application/json') && res.status !== 204

  const json: ApiResponse<T> = hasBody
    ? await res.json()
    : ({ success: res.ok, message: null, data: null as T, timestamp: '' } as ApiResponse<T>)

  if (res.status === 401 && !AUTH_PATHS.includes(path)) {
    if (!isRetry) {
      // Try to get a new access token using the refresh token
      const newToken = await tryRefresh()
      if (newToken) {
        // Retry the original request with the fresh token
        return request<T>(path, options, true)
      }
    }
    // Refresh failed or was a retry — force logout
    clearAuth()
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?returnTo=${returnTo}`
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
  }

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`)
  }

  return json
}

export const apiClient = {
  get:    <T>(path: string) =>
    request<T>(path),
  post:   <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
