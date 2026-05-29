'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  CubeIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline'

const NAV_ITEMS = [
  { href: '/backoffice', label: 'Dashboard', icon: ChartBarIcon, exact: true },
  { href: '/backoffice/inventory', label: 'Inventario', icon: CubeIcon, exact: false },
  { href: '/backoffice/orders', label: 'Pedidos', icon: ShoppingBagIcon, exact: false },
]

export function BackofficeSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-60 shrink-0 bg-neutral-900 text-white flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-700">
        <Link href="/" className="text-sm font-black tracking-tight">
          KICKS<span className="text-orange-500">CONTROL</span>
        </Link>
        <p className="text-xs text-neutral-400 mt-0.5">Backoffice</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && pathname !== '/backoffice'
          const isActive = item.exact ? pathname === item.href : active
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
            {user?.firstName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-neutral-400 truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400"
            title="Cerrar sesión"
          >
            <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
