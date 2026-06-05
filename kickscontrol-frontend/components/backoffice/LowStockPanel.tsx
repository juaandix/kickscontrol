'use client'

import { useQuery } from '@tanstack/react-query'
import { adminGetLowStock } from '@/lib/admin'
import { ExclamationTriangleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export function LowStockPanel() {
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => adminGetLowStock(5),
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 space-y-3">
        <div className="h-5 w-40 bg-neutral-200 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-neutral-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (variants.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-neutral-400" />
          <h3 className="font-bold text-neutral-700">Alertas de stock bajo</h3>
        </div>
        <p className="text-sm text-neutral-400">Sin variantes críticas ≤ 5 uds. ✓</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-amber-800">Stock bajo</h3>
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {variants.length}
          </span>
        </div>
        <span className="text-xs text-amber-600">Variantes con ≤ 5 uds.</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Variante</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">SKU</th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Stock</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {variants.map(v => (
              <tr key={v.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-800">{v.size} · {v.color}</p>
                </td>
                <td className="px-4 py-3 text-neutral-400 font-mono text-xs hidden sm:table-cell">{v.sku}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-black ${
                      v.stockQuantity === 0
                        ? 'bg-red-100 text-red-600'
                        : v.stockQuantity <= 2
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {v.stockQuantity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                    title="Ajustar stock"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
