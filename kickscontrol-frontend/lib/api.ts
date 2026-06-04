import type { ApiResponse } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('kc_token')
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
