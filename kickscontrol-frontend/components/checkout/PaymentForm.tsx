'use client'

import { useState } from 'react'
import { CreditCard } from './CreditCard'
import { formatCardNumber, formatExpiry, validateCard, simulatePayment, type PaymentData } from '@/lib/payment'
import { LockClosedIcon } from '@heroicons/react/24/solid'

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
  `w-full rounded-xl border px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-300 focus:ring-red-400 bg-red-50'
      : 'border-neutral-200 focus:ring-orange-400 bg-white'
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-0.5">
        <p className="font-semibold">Tarjetas de prueba:</p>
        <p><span className="font-mono">4242 4242 4242 4242</span> → Pago aprobado</p>
        <p><span className="font-mono">4000 0000 0000 0002</span> → Rechazada · <span className="font-mono">4000 0000 0000 9995</span> → Sin fondos</p>
        <p>CVV: cualquier 3 dígitos · Fecha: cualquier fecha futura</p>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Card number */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
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
          {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
        </div>

        {/* Cardholder name */}
        <div>
          <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
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
          {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
        </div>

        {/* Expiry + CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
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
            {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1">
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
            {errors.cvv && <p className="mt-1 text-xs text-red-500">{errors.cvv}</p>}
          </div>
        </div>
      </div>

      {/* Decline error */}
      {status === 'declined' && declineMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
          {declineMsg}
        </div>
      )}

      {/* Processing state */}
      {isProcessing && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-orange-700">{PROCESSING_STEPS[processingStep]}</p>
            <p className="text-xs text-orange-500 mt-0.5">No cierres esta ventana</p>
          </div>
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <LockClosedIcon className="w-4 h-4" />
        {isProcessing ? 'Procesando pago…' : `Pagar ${amount.toFixed(2)} €`}
      </button>

      {!isProcessing && (
        <button
          onClick={onBack}
          className="w-full py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          ← Volver a la dirección
        </button>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <LockClosedIcon className="w-3.5 h-3.5" />
        <span>Pago simulado seguro — KicksControl Portfolio Demo</span>
      </div>
    </div>
  )
}
