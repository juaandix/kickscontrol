'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProduct } from '@/lib/products'
import { formatPrice, isApparel, sortSizes } from '@/lib/sheet'
import type { Product, ProductVariant } from '@/types'
import { Units } from '@/components/backoffice/ui'

interface Props {
  /** A search/catalog result: a summary without sizes; the full product is fetched here */
  product: Product
  onBack: () => void
  backLabel: string
  hint: string
  /** Units still free to take, when some are already spoken for (the till's ticket) */
  available?: (v: ProductVariant) => number
  /** Makes each size a button (the till); without it the grid is read-only (the catalog) */
  onPick?: (product: Product, v: ProductVariant) => void
}

/** One model and what is left of it: sizes as columns, colourways as rows, units in each cell. */
export function ProductSizes({ product: summary, onBack, backLabel, hint, available = v => v.stockQuantity, onPick }: Props) {
  const full = useQuery({ queryKey: ['store-product', summary.id], queryFn: () => fetchProduct(summary.id) })
  const product = full.data ?? summary
  const variants = useMemo(() => full.data?.variants ?? [], [full.data])
  const sizes = sortSizes([...new Set(variants.map(v => v.size))])
  const colors = [...new Set(variants.map(v => v.color))]
  const cell = useMemo(() => new Map(variants.map(v => [`${v.color}|${v.size}`, v])), [variants])

  const box = 'flex h-14 w-16 flex-col items-center justify-center border border-form-rule bg-paper'

  return (
    <div>
      <button onClick={onBack} className="type-label text-ink-soft hover:text-ink">← {backLabel}</button>
      <div className="mt-3 flex items-center gap-4">
        <div className="tile size-20 shrink-0 overflow-hidden">
          {product.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="on-paper size-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="type-label text-ink-soft">{product.brand}</p>
          <h2 className="type-name text-2xl">{product.name}</h2>
          <p className="mt-1 text-sm tabular-nums">{formatPrice(Number(product.basePrice))}</p>
        </div>
      </div>

      <p className="type-label mt-6 mb-2 text-ink-soft">{isApparel(product) ? 'Tallas' : 'Tallas EU'} · {hint}</p>
      {full.isPending && <p className="type-label text-ink-soft">Mirando el almacén…</p>}
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th><span className="sr-only">Color</span></th>
              {sizes.map(s => <th key={s} className="type-label px-1 pb-1.5 text-center font-normal text-ink-soft">{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {colors.map(color => (
              <tr key={color}>
                <th scope="row" className="max-w-[10rem] truncate pr-3 text-left text-sm font-medium">{color}</th>
                {sizes.map(size => {
                  const v = cell.get(`${color}|${size}`)
                  const left = v ? available(v) : 0
                  return (
                    <td key={size} className="p-0.5">
                      {!v ? (
                        <span className="flex h-14 w-16 items-center justify-center text-ink-soft/40">·</span>
                      ) : onPick ? (
                        <button
                          onClick={() => onPick(product, v)}
                          disabled={left <= 0}
                          aria-label={`Talla ${size}, ${color}: ${left} disponibles`}
                          className={`press ${box} hover:border-ink disabled:cursor-not-allowed disabled:bg-form-wash`}
                        >
                          <span className="text-sm font-semibold">{size}</span>
                          <Units n={left} />
                        </button>
                      ) : (
                        <div aria-label={`Talla ${size}, ${color}: ${left} en almacén`} className={`${box} ${left <= 0 ? 'bg-form-wash' : ''}`}>
                          <span className="text-sm font-semibold">{size}</span>
                          <Units n={left} />
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
