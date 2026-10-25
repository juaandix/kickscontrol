'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { checkout } from '@/lib/cart'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { ShoppingBagIcon, TruckIcon, CreditCardIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import { formatPrice } from '@/lib/sheet'

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
            <div className={`w-8 h-8 flex items-center justify-center text-sm font-bold transition-all ${
 step > s.n ? 'bg-ink text-paper' : step === s.n ? 'bg-ink text-paper' : 'bg-paper-deep text-ink-soft'
 }`}>
              {step > s.n ? <CheckCircleIcon className="w-5 h-5" /> : s.n}
            </div>
            <span className={`text-sm font-semibold ${step >= s.n ? 'text-ink' : 'text-ink-soft'}`}>{s.label}</span>
          </div>
          {i < arr.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > s.n ? 'bg-ink' : 'bg-paper-deep'}`} />
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
        <ShoppingBagIcon className="w-12 h-12 mx-auto text-ink-soft/50" />
        <p className="font-semibold text-ink-soft">Tu carrito está vacío</p>
        <button onClick={() => router.push('/')} className="text-sm text-form hover:underline">Volver al catálogo</button>
      </div>
    )
  }

  const inpCls = (err?: boolean) =>
    `w-full  border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
      err ? 'border-alarm focus:ring-alarm bg-transparent' : 'border-form-rule focus:ring-form'
    }`

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="type-name pt-6 text-[clamp(2rem,3.5vw,2.75rem)] mb-2">Finalizar compra</h1>
      <StepsBar step={step} />

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left */}
        <div className="md:col-span-3 space-y-6">

          {step === 1 && (
            <div className="border-t border-form p-6 space-y-5">
              <div className="flex items-center gap-2">
                <TruckIcon className="w-5 h-5 text-form" />
                <h2 className="font-bold text-ink">Datos de envío</h2>
              </div>

              {user && (
                <div className="grid grid-cols-2 gap-4">
                  {(['firstName', 'lastName'] as const).map(k => (
                    <div key={k}>
                      <label className="block type-field mb-1">
                        {k === 'firstName' ? 'Nombre' : 'Apellidos'}
                      </label>
                      <input readOnly value={user[k]}
                        className="w-full border border-form-rule bg-paper-deep px-3.5 py-2.5 text-sm text-ink-soft cursor-default" />
                    </div>
                  ))}
                </div>
              )}

              {([
                { key: 'street', label: 'Calle y número *', placeholder: 'Calle Gran Vía 28' },
                { key: 'floor', label: 'Piso / Puerta (opcional)', placeholder: '3º B' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block type-field mb-1">{label}</label>
                  <input type="text" value={addressForm[key]} onChange={e => setAddrField(key, e.target.value)}
                    placeholder={placeholder} className={inpCls(!!addressErrors[key])} />
                  {addressErrors[key] && <p className="mt-1 text-xs text-alarm">{addressErrors[key]}</p>}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block type-field mb-1">Ciudad *</label>
                  <input type="text" value={addressForm.city} onChange={e => setAddrField('city', e.target.value)}
                    placeholder="Madrid" className={inpCls(!!addressErrors.city)} />
                  {addressErrors.city && <p className="mt-1 text-xs text-alarm">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="block type-field mb-1">Código postal *</label>
                  <input type="text" value={addressForm.postalCode} onChange={e => setAddrField('postalCode', e.target.value)}
                    placeholder="28013" maxLength={6} className={inpCls(!!addressErrors.postalCode)} />
                  {addressErrors.postalCode && <p className="mt-1 text-xs text-alarm">{addressErrors.postalCode}</p>}
                </div>
              </div>

              <div>
                <label className="block type-field mb-1">País *</label>
                <select value={addressForm.country} onChange={e => setAddrField('country', e.target.value)} className={inpCls()}>
                  {['España','Portugal','Francia','Alemania','Italia','Países Bajos','Bélgica','Reino Unido'].map(c =>
                    <option key={c}>{c}</option>)}
                </select>
              </div>

              {(addressForm.street || addressForm.city) && (
                <div className=" bg-paper-deep border border-form-rule px-4 py-3">
                  <p className="text-xs text-ink-soft mb-1 font-medium">Dirección de entrega</p>
                  <p className="text-sm text-ink-soft">{buildAddressString(addressForm)}</p>
                </div>
              )}

              <button onClick={handleAddressNext}
                className="w-full py-4 bg-ink hover:bg-form-deep text-paper font-bold transition-colors">
                <span className="inline-flex items-center justify-center gap-2">Continuar al pago <ArrowRightIcon className="size-4" /></span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="border-t border-form p-6">
              <div className="flex items-center gap-2 mb-5">
                <CreditCardIcon className="w-5 h-5 text-form" />
                <h2 className="font-bold text-ink">Datos de pago</h2>
              </div>

              <div className="bg-paper-deep px-4 py-3 mb-6">
                <div className="flex items-center gap-1.5 mb-1">
                  <TruckIcon className="w-3.5 h-3.5 text-ink-soft" />
                  <p className="type-field">Envío a</p>
                </div>
                <p className="text-sm text-ink-soft">{buildAddressString(addressForm)}</p>
              </div>

              <PaymentForm
                amount={totalAmount}
                onSuccess={handlePaymentSuccess}
                onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />

              {checkoutMutation.isError && (
                <div className="mt-4 bg-transparent border border-alarm px-4 py-3 text-sm text-alarm">
                  Error al crear el pedido: {checkoutMutation.error?.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: order summary */}
        <div className="md:col-span-2">
          <div className="border-t border-form p-5 space-y-4 sticky top-24">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-ink-soft" />
              <h2 className="font-bold text-ink">Resumen ({totalItems} art.)</h2>
            </div>

            <div className="divide-y divide-form-rule">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 bg-paper-deep shrink-0 overflow-hidden flex items-center justify-center">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink truncate">{item.productName}</p>
                    <p className="text-xs text-ink-soft">{item.size} / {item.color} · ×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold shrink-0">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-form-rule pt-3 space-y-2">
              <div className="flex justify-between text-sm text-ink-soft">
                <span>Subtotal</span><span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-ink-soft">
                <span>Envío</span><span className="text-form-deep font-semibold">Gratis</span>
              </div>
              <div className="flex justify-between font-extrabold text-ink pt-2 border-t border-form-rule">
                <span>Total</span><span className="text-form">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
