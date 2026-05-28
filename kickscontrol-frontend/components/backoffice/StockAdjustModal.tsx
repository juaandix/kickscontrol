'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminAdjustStock } from '@/lib/admin'
import type { ProductVariant } from '@/types'

const REASONS = ['RECEPCIÓN', 'AJUSTE', 'MERMA', 'DEVOLUCIÓN']

interface Props {
  variant: ProductVariant & { productName?: string }
  onClose: () => void
}

export function StockAdjustModal({ variant, onClose }: Props) {
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState(REASONS[0])
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => adminAdjustStock(variant.id, { delta, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['low-stock'] })
      onClose()
    },
  })

  const newStock = variant.stockQuantity + delta
  const isValid = delta !== 0 && newStock >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-neutral-900 mb-1">Ajuste de stock</h2>
        <p className="text-sm text-neutral-500 mb-6">
          {variant.productName ?? ''} — {variant.size} / {variant.color}
          <span className="ml-2 font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">{variant.sku}</span>
        </p>

        <div className="space-y-4">
          {/* Stock visual */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
            <div className="text-center">
              <p className="text-xs text-neutral-400">Actual</p>
              <p className="text-xl font-bold text-neutral-900">{variant.stockQuantity}</p>
            </div>
            <div className="text-2xl text-neutral-300">→</div>
            <div className="text-center">
              <p className="text-xs text-neutral-400">Nuevo</p>
              <p className={`text-xl font-bold ${newStock < 0 ? 'text-red-500' : 'text-orange-500'}`}>
                {newStock}
              </p>
            </div>
          </div>

          {/* Delta */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Cantidad (positivo = entrada, negativo = salida)
            </label>
            <input
              type="number"
              value={delta}
              onChange={e => setDelta(Number(e.target.value))}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Motivo</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {REASONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {newStock < 0 && (
            <p className="text-xs text-red-500">El stock resultante no puede ser negativo.</p>
          )}

          {mutation.isError && (
            <p className="text-xs text-red-500">Error al ajustar el stock. Inténtalo de nuevo.</p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-neutral-300 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!isValid || mutation.isPending}
            className="flex-1 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? 'Guardando...' : 'Confirmar ajuste'}
          </button>
        </div>
      </div>
    </div>
  )
}
