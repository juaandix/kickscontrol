import type { ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// Auth routes that should NOT trigger auto-logout on 401
const AUTH_PATHS = ['/api/auth/login', '/api/auth/register']

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('kc_token')
}

function clearAuthAndRedirect() {
  localStorage.removeItem('kc_token')
  localStorage.removeItem('kc_user')
  document.cookie = 'kc_token=; path=/; max-age=0'
  // Dispatch event so AuthContext can sync state without a hard reload
  window.dispatchEvent(new Event('kc:session-expired'))
  // Redirect preserving the current path so user can return after login
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/login?returnTo=${returnTo}`
}

async function request<T>(
  path: string,
  options: RequestInit = {}
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

  // 401 from a protected endpoint = token expired or invalidated → auto-logout
  if (res.status === 401 && !AUTH_PATHS.includes(path)) {
    clearAuthAndRedirect()
    throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
  }

  if (!res.ok) {
    throw new Error(json.message ?? `Request failed: ${res.status}`)
  }

  return json
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
