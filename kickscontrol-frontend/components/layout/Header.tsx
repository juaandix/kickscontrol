'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { ShoppingCartIcon, UserIcon, ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline'

export function Header() {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems, openCart } = useCart()
  const cartCount = totalItems

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-neutral-900">
              KICKS<span className="text-orange-500">CONTROL</span>
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SHIFT_LEADER') && (
              <Link
                href="/backoffice"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
              >
                Backoffice
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">
                    {user?.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-neutral-700">
                    {user?.firstName}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500"
                  title="Cerrar sesión"
                >
                  <ArrowRightEndOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-neutral-900 p-2 rounded-lg hover:bg-neutral-100"
              >
                <UserIcon className="w-5 h-5" />
                <span className="hidden sm:block">Entrar</span>
              </Link>
            )}

            <button
              onClick={openCart}
              className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
            >
              <ShoppingCartIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <CartDrawer />
    </header>
  )
}
