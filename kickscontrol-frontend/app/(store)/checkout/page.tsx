'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { checkout } from '@/lib/cart'
import { ShoppingBagIcon, TruckIcon } from '@heroicons/react/24/outline'

interface AddressForm {
  street: string
  floor: string
  city: string
  postalCode: string
  country: string
}

const emptyAddress = (): AddressForm => ({
  street: '',
  floor: '',
  city: '',
  postalCode: '',
  country: 'España',
})

function buildAddressString(f: AddressForm): string {
  const parts = [f.street, f.floor.trim() ? f.floor : null, f.city, f.postalCode, f.country]
  return parts.filter(Boolean).join(', ')
}

function validate(f: AddressForm): Partial<Record<keyof AddressForm, string>> {
  const errors: Partial<Record<keyof AddressForm, string>> = {}
  if (!f.street.trim()) errors.street = 'Campo obligatorio'
  if (!f.city.trim()) errors.city = 'Campo obligatorio'
  if (!f.postalCode.trim()) errors.postalCode = 'Campo obligatorio'
  else if (!/^\d{4,6}$/.test(f.postalCode.trim())) errors.postalCode = 'Código postal inválido'
  if (!f.country.trim()) errors.country = 'Campo obligatorio'
  return errors
}

export default function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items, totalAmount, totalItems } = useCart()
  const { user } = useAuth()

  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress())
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof AddressForm, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(buildAddressString(addressForm)),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      router.push(`/orders/${order.id}?success=1`)
    },
    onError: (err: Error) => setSubmitError(err.message),
  })

  function setField(k: keyof AddressForm, v: string) {
    setAddressForm(prev => ({ ...prev, [k]: v }))
    if (fieldErrors[k]) setFieldErrors(prev => ({ ...prev, [k]: undefined }))
  }

  function handleSubmit() {
    setSubmitError(null)
    const errors = validate(addressForm)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    checkoutMutation.mutate()
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <ShoppingBagIcon className="w-12 h-12 mx-auto text-neutral-300" />
        <p className="font-semibold text-neutral-700">Tu carrito está vacío</p>
        <button onClick={() => router.push('/')} className="text-sm text-orange-500 hover:underline">
          Volver al catálogo
        </button>
      </div>
    )
  }

  const inputCls = (field: keyof AddressForm) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
      fieldErrors[field]
        ? 'border-red-300 focus:ring-red-400 bg-red-50'
        : 'border-neutral-200 focus:ring-orange-400'
    }`

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-neutral-900 mb-8">Finalizar compra</h1>

      <div className="grid md:grid-cols-5 gap-8">

        {/* ── Columna izquierda: envío ── */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <TruckIcon className="w-5 h-5 text-orange-500" />
              <h2 className="font-bold text-neutral-800">Datos de envío</h2>
            </div>

            {/* Nombre del destinatario (pre-filled, read-only) */}
            {user && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    readOnly
                    className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-500 cursor-default"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    readOnly
                    className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-500 cursor-default"
                  />
                </div>
              </div>
            )}

            {/* Calle */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                Calle y número *
              </label>
              <input
                type="text"
                value={addressForm.street}
                onChange={e => setField('street', e.target.value)}
                placeholder="Calle Gran Vía 28"
                className={inputCls('street')}
              />
              {fieldErrors.street && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.street}</p>
              )}
            </div>

            {/* Piso / Puerta */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                Piso / Puerta <span className="font-normal text-neutral-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={addressForm.floor}
                onChange={e => setField('floor', e.target.value)}
                placeholder="3º B"
                className={inputCls('floor')}
              />
            </div>

            {/* Ciudad + CP */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={addressForm.city}
                  onChange={e => setField('city', e.target.value)}
                  placeholder="Madrid"
                  className={inputCls('city')}
                />
                {fieldErrors.city && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                  Código postal *
                </label>
                <input
                  type="text"
                  value={addressForm.postalCode}
                  onChange={e => setField('postalCode', e.target.value)}
                  placeholder="28013"
                  maxLength={6}
                  className={inputCls('postalCode')}
                />
                {fieldErrors.postalCode && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.postalCode}</p>
                )}
              </div>
            </div>

            {/* País */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
                País *
              </label>
              <select
                value={addressForm.country}
                onChange={e => setField('country', e.target.value)}
                className={inputCls('country')}
              >
                <option>España</option>
                <option>Portugal</option>
                <option>Francia</option>
                <option>Alemania</option>
                <option>Italia</option>
                <option>Países Bajos</option>
                <option>Bélgica</option>
                <option>Reino Unido</option>
              </select>
            </div>

            {/* Dirección resultante (preview) */}
            {(addressForm.street || addressForm.city) && (
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3">
                <p className="text-xs text-neutral-400 mb-1 font-medium">Dirección de entrega</p>
                <p className="text-sm text-neutral-700">{buildAddressString(addressForm)}</p>
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={checkoutMutation.isPending}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {checkoutMutation.isPending
              ? 'Procesando pedido...'
              : `Confirmar pedido · ${totalAmount.toFixed(2)} €`}
          </button>

          <p className="text-xs text-neutral-400 text-center">
            El stock se descuenta al confirmar. Si una variante se agota, recibirás un aviso para ajustar el carrito.
          </p>
        </div>

        {/* ── Columna derecha: resumen ── */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-4 sticky top-24">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-neutral-500" />
              <h2 className="font-bold text-neutral-800">Resumen ({totalItems} art.)</h2>
            </div>

            <div className="divide-y divide-neutral-100">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      : <span className="text-lg">👟</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{item.productName}</p>
                    <p className="text-xs text-neutral-400">{item.size} / {item.color} · ×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 shrink-0">{item.subtotal.toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{totalAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Envío</span>
                <span className="text-green-600 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between font-black text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total</span>
                <span className="text-orange-600">{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
