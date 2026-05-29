'use client'

import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchOrder } from '@/lib/cart'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',   color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado',  color: 'bg-green-100 text-green-700' },
  SHIPPED:   { label: 'Enviado',     color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Entregado',   color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelado',   color: 'bg-red-100 text-red-700' },
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const isSuccess = searchParams.get('success') === '1'

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(Number(id)),
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 bg-neutral-200 rounded w-1/2" />
        <div className="h-40 bg-neutral-200 rounded-2xl" />
      </div>
    )
  }

  if (!order) {
    return <div className="py-16 text-center text-neutral-500">Pedido no encontrado.</div>
  }

  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Éxito banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="font-bold text-green-800 text-lg">¡Pedido confirmado!</p>
          <p className="text-sm text-green-600 mt-1">
            Tu pedido #{order.id} ha sido registrado correctamente.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Pedido #{order.id}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 bg-neutral-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
                : '👟'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase text-neutral-400">{item.productBrand}</p>
              <p className="font-semibold text-neutral-900">{item.productName}</p>
              <p className="text-sm text-neutral-500">{item.size} / {item.color}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-neutral-500">x{item.quantity}</p>
              <p className="font-bold text-neutral-900">{item.subtotal.toFixed(2)} €</p>
              <p className="text-xs text-neutral-400">{item.unitPrice.toFixed(2)} € / ud.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Dirección de envío</span>
          <span className="text-right max-w-xs">{order.shippingAddress}</span>
        </div>
        <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900">
          <span>Total</span>
          <span className="text-orange-600 text-lg">{order.totalAmount.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/orders')}
          className="flex-1 py-3 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Ver todos mis pedidos
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600"
        >
          Seguir comprando
        </button>
      </div>
    </div>
  )
}
