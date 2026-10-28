'use client'

import { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetchProducts, adminDeleteProduct } from '@/lib/admin'
import { StockAdjustModal } from '@/components/backoffice/StockAdjustModal'
import { ProductFormModal } from '@/components/backoffice/ProductFormModal'
import { fullName } from '@/components/backoffice/LowStockPanel'
import { PageHead, Skeleton, Units, btnIcon, btnPrimary, inputCls } from '@/components/backoffice/ui'
import { LOW_STOCK, PRODUCT_TYPE_LABEL, formatPrice, isApparel, sortSizes, styleCode } from '@/lib/sheet'
import type { Product, ProductVariant } from '@/types'
import { ChevronDownIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

type FormTarget = 'new' | Product | null
type TypeFilter = '' | 'FOOTWEAR' | 'APPAREL'

const units = new Intl.NumberFormat('es-ES')

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adjustVariant, setAdjustVariant] = useState<(ProductVariant & { productName: string }) | null>(null)
  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminFetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const q = search.trim().toLowerCase()
  const filtered = products.filter(p =>
    (!type || (type === 'APPAREL') === isApparel(p)) &&
    (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
  )
  const shelfTotal = products.reduce((s, p) => s + (p.variants ?? []).reduce((t, v) => t + v.stockQuantity, 0), 0)

  return (
    <div className="space-y-6">
      <PageHead kicker={`${products.length} referencias · ${units.format(shelfTotal)} unidades en almacén`} title="Inventario">
        <button onClick={() => setFormTarget('new')} className={btnPrimary}>
          <PlusIcon className="size-4" />
          Nuevo producto
        </button>
      </PageHead>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Buscar por nombre o marca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={`${inputCls} sm:w-80`}
          aria-label="Buscar en el inventario"
        />
        <div role="group" aria-label="Tipo de producto" className="flex border border-form-rule">
          {([['', 'Todo'], ['FOOTWEAR', 'Calzado'], ['APPAREL', 'Ropa']] as [TypeFilter, string][]).map(([v, l]) => (
            <button key={l} onClick={() => setType(v)} aria-pressed={type === v} className={`press h-10 flex-1 px-4 text-sm font-medium sm:flex-none ${type === v ? 'bg-ink text-paper' : 'hover:bg-form-wash'}`}>
              {l}
            </button>
          ))}
        </div>
        <p className="type-label text-ink-soft sm:ml-auto">{filtered.length} resultados</p>
      </div>

      {isLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-ink">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-form-rule text-left">
                <th className="type-field py-2.5 pr-3 font-semibold">Producto</th>
                <th className="type-field hidden px-3 py-2.5 font-semibold lg:table-cell">Categoría</th>
                <th className="type-field px-3 py-2.5 text-right font-semibold">Precio base</th>
                <th className="type-field px-3 py-2.5 text-right font-semibold">En almacén</th>
                <th className="py-2.5 pl-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const variants = product.variants ?? []
                const totalStock = variants.reduce((s, v) => s + v.stockQuantity, 0)
                const out = variants.filter(v => v.stockQuantity === 0).length
                const low = variants.filter(v => v.stockQuantity > 0 && v.stockQuantity <= LOW_STOCK).length
                const isExpanded = expandedId === product.id
                const toggle = () => setExpandedId(isExpanded ? null : product.id)

                return (
                  <Fragment key={product.id}>
                    <tr className={`cursor-pointer border-b border-form-rule ${isExpanded ? 'bg-form-wash' : 'hover:bg-form-wash'}`} onClick={toggle}>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="tile size-12 shrink-0 overflow-hidden">
                            {product.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.imageUrl} alt="" loading="lazy" className="on-paper size-full object-cover" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); toggle() }}
                              aria-expanded={isExpanded}
                              className="flex items-center gap-1.5 text-left font-semibold"
                            >
                              {product.name}
                              <ChevronDownIcon className={`size-3.5 shrink-0 text-ink-soft transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <p className="type-label mt-0.5 text-ink-soft">
                              {product.brand} · {styleCode(variants) ?? '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 text-ink-soft lg:table-cell">
                        {product.category} · {PRODUCT_TYPE_LABEL[product.productType ?? 'FOOTWEAR']}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{formatPrice(product.basePrice)}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="type-label text-[0.8125rem] font-bold tabular-nums">{units.format(totalStock)}</span>
                        {(out > 0 || low > 0) && (
                          <span className="type-label mt-0.5 block text-[0.625rem] text-alarm">
                            {[out > 0 && `${out} ${out === 1 ? 'agotada' : 'agotadas'}`, low > 0 && `${low} ${low === 1 ? 'baja' : 'bajas'}`].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3">
                        <div className="flex items-center justify-end gap-0.5" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setFormTarget(product)} className={btnIcon} title="Editar" aria-label={`Editar ${product.name}`}>
                            <PencilSquareIcon className="size-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Desactivar "${product.name}"? Dejará de verse en la tienda.`)) deleteMutation.mutate(product.id)
                            }}
                            className={`${btnIcon} hover:text-alarm`}
                            title="Desactivar"
                            aria-label={`Desactivar ${product.name}`}
                          >
                            <TrashIcon className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-b border-ink bg-form-wash">
                        <td colSpan={5} className="px-0 pt-1 pb-5">
                          <StockMatrix product={product} onAdjust={v => setAdjustVariant({ ...v, productName: fullName(product) })} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-ink-soft">No hay nada en el almacén que coincida con «{search}».</p>
          )}
        </div>
      )}

      {adjustVariant && <StockAdjustModal variant={adjustVariant} onClose={() => setAdjustVariant(null)} />}

      {formTarget !== null && (
        <ProductFormModal product={formTarget === 'new' ? null : formTarget} onClose={() => setFormTarget(null)} />
      )}
    </div>
  )
}

/** The shelf of one model: a row per colourway, a column per size, each cell the units in that box. */
function StockMatrix({ product, onAdjust }: { product: Product; onAdjust: (v: ProductVariant) => void }) {
  const variants = product.variants ?? []
  if (variants.length === 0) return <p className="px-4 py-4 text-sm text-ink-soft">Este producto no tiene variantes todavía.</p>

  const sizes = sortSizes([...new Set(variants.map(v => v.size))])
  const colors = [...new Set(variants.map(v => v.color))]
  const cell = new Map(variants.map(v => [`${v.color}|${v.size}`, v]))

  return (
    <div className="overflow-x-auto px-1">
      <table className="text-sm">
        <caption className="type-label px-2 pt-3 pb-2 text-left text-ink-soft">
          {isApparel(product) ? 'Tallas' : 'Tallas EU'} × colores · pulsa una caja para ajustar su stock
        </caption>
        <thead>
          <tr>
            <th className="sticky left-0 bg-form-wash px-2 py-1.5 text-left"><span className="sr-only">Color</span></th>
            {sizes.map(s => <th key={s} className="type-label w-14 px-1 py-1.5 text-center font-normal text-ink-soft">{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {colors.map(color => (
            <tr key={color}>
              <th scope="row" className="sticky left-0 max-w-[11rem] truncate bg-form-wash px-2 py-1 text-left font-medium">{color}</th>
              {sizes.map(size => {
                const v = cell.get(`${color}|${size}`)
                return (
                  <td key={size} className="p-0.5">
                    {v ? (
                      <button
                        onClick={() => onAdjust(v)}
                        title={`${v.sku}${v.priceModifier > 0 ? ` · +${v.priceModifier} €` : ''}`}
                        aria-label={`Talla ${size}, ${color}: ${v.stockQuantity} unidades. Ajustar`}
                        className={`press flex h-10 w-14 items-center justify-center border bg-paper hover:border-ink ${v.stockQuantity === 0 ? 'border-alarm/40' : 'border-form-rule'}`}
                      >
                        <Units n={v.stockQuantity} />
                      </button>
                    ) : (
                      <span className="flex h-10 w-14 items-center justify-center text-ink-soft/50" aria-label="Sin variante">·</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
