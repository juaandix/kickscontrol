'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchOrder } from '@/lib/cart'
import { OrderTimeline } from '@/components/ui/OrderTimeline'
import type { OrderStatus } from '@/types'
import type { ReceiptPaymentInfo } from '@/lib/receipt'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const isSuccess = searchParams.get('success') === '1'

  const [paymentInfo, setPaymentInfo] = useState<ReceiptPaymentInfo | null>(null)
  const [downloading, setDownloading] = useState(false)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(Number(id)),
  })

  useEffect(() => {
    const stored = sessionStorage.getItem(`payment_${id}`)
    if (stored) {
      try { setPaymentInfo(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [id])

  async function handleDownloadReceipt() {
    if (!order) return
    setDownloading(true)
    try {
      const { downloadReceipt } = await import('@/lib/receipt')
      const info: ReceiptPaymentInfo = paymentInfo ?? {
        transactionId: `TXN-${order.id}-MANUAL`,
        cardLast4: '????',
        cardType: 'unknown',
        paidAt: order.createdAt,
      }
      await downloadReceipt(order, user ? `${user.firstName} ${user.lastName}` : 'Cliente', info)
    } finally {
      setDownloading(false)
    }
  }

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

  const cardTypeLabel: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', unknown: '' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success banner */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-5 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-bold text-green-800 text-lg">¡Pago confirmado!</p>
          <p className="text-sm text-green-600 mt-1">
            Tu pedido #{order.id} ha sido registrado. Recibirás confirmación en breve.
          </p>
          {paymentInfo && (
            <p className="text-xs text-green-500 mt-2 font-mono">
              TX: {paymentInfo.transactionId}
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Pedido #{order.id}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {downloading ? 'Generando…' : 'Descargar recibo PDF'}
        </button>
      </div>

      {/* Timeline */}
      <OrderTimeline status={order.status as OrderStatus} />

      {/* Payment info (if available) */}
      {paymentInfo && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Método de pago</p>
            <p className="text-sm font-semibold text-neutral-800">
              {cardTypeLabel[paymentInfo.cardType] || 'Tarjeta'} ···· {paymentInfo.cardLast4}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-neutral-500">Importe cobrado</p>
            <p className="text-lg font-black text-orange-600">{order.totalAmount.toFixed(2)} €</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 bg-neutral-100 rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-xl" />
                : <span className="text-2xl">👟</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase text-neutral-400">{item.productBrand}</p>
              <p className="font-semibold text-neutral-900">{item.productName}</p>
              <p className="text-sm text-neutral-500">{item.size} / {item.color}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-neutral-500">×{item.quantity}</p>
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
          <span className="text-right max-w-xs text-neutral-700">{order.shippingAddress}</span>
        </div>
        <div className="border-t border-neutral-100 pt-3 flex justify-between font-bold text-neutral-900">
          <span>Total</span>
          <span className="text-orange-600 text-lg">{order.totalAmount.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push('/orders')}
          className="flex-1 py-3 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
          Mis pedidos
        </button>
        <button onClick={() => router.push('/')}
          className="flex-1 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors">
          Seguir comprando
        </button>
      </div>
    </div>
  )
}
