'use client'

import { useState } from 'react'
import { CreditCard } from './CreditCard'
import { formatCardNumber, formatExpiry, validateCard, simulatePayment, type PaymentData } from '@/lib/payment'
import { LockClosedIcon } from '@heroicons/react/24/solid'
import { formatPrice } from '@/lib/sheet'

interface Props {
  amount: number
  onSuccess: (transactionId: string, cardLast4: string, cardType: string) => void
  onBack: () => void
}

type PaymentStatus = 'idle' | 'processing' | 'declined'

const PROCESSING_STEPS = [
  'Conectando con el banco…',
  'Verificando fondos…',
  'Autorizando pago…',
  'Confirmando transacción…',
]

const inputCls = (error?: boolean) =>
  `w-full  border px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-alarm focus:ring-alarm bg-transparent'
      : 'border-form-rule focus:ring-form bg-transparent'
  }`

export function PaymentForm({ amount, onSuccess, onBack }: Props) {
  const [card, setCard] = useState<PaymentData>({ cardNumber: '', cardName: '', expiry: '', cvv: '' })
  const [cvvFocused, setCvvFocused] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentData, string>>>({})
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [declineMsg, setDeclineMsg] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(0)

  function set(k: keyof PaymentData, v: string) {
    setCard(prev => ({ ...prev, [k]: v }))
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
    setDeclineMsg(null)
  }

  async function handlePay() {
    const err: Partial<Record<keyof PaymentData, string>> = {}
    const globalError = validateCard(card)
    if (globalError) {
      if (globalError.includes('número')) err.cardNumber = globalError
      else if (globalError.includes('titular')) err.cardName = globalError
      else if (globalError.includes('caducidad') || globalError.includes('Mes') || globalError.includes('caducada')) err.expiry = globalError
      else if (globalError.includes('CVV')) err.cvv = globalError
      setErrors(err)
      return
    }

    setStatus('processing')
    setProcessingStep(0)
    setDeclineMsg(null)

    // Animate through processing steps
    const stepInterval = setInterval(() => {
      setProcessingStep(p => Math.min(p + 1, PROCESSING_STEPS.length - 1))
    }, 500)

    const result = await simulatePayment(card)
    clearInterval(stepInterval)

    if (result.success && result.transactionId) {
      const clean = card.cardNumber.replace(/\s/g, '')
      const last4 = clean.slice(-4)
      const { getCardType } = await import('@/lib/payment')
      const cardType = getCardType(card.cardNumber)
      onSuccess(result.transactionId, last4, cardType)
    } else {
      setStatus('declined')
      setDeclineMsg(result.errorMessage ?? 'Pago rechazado')
    }
  }

  const isProcessing = status === 'processing'

  return (
    <div className="space-y-6">
      {/* Visual card */}
      <CreditCard
        number={card.cardNumber}
        name={card.cardName}
        expiry={card.expiry}
        cvv={card.cvv}
        flipped={cvvFocused}
      />

      {/* Test hint */}
      <div className="bg-form-wash border border-form-rule px-4 py-3 text-xs text-form-deep space-y-0.5">
        <p className="font-semibold">Tarjetas de prueba:</p>
        <p><span className="font-mono">4242 4242 4242 4242</span> → Pago aprobado</p>
        <p><span className="font-mono">4000 0000 0000 0002</span> → Rechazada · <span className="font-mono">4000 0000 0000 9995</span> → Sin fondos</p>
        <p>CVV: cualquier 3 dígitos · Fecha: cualquier fecha futura</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Card number */}
        <div>
          <label className="block type-field mb-1">
            Número de tarjeta *
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={card.cardNumber}
            onChange={e => set('cardNumber', formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={inputCls(!!errors.cardNumber)}
            disabled={isProcessing}
          />
          {errors.cardNumber && <p className="mt-1 text-xs text-alarm">{errors.cardNumber}</p>}
        </div>

        {/* Cardholder name */}
        <div>
          <label className="block type-field mb-1">
            Nombre del titular *
          </label>
          <input
            type="text"
            value={card.cardName}
            onChange={e => set('cardName', e.target.value.toUpperCase())}
            placeholder="JUAN GARCÍA LÓPEZ"
            className={inputCls(!!errors.cardName)}
            disabled={isProcessing}
          />
          {errors.cardName && <p className="mt-1 text-xs text-alarm">{errors.cardName}</p>}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block type-field mb-1">
              Caducidad *
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={card.expiry}
              onChange={e => set('expiry', formatExpiry(e.target.value))}
              placeholder="MM/AA"
              maxLength={5}
              className={inputCls(!!errors.expiry)}
              disabled={isProcessing}
            />
            {errors.expiry && <p className="mt-1 text-xs text-alarm">{errors.expiry}</p>}
          </div>

          <div>
            <label className="block type-field mb-1">
              CVV *
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={card.cvv}
              onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="···"
              maxLength={4}
              className={inputCls(!!errors.cvv)}
              onFocus={() => setCvvFocused(true)}
              onBlur={() => setCvvFocused(false)}
              disabled={isProcessing}
            />
            {errors.cvv && <p className="mt-1 text-xs text-alarm">{errors.cvv}</p>}
          </div>
        </div>
      </div>

      {/* Decline error */}
      {status === 'declined' && declineMsg && (
        <div className="bg-transparent border border-alarm px-4 py-3 text-sm text-alarm font-medium">
          {declineMsg}
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="bg-form-wash border border-form-rule px-4 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-form border-t-transparent animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-form-deep">{PROCESSING_STEPS[processingStep]}</p>
            <p className="text-xs text-form mt-0.5">No cierres esta ventana</p>
          </div>
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full py-4 bg-ink hover:bg-form-deep disabled:opacity-60 disabled:cursor-not-allowed text-paper font-bold transition-colors flex items-center justify-center gap-2"
      >
        <LockClosedIcon className="w-4 h-4" />
        {isProcessing ? 'Procesando pago…' : `Pagar ${formatPrice(amount)}`}
      </button>

      {!isProcessing && (
        <button
          onClick={onBack}
          className="w-full py-2.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
        >
          ← Volver a la dirección
        </button>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
        <LockClosedIcon className="w-3.5 h-3.5" />
        <span>Pago simulado seguro — KicksControl Portfolio Demo</span>
      </div>
    </div>
  )
}
