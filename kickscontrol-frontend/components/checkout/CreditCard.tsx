'use client'

import { getCardType } from '@/lib/payment'

interface Props {
  number: string
  name: string
  expiry: string
  cvv: string
  flipped: boolean
}

function CardChip() {
  return (
    <svg width="40" height="30" viewBox="0 0 40 30" fill="none">
      <rect width="40" height="30" rx="4" fill="#D4A843" />
      <rect x="1" y="1" width="38" height="28" rx="3" fill="none" stroke="#B8902F" strokeWidth="0.5" />
      <line x1="0" y1="10" x2="40" y2="10" stroke="#B8902F" strokeWidth="0.5" />
      <line x1="0" y1="20" x2="40" y2="20" stroke="#B8902F" strokeWidth="0.5" />
      <line x1="13" y1="0" x2="13" y2="30" stroke="#B8902F" strokeWidth="0.5" />
      <line x1="27" y1="0" x2="27" y2="30" stroke="#B8902F" strokeWidth="0.5" />
    </svg>
  )
}

function VisaLogo() {
  return (
    <span className="text-white font-black text-2xl italic tracking-tighter">VISA</span>
  )
}

function MastercardLogo() {
  return (
    <div className="flex">
      <div className="w-8 h-8 rounded-full bg-red-500 opacity-90" />
      <div className="w-8 h-8 rounded-full bg-yellow-400 opacity-90 -ml-4" />
    </div>
  )
}

function AmexLogo() {
  return (
    <span className="text-white font-black text-sm tracking-widest">AMEX</span>
  )
}

function NetworkLogo({ type }: { type: string }) {
  if (type === 'visa') return <VisaLogo />
  if (type === 'mastercard') return <MastercardLogo />
  if (type === 'amex') return <AmexLogo />
  return null
}

function formatDisplay(number: string): string {
  const clean = number.replace(/\s/g, '')
  const padded = clean.padEnd(16, '·')
  return [padded.slice(0, 4), padded.slice(4, 8), padded.slice(8, 12), padded.slice(12, 16)].join('  ')
}

const CARD_GRADIENTS: Record<string, string> = {
  visa: 'from-blue-800 via-blue-700 to-indigo-800',
  mastercard: 'from-neutral-800 via-neutral-700 to-neutral-900',
  amex: 'from-green-800 via-emerald-700 to-teal-900',
  unknown: 'from-neutral-800 via-neutral-700 to-neutral-900',
}

export function CreditCard({ number, name, expiry, cvv, flipped }: Props) {
  const cardType = getCardType(number)
  const gradient = CARD_GRADIENTS[cardType]

  return (
    <div className="w-full max-w-sm mx-auto" style={{ perspective: '1000px', height: '196px' }}>
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-2xl flex flex-col justify-between overflow-hidden`}
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Shimmer */}
          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white via-transparent to-transparent" />

          {/* Top row */}
          <div className="flex items-start justify-between relative z-10">
            <CardChip />
            <NetworkLogo type={cardType} />
          </div>

          {/* Card number */}
          <div className="relative z-10">
            <p className="font-mono text-white text-xl tracking-widest select-none">
              {formatDisplay(number)}
            </p>
          </div>

          {/* Bottom row */}
          <div className="flex items-end justify-between relative z-10">
            <div>
              <p className="text-xs text-white/80 uppercase tracking-widest mb-0.5">Titular</p>
              <p className="text-sm font-semibold text-white tracking-wide truncate max-w-[160px]">
                {name || 'NOMBRE APELLIDOS'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/80 uppercase tracking-widest mb-0.5">Caduca</p>
              <p className="text-sm font-semibold text-white font-mono">
                {expiry || 'MM/AA'}
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl flex flex-col justify-center overflow-hidden`}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Magnetic strip */}
          <div className="w-full h-12 bg-black/70 mb-5" />

          {/* CVV area */}
          <div className="px-6 flex items-center gap-4">
            <div className="flex-1 h-10 bg-white/90 rounded-md" />
            <div className="text-right">
              <p className="text-xs text-white/80 uppercase tracking-widest mb-1">CVV</p>
              <p className="text-white font-mono text-lg font-bold tracking-widest">
                {cvv ? cvv.replace(/./g, '·') : '···'}
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 right-5">
            <NetworkLogo type={cardType} />
          </div>
        </div>
      </div>
    </div>
  )
}
