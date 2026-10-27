'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAdjustStock } from '@/lib/admin'
import type { ProductVariant } from '@/types'
import { Barcode } from '@/components/brand/Barcode'
import { Modal, FormError, btnGhost, btnPrimary, inputCls, labelCls } from './ui'

// Why units come in or go out on the shop floor; a loss counts against the shelf
const REASONS = [
  { value: 'RECEPCIÓN', label: 'Recepción', sign: 1 },
  { value: 'DEVOLUCIÓN', label: 'Devolución', sign: 1 },
  { value: 'AJUSTE', label: 'Recuento', sign: 0 },
  { value: 'MERMA', label: 'Merma', sign: -1 },
]

const STEPS = [-5, -1, 1, 5, 12]

interface Props {
  variant: ProductVariant & { productName?: string }
  onClose: () => void
}

export function StockAdjustModal({ variant, onClose }: Props) {
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState(REASONS[0].value)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => adminAdjustStock(variant.id, { delta, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] })
      onClose()
    },
  })

  const newStock = variant.stockQuantity + delta
  const sign = REASONS.find(r => r.value === reason)?.sign ?? 0
  const signMismatch = delta !== 0 && sign !== 0 && Math.sign(delta) !== sign
  const isValid = delta !== 0 && newStock >= 0 && !signMismatch

  return (
    <Modal title={variant.productName ?? 'Ajuste de stock'} kicker="Ajuste de stock" onClose={onClose}>
      <div className="space-y-5 overflow-y-auto px-5 py-5">
        {/* The box end label of the variant being counted */}
        <div className="flex items-center justify-between gap-4 border border-ink px-4 py-3">
          <div className="min-w-0">
            <p className="type-label">Talla {variant.size} · {variant.color}</p>
            <p className="type-label mt-1 text-ink-soft">{variant.sku}</p>
          </div>
          <Barcode code={variant.sku} className="h-8" />
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center text-center">
          <div>
            <p className="type-field">En estantería</p>
            <p className="type-name mt-1 text-3xl tabular-nums">{variant.stockQuantity}</p>
          </div>
          <span className="type-label text-ink-soft" aria-hidden>→</span>
          <div>
            <p className="type-field">Tras el ajuste</p>
            <p className={`type-name mt-1 text-3xl tabular-nums ${newStock < 0 ? 'text-alarm' : ''}`}>{newStock}</p>
          </div>
        </div>

        <div>
          <label htmlFor="adjust-delta" className={labelCls}>Unidades (+ entran, − salen)</label>
          <div className="flex gap-2">
            <input id="adjust-delta" type="number" value={delta} onChange={e => setDelta(Number(e.target.value))} className={`${inputCls} type-label text-sm`} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STEPS.map(s => (
              <button key={s} type="button" onClick={() => setDelta(d => d + s)} className="press type-label h-8 border border-form-rule px-2.5 hover:border-ink">
                {s > 0 ? `+${s}` : `−${-s}`}
              </button>
            ))}
            <button type="button" onClick={() => setDelta(0)} className="press type-label h-8 px-2.5 text-ink-soft hover:text-ink">Borrar</button>
          </div>
        </div>

        <fieldset>
          <legend className={labelCls}>Motivo</legend>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {REASONS.map(r => (
              <label key={r.value} className={`press flex h-10 cursor-pointer items-center justify-center border text-sm font-medium ${reason === r.value ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'}`}>
                <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} className="sr-only" />
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        {newStock < 0 && <FormError>No puedes sacar más unidades de las que hay en la estantería.</FormError>}
        {signMismatch && <FormError>{sign > 0 ? 'Una recepción o devolución suma unidades.' : 'Una merma resta unidades.'}</FormError>}
        {mutation.isError && <FormError>No se pudo guardar el ajuste. Inténtalo de nuevo.</FormError>}
      </div>

      <div className="flex gap-2 border-t border-form-rule px-5 py-4">
        <button type="button" onClick={onClose} className={`${btnGhost} flex-1`}>Cancelar</button>
        <button type="button" onClick={() => mutation.mutate()} disabled={!isValid || mutation.isPending} className={`${btnPrimary} flex-1`}>
          {mutation.isPending ? 'Guardando…' : 'Confirmar ajuste'}
        </button>
      </div>
    </Modal>
  )
}
