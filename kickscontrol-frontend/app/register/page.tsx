'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Completa todos los campos.')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password })
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sheet min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="type-style text-[2.75rem]">KicksControl</Link>
          <p className="text-ink-soft text-sm mt-1">Crea tu cuenta gratis</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-t border-form p-6 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="type-field">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="Juan"
                className="w-full border border-form-rule px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-form"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="type-field">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="García"
                className="w-full border border-form-rule px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-form"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="type-field">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set('email')}
              placeholder="tu@email.com"
              className="w-full border border-form-rule px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-form"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="type-field">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set('password')}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-form-rule px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-form"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm" className="type-field">
              Confirmar contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repite tu contraseña"
              className="w-full border border-form-rule px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-form"
            />
          </div>

          {error && (
            <p className="text-xs text-alarm bg-transparent px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-form-deep disabled:opacity-60 text-paper font-bold text-sm py-2.5 transition-colors"
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-soft mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-form font-semibold hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
