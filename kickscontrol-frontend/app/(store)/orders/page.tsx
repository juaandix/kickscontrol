'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders } from '@/lib/cart'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  SHIPPED:   { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Entregado',  color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelado',  color: 'bg-red-100 text-red-700' },
}

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  })

  const orders = data?.content ?? []

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-neutral-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-neutral-900">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-3xl mb-3">📦</p>
          <p className="font-semibold text-neutral-700">Aún no tienes pedidos</p>
          <Link href="/" className="mt-4 inline-block text-sm text-orange-500 hover:underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-neutral-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-neutral-900">Pedido #{order.id}</p>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                    <p className="font-bold text-neutral-900 mt-1">{order.totalAmount.toFixed(2)} €</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
