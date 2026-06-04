'use client'

import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react'
import { apiClient } from '@/lib/api'
import type { AuthState, User } from '@/types'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { firstName: string; lastName: string; email: string; password: string }

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const token = localStorage.getItem('kc_token')
    const userStr = localStorage.getItem('kc_user')
    if (token && userStr) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user: JSON.parse(userStr) } })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await apiClient.post<{ token: string; email: string; firstName: string; lastName: string; role: string }>(
      '/api/auth/login', payload
    )
    const { token, ...rest } = res.data
    const user: User = { id: 0, ...rest, role: rest.role as User['role'] }
    localStorage.setItem('kc_token', token)
    localStorage.setItem('kc_user', JSON.stringify(user))
    document.cookie = `kc_token=${token}; path=/; max-age=86400; SameSite=Lax`
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiClient.post<{ token: string; email: string; firstName: string; lastName: string; role: string }>(
      '/api/auth/register', payload
    )
    const { token, ...rest } = res.data
    const user: User = { id: 0, ...rest, role: rest.role as User['role'] }
    localStorage.setItem('kc_token', token)
    localStorage.setItem('kc_user', JSON.stringify(user))
    document.cookie = `kc_token=${token}; path=/; max-age=86400; SameSite=Lax`
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('kc_token')
    localStorage.removeItem('kc_user')
    document.cookie = 'kc_token=; path=/; max-age=0'
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
