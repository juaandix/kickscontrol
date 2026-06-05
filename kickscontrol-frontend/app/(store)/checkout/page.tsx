'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { checkout } from '@/lib/cart'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { ShoppingBagIcon, TruckIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface AddressForm {
  street: string; floor: string; city: string; postalCode: string; country: string
}
const emptyAddress = (): AddressForm => ({ street: '', floor: '', city: '', postalCode: '', country: 'España' })

function buildAddressString(f: AddressForm) {
  return [f.street, f.floor.trim() || null, f.city, f.postalCode, f.country].filter(Boolean).join(', ')
}

function validateAddress(f: AddressForm) {
  const e: Partial<Record<keyof AddressForm, string>> = {}
  if (!f.street.trim()) e.street = 'Campo obligatorio'
  if (!f.city.trim()) e.city = 'Campo obligatorio'
  if (!f.postalCode.trim()) e.postalCode = 'Campo obligatorio'
  else if (!/^\d{4,6}$/.test(f.postalCode.trim())) e.postalCode = 'Código postal inválido'
  return e
}

function StepsBar({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center mb-8">
      {[{ n: 1, label: 'Envío', icon: TruckIcon }, { n: 2, label: 'Pago', icon: CreditCardIcon }].map((s, i, arr) => (
        <div key={s.n} className="flex items-center flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step > s.n ? 'bg-orange-500 text-white' : step === s.n ? 'bg-orange-500 text-white' : 'bg-neutral-200 text-neutral-500'
            }`}>
              {step > s.n ? <CheckCircleIcon className="w-5 h-5" /> : s.n}
            </div>
            <span className={`text-sm font-semibold ${step >= s.n ? 'text-neutral-900' : 'text-neutral-400'}`}>{s.label}</span>
          </div>
          {i < arr.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 rounded transition-colors ${step > s.n ? 'bg-orange-500' : 'bg-neutral-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items, totalAmount, totalItems } = useCart()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress())
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressForm, string>>>({})

  // Holds payment info until the checkout API call succeeds
  const paymentRef = useRef<{ transactionId: string; cardLast4: string; cardType: string } | null>(null)

  const checkoutMutation = useMutation({
    mutationFn: (address: string) => checkout(address),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      if (paymentRef.current) {
        sessionStorage.setItem(`payment_${order.id}`, JSON.stringify({
          ...paymentRef.current,
          paidAt: new Date().toISOString(),
        }))
      }
      router.push(`/orders/${order.id}?success=1`)
    },
  })

  function handleAddressNext() {
    const errs = validateAddress(addressForm)
    if (Object.keys(errs).length > 0) { setAddressErrors(errs); return }
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handlePaymentSuccess(transactionId: string, cardLast4: string, cardType: string) {
    paymentRef.current = { transactionId, cardLast4, cardType }
    checkoutMutation.mutate(buildAddressString(addressForm))
  }

  function setAddrField(k: keyof AddressForm, v: string) {
    setAddressForm(p => ({ ...p, [k]: v }))
    if (addressErrors[k]) setAddressErrors(p => ({ ...p, [k]: undefined }))
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-24 text-center space-y-4">
        <ShoppingBagIcon className="w-12 h-12 mx-auto text-neutral-300" />
        <p className="font-semibold text-neutral-700">Tu carrito está vacío</p>
        <button onClick={() => router.push('/')} className="text-sm text-orange-500 hover:underline">Volver al catálogo</button>
      </div>
    )
  }

  const inpCls = (err?: boolean) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? 'border-red-300 focus:ring-red-400 bg-red-50' : 'border-neutral-200 focus:ring-orange-400'
    }`

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-neutral-900 mb-2">Finalizar compra</h1>
      <StepsBar step={step} />

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left */}
        <div className="md:col-span-3 space-y-6">

          {step === 1 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-neutral-800">Datos de envío</h2>
              </div>

              {user && (
                <div className="grid grid-cols-2 gap-4">
                  {(['firstName', 'lastName'] as const).map(k => (
                    <div key={k}>
                      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                        {k === 'firstName' ? 'Nombre' : 'Apellidos'}
                      </label>
                      <input readOnly value={user[k]}
                        className="w-full rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-500 cursor-default" />
                    </div>
                  ))}
                </div>
              )}

              {([
                { key: 'street', label: 'Calle y número *', placeholder: 'Calle Gran Vía 28' },
                { key: 'floor', label: 'Piso / Puerta (opcional)', placeholder: '3º B' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">{label}</label>
                  <input type="text" value={addressForm[key]} onChange={e => setAddrField(key, e.target.value)}
                    placeholder={placeholder} className={inpCls(!!addressErrors[key])} />
                  {addressErrors[key] && <p className="mt-1 text-xs text-red-500">{addressErrors[key]}</p>}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">Ciudad *</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddrField('city', e.target.value)}
                    placeholder="Madrid" className={inpCls(!!addressErrors.city)} />
                  {addressErrors.city && <p className="mt-1 text-xs text-red-500">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">Código postal *</label>
                  <input type="text" value={addressForm.postalCode} onChange={e => setAddrField('postalCode', e.target.value)}
                    placeholder="28013" maxLength={6} className={inpCls(!!addressErrors.postalCode)} />
                  {addressErrors.postalCode && <p className="mt-1 text-xs text-red-500">{addressErrors.postalCode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">País *</label>
                <select value={addressForm.country} onChange={e => setAddrField('country', e.target.value)} className={inpCls()}>
                  {['España','Portugal','Francia','Alemania','Italia','Países Bajos','Bélgica','Reino Unido'].map(c =>
                    <option key={c}>{c}</option>)}
                </select>
              </div>

              {(addressForm.street || addressForm.city) && (
                <div className="rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3">
                  <p className="text-xs text-neutral-400 mb-1 font-medium">Dirección de entrega</p>
                  <p className="text-sm text-neutral-700">{buildAddressString(addressForm)}</p>
                </div>
              )}

              <button onClick={handleAddressNext}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
                Continuar al pago →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCardIcon className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-neutral-800">Datos de pago</h2>
              </div>

              <div className="bg-neutral-50 rounded-xl px-4 py-3 mb-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <TruckIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Envío a</p>
                </div>
                <p className="text-sm text-neutral-700">{buildAddressString(addressForm)}</p>
              </div>

              <PaymentForm
                amount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />

              {checkoutMutation.isError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  Error al crear el pedido: {checkoutMutation.error?.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="md:col-span-2">
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
                      : <span>👟</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-neutral-800 truncate">{item.productName}</p>
                    <p className="text-xs text-neutral-400">{item.size} / {item.color} · ×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold shrink-0">{item.subtotal.toFixed(2)} €</span>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span><span>{totalAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Envío</span><span className="text-green-600 font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between font-black text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total</span><span className="text-orange-600">{totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
