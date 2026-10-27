'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminFetchProducts, adminGetLowStock } from '@/lib/admin'
import { LOW_STOCK } from '@/lib/sheet'
import type { ProductVariant } from '@/types'
import { StockAdjustModal } from './StockAdjustModal'
import { Panel, Skeleton, Units } from './ui'

const PREVIEW = 8

/** "Nike Air Max 90", but not "Jordan Air Jordan 11" when the brand is already in the name. */
export const fullName = (p: { brand: string; name: string }) =>
  p.name.toLowerCase().includes(p.brand.toLowerCase()) ? p.name : `${p.brand} ${p.name}`

/** The restock list: every variant at or under the low-stock line, emptiest shelf first. */
export function LowStockPanel() {
  const [showAll, setShowAll] = useState(false)
  const [adjust, setAdjust] = useState<(ProductVariant & { productName: string }) | null>(null)

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => adminGetLowStock(LOW_STOCK),
    refetchInterval: 60_000,
  })
  // The alerts endpoint returns bare variants; the inventory list names them
  const { data: products = [] } = useQuery({ queryKey: ['admin-products'], queryFn: adminFetchProducts })

  const rows = useMemo(() => {
    const owner = new Map<number, string>()
    for (const p of products) for (const v of p.variants ?? []) owner.set(v.id, fullName(p))
    return [...variants]
      .sort((a, b) => a.stockQuantity - b.stockQuantity)
      .map(v => ({ ...v, productName: owner.get(v.id) ?? v.sku }))
  }, [variants, products])

  const empty = rows.filter(v => v.stockQuantity === 0).length
  const shown = showAll ? rows : rows.slice(0, PREVIEW)

  return (
    <Panel
      title="Lista de reposición"
      aside={isLoading ? null : rows.length === 0 ? `Nada ≤ ${LOW_STOCK} uds` : `${rows.length} variantes · ${empty} agotadas`}
    >
      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="px-5 py-8 text-sm text-ink-soft">Todas las tallas están por encima de {LOW_STOCK} unidades. Nada que reponer.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-form-rule text-left">
                  <th className="type-field px-4 py-2 font-semibold sm:px-5">Producto</th>
                  <th className="type-field px-3 py-2 font-semibold">Talla</th>
                  <th className="type-field hidden px-3 py-2 font-semibold md:table-cell">Color</th>
                  <th className="type-field hidden px-3 py-2 font-semibold xl:table-cell">SKU</th>
                  <th className="type-field px-3 py-2 text-right font-semibold">Uds</th>
                  <th className="px-4 py-2 sm:px-5"><span className="sr-only">Acción</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-form-rule">
                {shown.map(v => (
                  <tr key={v.id} className="hover:bg-form-wash">
                    <td className="max-w-[16rem] truncate px-4 py-2.5 font-medium sm:px-5">{v.productName}</td>
                    <td className="type-label px-3 py-2.5 text-[0.8125rem]">{v.size}</td>
                    <td className="hidden px-3 py-2.5 whitespace-nowrap text-ink-soft md:table-cell">{v.color}</td>
                    <td className="type-label hidden px-3 py-2.5 whitespace-nowrap text-ink-soft xl:table-cell">{v.sku}</td>
                    <td className="px-3 py-2.5 text-right">
                      {v.stockQuantity === 0 ? <span className="type-label font-bold text-alarm">Agotado</span> : <Units n={v.stockQuantity} />}
                    </td>
                    <td className="px-4 py-2.5 text-right sm:px-5">
                      <button onClick={() => setAdjust(v)} className="press type-label border border-form-rule px-2.5 py-1.5 hover:border-ink">
                        Reponer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > PREVIEW && (
            <button onClick={() => setShowAll(s => !s)} className="type-label w-full border-t border-form-rule px-5 py-3 text-left hover:bg-form-wash">
              {showAll ? 'Ver menos' : `Ver las ${rows.length} variantes`}
            </button>
          )}
        </>
      )}

      {adjust && <StockAdjustModal variant={adjust} onClose={() => setAdjust(null)} />}
    </Panel>
  )
}
