'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Completa todos los campos.'); return }
    setLoading(true)
    try {
      await login({ email, password })
      router.push(returnTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-black tracking-tight text-neutral-900">
            kicks<span className="text-orange-500">control</span>
          </span>
          <p className="text-neutral-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-xl py-2.5 transition-colors">
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-orange-500 font-semibold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
