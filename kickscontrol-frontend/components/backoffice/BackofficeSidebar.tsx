'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Wordmark } from '@/components/brand/Wordmark'
import { ArrowRightEndOnRectangleIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { href: '/backoffice', label: 'Dashboard', code: '01', exact: true },
  { href: '/backoffice/inventory', label: 'Inventario', code: '02', exact: false },
  { href: '/backoffice/orders', label: 'Pedidos', code: '03', exact: false },
  { href: '/backoffice/users', label: 'Usuarios', code: '04', exact: false },
]

const ROLE_LABEL: Record<string, string> = { ADMIN: 'Admin', SHIFT_LEADER: 'Shift Leader', USER: 'Cliente' }

/** Left rail on desktop, a top bar with a scrolling tab row on phones. */
export function BackofficeSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="sticky top-0 z-30 shrink-0 border-b border-form-rule bg-paper lg:flex lg:h-screen lg:w-60 lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:block lg:px-5 lg:pt-6 lg:pb-5">
        <Link href="/backoffice" className="block" aria-label="KicksControl, trastienda">
          <Wordmark className="text-lg" />
          <span className="type-label mt-1 hidden text-ink-soft lg:block">Trastienda · solo personal</span>
        </Link>
        <button onClick={logout} className="type-label text-ink-soft hover:text-ink lg:hidden">Salir</button>
      </div>

      <nav aria-label="Backoffice" className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:flex-1 lg:flex-col lg:gap-0 lg:border-t lg:border-form-rule lg:px-0 lg:py-3">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`press flex shrink-0 items-center gap-3 px-3 py-2 text-sm font-semibold lg:px-5 lg:py-2.5 ${
                active ? 'bg-ink text-paper' : 'text-ink hover:bg-form-wash'
              }`}
            >
              <span className={`type-label hidden lg:inline ${active ? 'text-paper/60' : 'text-ink-soft'}`}>{item.code}</span>
              {item.label}
            </Link>
          )
        })}
        <Link href="/tienda/caja" className="flex shrink-0 items-center px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-form-wash lg:hidden">
          Caja
        </Link>
        <div className="mt-auto hidden border-t border-form-rule py-2 lg:block">
          <Link href="/tienda/caja" className="flex items-center gap-1.5 px-5 py-2 text-sm text-ink-soft hover:text-ink">
            Caja de la tienda
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 px-5 py-2 text-sm text-ink-soft hover:text-ink">
            Tienda online
            <ArrowUpRightIcon className="size-3.5" />
          </Link>
        </div>
      </nav>

      <div className="hidden items-center gap-3 border-t border-form-rule px-5 py-4 lg:flex">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="type-label truncate text-ink-soft">{user ? ROLE_LABEL[user.role] ?? user.role : ''}</p>
        </div>
        <button onClick={logout} className="press inline-flex size-8 items-center justify-center text-ink-soft hover:bg-form-wash hover:text-ink" title="Cerrar sesión" aria-label="Cerrar sesión">
          <ArrowRightEndOnRectangleIcon className="size-4" />
        </button>
      </div>
    </aside>
  )
}
