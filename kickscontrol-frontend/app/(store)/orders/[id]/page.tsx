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
import { formatPrice } from '@/lib/sheet'

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
        <div className="h-8 bg-paper-deep w-1/2" />
        <div className="h-40 bg-paper-deep " />
      </div>
    )
  }

  if (!order) {
    return <div className="py-16 text-center text-ink-soft">Pedido no encontrado.</div>
  }

  const cardTypeLabel: Record<string, string> = { visa: 'Visa', mastercard: 'Mastercard', amex: 'Amex', unknown: '' }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success banner */}
      {isSuccess && (
        <div className="bg-form-wash border border-form-rule px-6 py-5 text-center">
                    <p className="font-bold text-form-deep text-lg">¡Pago confirmado!</p>
          <p className="text-sm text-form-deep mt-1">
            Tu pedido #{order.id} ha sido registrado. Recibirás confirmación en breve.
          </p>
          {paymentInfo && (
            <p className="text-xs text-form-deep mt-2 font-mono">
              TX: {paymentInfo.transactionId}
            </p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="type-name pt-6 text-[clamp(2rem,3.5vw,2.75rem)]">Pedido #{order.id}</h1>
          <p className="text-sm text-ink-soft mt-1">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <button
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-form-deep disabled:opacity-60 text-paper text-sm font-semibold transition-colors shrink-0"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {downloading ? 'Generando…' : 'Descargar recibo PDF'}
        </button>
      </div>

      {/* Timeline */}
      <OrderTimeline status={order.status as OrderStatus} />

      {/* Payment info (if available) */}
      {paymentInfo && (
        <div className="bg-form-wash border border-form-rule px-5 py-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold text-form uppercase tracking-widest mb-1">Método de pago</p>
            <p className="text-sm font-semibold text-ink">
              {cardTypeLabel[paymentInfo.cardType] || 'Tarjeta'} ···· {paymentInfo.cardLast4}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-soft">Importe cobrado</p>
            <p className="text-lg font-extrabold text-form">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="border-t border-form divide-y divide-form-rule">
        {order.items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 bg-paper-deep shrink-0 overflow-hidden flex items-center justify-center">
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover " />
                : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase text-ink-soft">{item.productBrand}</p>
              <p className="font-semibold text-ink">{item.productName}</p>
              <p className="text-sm text-ink-soft">{item.size} / {item.color}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-ink-soft">×{item.quantity}</p>
              <p className="font-bold text-ink">{formatPrice(item.subtotal)}</p>
              <p className="text-xs text-ink-soft">{formatPrice(item.unitPrice)} / ud.</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-form p-5 space-y-3">
        <div className="flex justify-between text-sm text-ink-soft">
          <span>Dirección de envío</span>
          <span className="text-right max-w-xs text-ink-soft">{order.shippingAddress}</span>
        </div>
        <div className="border-t border-form-rule pt-3 flex justify-between font-bold text-ink">
          <span>Total</span>
          <span className="text-form text-lg">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => router.push('/orders')}
          className="flex-1 py-3 border border-form-rule text-sm font-medium text-ink-soft hover:bg-paper-deep transition-colors">
          Mis pedidos
        </button>
        <button onClick={() => router.push('/')}
          className="flex-1 py-3 bg-ink text-paper text-sm font-bold hover:bg-form-deep transition-colors">
          Seguir comprando
        </button>
      </div>
    </div>
  )
}
