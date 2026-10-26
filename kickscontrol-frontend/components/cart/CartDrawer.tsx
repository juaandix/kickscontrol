'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCart } from '@/context/CartContext'
import { formatPrice } from '@/lib/sheet'
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid'

/** The order slip: every line you have marked, with its reference, size and subtotal. */
export function CartDrawer() {
  const { items, totalAmount, totalItems, isOpen, closeCart, updateItem, removeItem } = useCart()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  // Stay mounted after closing until the slide-out finishes, so the slip leaves the way it came.
  const [mounted, setMounted] = useState(isOpen)
  if (isOpen && !mounted) setMounted(true)

  if (!mounted) return null
  const closing = !isOpen

  return (
    <>
      <div className={`${closing ? 'overlay-out pointer-events-none' : 'overlay-in'} fixed inset-0 z-40 bg-ink/40`} onClick={closeCart} aria-hidden />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        onAnimationEnd={e => { if (closing && e.target === e.currentTarget) setMounted(false) }}
        inert={closing}
        className={`sheet tone-reset ${closing ? 'drawer-out' : 'drawer-in'} fixed top-0 right-0 z-50 flex h-dvh w-full max-w-md flex-col border-l border-form-rule shadow-[-24px_0_48px_-24px_rgba(17,17,17,0.25)]`}
        style={{ background: 'var(--sheet)' }}
      >
        <div className="flex items-center justify-between border-b border-form-rule px-5 py-3">
          <h2 id="cart-title" className="type-section">Tu carrito</h2>
          <button onClick={closeCart} className="press p-2 text-ink-soft hover:text-form" aria-label="Cerrar carrito">
            <XMarkIcon className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="py-16">
              <p className="font-semibold">Tu carrito está vacío</p>
              <p className="mt-1 text-sm text-ink-soft">Marca una talla en cualquier ficha para añadirla.</p>
              <button onClick={closeCart} className="mt-4 text-sm font-semibold text-form underline">
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul>
              {items.map((item, i) => (
                <li key={item.id} className="slip-line flex gap-3 border-b border-form-rule py-4" style={{ '--d': `${120 + i * 60}ms` } as React.CSSProperties}>
                  <div className="tile relative size-16 shrink-0">
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" className="on-paper size-full object-contain" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="type-field">{item.productBrand}</p>
                    <p className="truncate font-semibold">{item.productName}</p>
                    <p className="text-xs text-ink-soft">Talla {item.size} · {item.color}</p>
                    <p className="type-label mt-0.5 text-ink-soft">{item.sku}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center border border-form-rule">
                        <button
                          onClick={() => updateItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Quitar una unidad"
                          className="press grid size-8 place-items-center hover:bg-form-wash disabled:text-ink-soft/40 disabled:hover:bg-transparent"
                        >
                          <MinusIcon className="size-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableStock}
                          aria-label="Añadir una unidad"
                          className="press grid size-8 place-items-center hover:bg-form-wash disabled:text-ink-soft/40 disabled:hover:bg-transparent"
                        >
                          <PlusIcon className="size-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold">{formatPrice(item.subtotal)}</span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold text-ink-soft underline hover:text-alarm"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                    {item.quantity >= item.availableStock && (
                      <p className="mt-1 text-xs text-alarm">No quedan más unidades de esta talla.</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-form-rule px-5 py-4">
            <dl className="mb-3 flex items-baseline justify-between">
              <dt className="type-field">Total · {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}</dt>
              <dd className="text-2xl font-bold">{formatPrice(totalAmount)}</dd>
            </dl>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="sheen grid h-14 place-items-center bg-ink font-bold text-paper transition-[background-color,transform] duration-150 hover:bg-form-deep active:scale-[0.99]"
            >
              Pasar por caja
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
