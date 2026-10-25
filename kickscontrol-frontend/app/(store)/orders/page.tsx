'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchOrders } from '@/lib/cart'
import { formatPrice } from '@/lib/sheet'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'border border-current uppercase tracking-wide text-ink-soft' },
  CONFIRMED: { label: 'Confirmado', color: 'border border-current uppercase tracking-wide text-form' },
  SHIPPED:   { label: 'Enviado',    color: 'border border-current uppercase tracking-wide text-form' },
  DELIVERED: { label: 'Entregado',  color: 'border border-current uppercase tracking-wide text-ink' },
  CANCELLED: { label: 'Cancelado',  color: 'border border-current uppercase tracking-wide text-alarm' },
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
          <div key={i} className="h-20 bg-paper-deep animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="type-name pt-6 text-[clamp(2rem,3.5vw,2.75rem)]">Mis pedidos</h1>

      {orders.length === 0 ? (
        <div className="py-16 text-center">
                    <p className="font-semibold text-ink-soft">Aún no tienes pedidos</p>
          <Link href="/" className="mt-4 inline-block text-sm text-form hover:underline">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'border border-current uppercase tracking-wide text-ink-soft' }
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block border-t border-form p-5 hover:bg-form-wash/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-ink">Pedido #{order.id}</p>
                    <p className="text-sm text-ink-soft mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-1 text-xs font-semibold ${status.color}`}>
                      {status.label}
                    </span>
                    <p className="font-bold text-ink mt-1">{formatPrice(order.totalAmount)}</p>
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
