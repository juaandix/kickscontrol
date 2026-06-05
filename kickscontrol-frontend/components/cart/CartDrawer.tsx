'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'

export function CartDrawer() {
  const { items, totalAmount, isOpen, closeCart, updateItem, removeItem } = useCart()

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeCart}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="font-bold text-lg text-neutral-900">Tu carrito</h2>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-neutral-100">
            <XMarkIcon className="w-5 h-5 text-neutral-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">🛒</p>
              <p className="font-semibold text-neutral-700">Tu carrito está vacío</p>
              <button
                onClick={closeCart}
                className="mt-4 text-sm text-orange-500 hover:underline"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3">
                {/* Image placeholder */}
                <div className="w-16 h-16 rounded-lg bg-neutral-100 flex items-center justify-center text-2xl shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                    : '👟'
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">{item.productBrand}</p>
                  <p className="text-sm font-semibold text-neutral-900 truncate">{item.productName}</p>
                  <p className="text-xs text-neutral-600 font-medium">{item.size} · {item.color}</p>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity selector */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-sm hover:bg-neutral-100 disabled:opacity-40"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded border border-neutral-300 flex items-center justify-center text-sm hover:bg-neutral-100 disabled:opacity-40"
                        disabled={item.quantity >= item.availableStock}
                      >
                        +
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-neutral-900">{item.subtotal.toFixed(2)} €</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700">Total</span>
              <span className="text-xl font-black text-neutral-900">{totalAmount.toFixed(2)} €</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center py-3.5 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Finalizar compra
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
