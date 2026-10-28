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
  // Sent here from the physical store's till or stock: a staff sign-in that leads back to the store
  const fromStore = returnTo.startsWith('/tienda')

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
    <div className="sheet min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={fromStore ? '/tienda' : '/'} className="type-style text-[2.75rem]">KicksControl</Link>
          <p className="text-ink-soft text-sm mt-1">{fromStore ? 'Acceso del personal de tienda' : 'Inicia sesión en tu cuenta'}</p>
        </div>

        <form onSubmit={handleSubmit} className="border-t border-form p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="type-field">Email</label>
            <input id="email" type="email" autoComplete="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="tu@email.com"
              className="w-full border border-form-rule px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-form" />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="type-field">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full border border-form-rule px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-form" />
          </div>

          {error && <p className="text-xs text-alarm bg-transparent px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-ink hover:bg-form-deep disabled:opacity-60 text-paper font-bold text-sm py-2.5 transition-colors">
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>

        {fromStore ? (
          <p className="text-center text-sm mt-4">
            <Link href="/tienda" className="text-ink-soft hover:text-ink">← Volver a la tienda</Link>
          </p>
        ) : (
          <p className="text-center text-sm text-ink-soft mt-4">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-form font-semibold hover:underline">Regístrate</Link>
          </p>
        )}
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
