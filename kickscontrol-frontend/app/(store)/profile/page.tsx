'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { fetchOrders } from '@/lib/cart'
import {
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ArrowRightEndOnRectangleIcon,
} from '@heroicons/react/24/outline'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  USER:         { label: 'Cliente',      color: 'bg-blue-100 text-blue-700' },
  ADMIN:        { label: 'Admin',        color: 'bg-red-100 text-red-700' },
  SHIFT_LEADER: { label: 'Shift Leader', color: 'bg-purple-100 text-purple-700' },
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
  })

  if (!user) return null

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
  const role = ROLE_LABELS[user.role] ?? { label: user.role, color: 'bg-neutral-100 text-neutral-600' }
  const recentOrders = (ordersData?.content ?? []).slice(0, 3)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-neutral-900">Mi perfil</h1>

      {/* User card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl font-black shrink-0">
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-neutral-900">
                {user.firstName} {user.lastName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${role.color}`}>
                {role.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-500">
              <EnvelopeIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
            <UserCircleIcon className="w-5 h-5 text-neutral-400 shrink-0" />
            <div>
              <p className="text-xs text-neutral-400">Nombre</p>
              <p className="text-sm font-semibold text-neutral-800">{user.firstName} {user.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-neutral-50 rounded-xl px-4 py-3">
            <ShieldCheckIcon className="w-5 h-5 text-neutral-400 shrink-0" />
            <div>
              <p className="text-xs text-neutral-400">Rol</p>
              <p className="text-sm font-semibold text-neutral-800">{role.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-neutral-500" />
            <h3 className="font-bold text-neutral-800">Pedidos recientes</h3>
          </div>
          <Link href="/orders" className="text-xs text-orange-500 font-semibold hover:underline flex items-center gap-1">
            Ver todos <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-neutral-500">Aún no tienes pedidos</p>
            <Link href="/" className="mt-2 inline-block text-sm text-orange-500 hover:underline">
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentOrders.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-800">Pedido #{order.id}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-900">{order.totalAmount.toFixed(2)} €</p>
                  <p className="text-xs text-neutral-400">{ORDER_STATUS_LABELS[order.status] ?? order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {(user.role === 'ADMIN' || user.role === 'SHIFT_LEADER') && (
        <Link
          href="/backoffice"
          className="flex items-center justify-between bg-neutral-900 text-white rounded-2xl px-5 py-4 hover:bg-neutral-800 transition-colors"
        >
          <span className="font-bold text-sm">Ir al Backoffice</span>
          <ArrowRightIcon className="w-4 h-4" />
        </Link>
      )}

      <button
        onClick={() => { logout(); router.push('/') }}
        className="w-full flex items-center justify-center gap-2 py-3 border border-neutral-300 rounded-2xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
      >
        <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
        Cerrar sesión
      </button>
    </div>
  )
}
