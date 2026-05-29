'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/context/CartContext'
import { checkout } from '@/lib/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items, totalAmount, totalItems } = useCart()
  const [address, setAddress] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(address),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      router.push(`/orders/${order.id}?success=1`)
    },
    onError: (err: Error) => {
      setErrorMsg(err.message)
    },
  })

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <p className="text-3xl mb-3">🛒</p>
        <p className="font-semibold text-neutral-700 mb-4">Tu carrito está vacío</p>
        <button onClick={() => router.push('/')} className="text-orange-500 hover:underline text-sm">
          Volver al catálogo
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-black text-neutral-900 mb-8">Finalizar compra</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Resumen */}
        <div className="space-y-4">
          <h2 className="font-bold text-neutral-700">Resumen del pedido ({totalItems} artículos)</h2>
          <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
            {items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    : '👟'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.productName}</p>
                  <p className="text-xs text-neutral-400">{item.size} / {item.color} · x{item.quantity}</p>
                </div>
                <span className="text-sm font-bold">{item.subtotal.toFixed(2)} €</span>
              </div>
            ))}
          </div>

          <div className="bg-orange-50 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="font-semibold text-neutral-700">Total</span>
            <span className="text-xl font-black text-orange-600">{totalAmount.toFixed(2)} €</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          <h2 className="font-bold text-neutral-700">Datos de envío</h2>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Dirección de envío
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              placeholder="Calle, número, piso, ciudad, código postal..."
              className="w-full border border-neutral-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <button
            onClick={() => {
              setErrorMsg(null)
              checkoutMutation.mutate()
            }}
            disabled={!address.trim() || checkoutMutation.isPending}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checkoutMutation.isPending ? 'Procesando...' : `Confirmar pedido · ${totalAmount.toFixed(2)} €`}
          </button>

          <p className="text-xs text-neutral-400 text-center">
            El stock se descuenta en el momento de confirmar. Si una variante se agota, recibirás un error y podrás ajustar tu carrito.
          </p>
        </div>
      </div>
    </div>
  )
}
