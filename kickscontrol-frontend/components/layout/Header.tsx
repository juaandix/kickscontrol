'use client'

import Link from 'next/link'
import { categoryHref } from '@/lib/categories'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { Wordmark } from '@/components/brand/Wordmark'
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

const CATEGORIES = ['Running', 'Basketball', 'Lifestyle', 'Skateboarding']

/** Search lives in the header, as on the reference stores; it filters the catalog on the home page. */
function HeaderSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim()
    router.push(q ? `/?search=${encodeURIComponent(q)}#catalog` : '/#catalog')
  }

  return (
    <form role="search" onSubmit={submit} className="relative hidden md:block">
      <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-0 size-4 -translate-y-1/2" />
      <input
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Buscar en KicksControl"
        aria-label="Buscar en el catálogo"
        className="w-56 border-b border-ink bg-transparent py-1.5 pl-6 text-sm placeholder:text-ink-soft focus:outline-none lg:w-64"
      />
    </form>
  )
}

export function Header() {
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems, openCart } = useCart()
  const isStaff = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SHIFT_LEADER')

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-form-rule bg-paper" style={{ viewTransitionName: 'site-header' }}>
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-8 px-4 sm:px-6 lg:px-10">
          <Link href="/" className="shrink-0" aria-label="KicksControl, inicio">
            <Wordmark />
          </Link>

          <nav aria-label="Categorías" className="hidden items-center gap-6 text-sm font-medium lg:flex">
            {CATEGORIES.map(cat => (
              <Link key={cat} href={categoryHref(cat)} aria-current={pathname === categoryHref(cat) ? 'page' : undefined} className="underline-offset-4 hover:underline aria-[current=page]:underline">
                {cat}
              </Link>
            ))}
            <Link href="/?type=APPAREL#catalog" className="underline-offset-4 hover:underline">Ropa</Link>
            {isStaff && <Link href="/backoffice" className="text-ink-soft hover:text-ink">Backoffice</Link>}
            {isStaff && <Link href="/tienda/caja" className="text-ink-soft hover:text-ink">Caja</Link>}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <Suspense><HeaderSearch /></Suspense>

            {/* Below lg the category nav is hidden: keep the staff's way into the till */}
            {isStaff && <Link href="/tienda/caja" className="type-label px-2 text-ink-soft hover:text-ink lg:hidden">Caja</Link>}

            {isAuthenticated ? (
              <>
                <Link href="/profile" className="hidden px-2 py-2 text-sm font-medium underline-offset-4 hover:underline sm:inline">
                  {user?.firstName}
                </Link>
                <button onClick={logout} className="p-2 hover:text-ink-soft" title="Cerrar sesión" aria-label="Cerrar sesión">
                  <ArrowRightStartOnRectangleIcon className="size-5" />
                </button>
              </>
            ) : (
              <Link href="/login" className="p-2 hover:text-ink-soft" aria-label="Entrar">
                <UserIcon className="size-5" />
              </Link>
            )}

            <button
              onClick={openCart}
              className="press relative p-2 hover:text-ink-soft"
              aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`}
            >
              <ShoppingBagIcon className="size-5" />
              <span key={totalItems} className="bump absolute -top-0.5 -right-1 text-[0.6875rem] font-bold">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        <nav aria-label="Categorías" className="flex gap-5 overflow-x-auto border-t border-form-rule px-4 py-2.5 text-sm font-medium sm:px-6 lg:hidden">
          {CATEGORIES.map(cat => (
            <Link key={cat} href={categoryHref(cat)} aria-current={pathname === categoryHref(cat) ? 'page' : undefined} className="shrink-0 underline-offset-4 aria-[current=page]:underline">{cat}</Link>
          ))}
          <Link href="/?type=APPAREL#catalog" className="shrink-0">Ropa</Link>
        </nav>
      </header>
      <CartDrawer />
    </>
  )
}
