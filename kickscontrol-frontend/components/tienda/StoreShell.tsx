'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Wordmark } from '@/components/brand/Wordmark'
import { LockClosedIcon } from '@heroicons/react/24/outline'

export const STORE_NAV = [
  { href: '/tienda', label: 'Inicio', staff: false },
  { href: '/tienda/catalogo', label: 'Catálogo', staff: false },
  { href: '/tienda/caja', label: 'Caja', staff: true },
  { href: '/tienda/inventario', label: 'Inventario', staff: true },
]

const STAFF_ROLES = ['ADMIN', 'SHIFT_LEADER']

export function useIsStaff() {
  const { user } = useAuth()
  return !!user && STAFF_ROLES.includes(user.role)
}

/** Store mode: the screen the shop's own devices open on. Catalog is open; till and stock ask for a staff sign-in. */
export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const isStaff = useIsStaff()
  const now = useClock()

  function signOut() {
    logout()
    router.push('/tienda')
  }

  return (
    <div className="sheet flex h-dvh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 bg-ink px-4 text-paper sm:gap-4 sm:px-6">
        <Link href="/tienda" className="flex shrink-0 items-baseline gap-2" aria-label="KicksControl, tienda">
          <span className="hidden md:inline"><Wordmark className="text-base" /></span>
          <span className="type-label text-paper/60">Tienda</span>
        </Link>
        <nav aria-label="Tienda" className="flex h-full min-w-0 flex-1 items-stretch overflow-x-auto">
          {STORE_NAV.map(item => {
            const active = item.href === '/tienda' ? pathname === '/tienda' : pathname.startsWith(item.href)
            const locked = item.staff && !isStaff
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-1.5 px-4 text-sm font-semibold ${active ? 'bg-paper text-ink' : 'text-paper/80 hover:bg-paper/10 hover:text-paper'}`}
              >
                {item.label}
                {locked && <LockClosedIcon className="size-3.5 opacity-60" aria-label="requiere iniciar sesión" />}
              </Link>
            )
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-4">
          {now && <span className="type-label hidden tabular-nums text-paper/70 xl:inline">{now}</span>}
          <Link href="/" className="shrink-0 text-sm text-paper/80 hover:text-paper">Tienda online</Link>
          {isStaff && <Link href="/backoffice" className="type-label hidden text-paper/70 hover:text-paper lg:inline">Backoffice</Link>}
          {user ? (
            <>
              <span className="hidden text-sm xl:inline">{user.firstName}</span>
              <button onClick={signOut} className="type-label text-paper/70 hover:text-paper">Salir</button>
            </>
          ) : (
            <Link href={`/login?returnTo=${encodeURIComponent(pathname)}`} className="type-label text-paper/70 hover:text-paper">Personal</Link>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

/** The till and the stockroom are for staff; a customer account signed in on the device sees why not. */
export function StaffOnly({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth()
  const isStaff = useIsStaff()
  if (isLoading) return null
  if (isStaff) return <>{children}</>
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="type-label text-ink-soft">Solo personal</p>
      <h1 className="type-name text-3xl">Esta pantalla es para el equipo de la tienda</h1>
      <p className="max-w-sm text-sm text-ink-soft">Entra con una cuenta de Shift Leader o Admin.</p>
      <Link href="/tienda" className="mt-2 text-sm font-semibold underline">Volver al inicio de la tienda</Link>
    </div>
  )
}

/** "mié, 28 oct · 09:41", refreshed every 30 s. Null on the server so the markup matches. */
function useClock() {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow(`${d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])
  return now
}
