'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminAddVariant,
  type ProductRequestDto,
  type VariantRequestDto,
} from '@/lib/admin'
import type { Product } from '@/types'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { APPAREL_SIZES, GENDER_LABEL, PRODUCT_TYPE_LABEL, SIZE_RUN, sortSizes } from '@/lib/sheet'
import { CATEGORY_THEMES } from '@/lib/categories'
import { Modal, FormError, btnGhost, btnPrimary, btnIcon, inputCls, labelCls } from './ui'

interface Props {
  product?: Product | null
  onClose: () => void
}

// The values the store filters by: gender codes from the API, categories with their own page
const GENDERS = Object.keys(GENDER_LABEL)
const CATEGORIES = CATEGORY_THEMES.map(c => c.name)

interface VariantRow extends VariantRequestDto {
  _key: number
}

const emptyVariant = (): VariantRequestDto => ({
  size: '',
  color: '',
  sku: '',
  stockQuantity: 0,
  priceModifier: 0,
  imageUrl: '',
})

export function ProductFormModal({ product, onClose }: Props) {
  const queryClient = useQueryClient()
  const isEdit = !!product

  const [form, setForm] = useState<ProductRequestDto>({
    name: product?.name ?? '',
    brand: product?.brand ?? '',
    description: product?.description ?? '',
    gender: product?.gender ?? 'UNISEX',
    category: product?.category ?? 'Lifestyle',
    productType: product?.productType ?? 'FOOTWEAR',
    basePrice: product?.basePrice ?? 0,
    imageUrl: product?.imageUrl ?? '',
  })

  const [pendingVariants, setPendingVariants] = useState<VariantRow[]>([])
  const [variantForm, setVariantForm] = useState<VariantRequestDto>(emptyVariant())
  const [variantKey, setVariantKey] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await adminCreateProduct(form)
      for (const v of pendingVariants) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _key, ...dto } = v
        await adminAddVariant(created.id, dto)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      await adminUpdateProduct(product!.id, form)
      for (const v of pendingVariants) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _key, ...dto } = v
        await adminAddVariant(product!.id, dto)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      onClose()
    },
    onError: (e: Error) => setError(e.message),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function setField<K extends keyof ProductRequestDto>(k: K, v: ProductRequestDto[K]) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const sizes = form.productType === 'APPAREL' ? APPAREL_SIZES : SIZE_RUN
  // A size and colour already on the shelf (or queued) can't be added twice
  const taken = new Set([...(product?.variants ?? []), ...pendingVariants].map(v => `${v.color.toLowerCase()}|${v.size}`))
  const duplicate = !!variantForm.size && !!variantForm.color && taken.has(`${variantForm.color.trim().toLowerCase()}|${variantForm.size}`)
  const canAdd = !!variantForm.size && !!variantForm.color.trim() && !!variantForm.sku.trim() && !duplicate

  function addVariant() {
    if (!canAdd) return
    setPendingVariants(prev => [...prev, { ...variantForm, _key: variantKey }])
    setVariantKey(k => k + 1)
    // Keep the colourway and stock: the next row is usually the next size of the same box run
    setVariantForm(p => ({ ...emptyVariant(), color: p.color, stockQuantity: p.stockQuantity, priceModifier: p.priceModifier }))
  }

  function removeVariant(key: number) {
    setPendingVariants(prev => prev.filter(v => v._key !== key))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.brand.trim() || !form.basePrice) {
      setError('Nombre, marca y precio base son obligatorios.')
      return
    }
    if (!isEdit && pendingVariants.length === 0) {
      setError('Añade al menos una variante al producto.')
      return
    }
    if (isEdit) updateMutation.mutate()
    else createMutation.mutate()
  }


  const bySize = (a: string, b: string) => { const run = sortSizes([a, b]); return run.indexOf(a) - run.indexOf(b) }
  const existing = [...(product?.variants ?? [])].sort((a, b) => a.color.localeCompare(b.color) || bySize(a.size, b.size))

  return (
    <Modal wide title={isEdit ? product.name : 'Nuevo producto'} kicker={isEdit ? `Editar · ${product.brand}` : 'Alta en almacén'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-8 overflow-y-auto px-5 py-5">
          <section className="space-y-4">
            <h3 className="type-label text-ink-soft">01 · Ficha del producto</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="pf-name" className={labelCls}>Nombre *</label>
                <input id="pf-name" type="text" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Nike Air Max 90" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-brand" className={labelCls}>Marca *</label>
                <input id="pf-brand" type="text" value={form.brand} onChange={e => setField('brand', e.target.value)} placeholder="Nike" className={inputCls} />
              </div>

              <div>
                <label htmlFor="pf-price" className={labelCls}>Precio base (€) *</label>
                <input
                  id="pf-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.basePrice || ''}
                  onChange={e => setField('basePrice', parseFloat(e.target.value) || 0)}
                  placeholder="99.99"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="pf-type" className={labelCls}>Tipo</label>
                <select
                  id="pf-type"
                  value={form.productType}
                  onChange={e => setField('productType', e.target.value as ProductRequestDto['productType'])}
                  className={inputCls}
                  disabled={isEdit && (product.variants?.length ?? 0) > 0}
                >
                  {Object.entries(PRODUCT_TYPE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="pf-category" className={labelCls}>Categoría</label>
                <select id="pf-category" value={form.category} onChange={e => setField('category', e.target.value)} className={inputCls}>
                  {/* An older product may carry a category the store no longer lists; keep it selectable */}
                  {!CATEGORIES.includes(form.category) && <option value={form.category}>{form.category}</option>}
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="pf-gender" className={labelCls}>Género</label>
                <select id="pf-gender" value={form.gender} onChange={e => setField('gender', e.target.value)} className={inputCls}>
                  {!GENDERS.includes(form.gender) && <option value={form.gender}>{form.gender}</option>}
                  {GENDERS.map(g => <option key={g} value={g}>{GENDER_LABEL[g]}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="pf-image" className={labelCls}>URL de imagen</label>
                <input id="pf-image" type="url" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://…" className={inputCls} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="pf-description" className={labelCls}>Descripción</label>
                <textarea
                  id="pf-description"
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  rows={3}
                  placeholder="Lo que contarías en tienda: materiales, horma, para qué sirve."
                  className={`${inputCls} h-auto resize-none py-2.5`}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="type-label text-ink-soft">02 · Cajas{!isEdit && ' *'}</h3>
              {isEdit && <p className="text-xs text-ink-soft">El stock de las cajas existentes se ajusta desde la matriz del inventario.</p>}
            </div>

            {isEdit && existing.length > 0 && (
              <VariantTable rows={existing.map(v => ({ key: `e${v.id}`, ...v }))} />
            )}

            {pendingVariants.length > 0 && (
              <div>
                <p className="type-label mb-1.5">
                  {pendingVariants.length} {pendingVariants.length > 1 ? 'cajas nuevas' : 'caja nueva'} al guardar
                </p>
                <VariantTable rows={pendingVariants.map(v => ({ key: `p${v._key}`, ...v }))} onRemove={k => removeVariant(Number(k.slice(1)))} highlight />
              </div>
            )}

            <div className="border border-dashed border-ink/30 p-4">
              <p className="type-field mb-3">Añadir caja</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="vf-size" className={labelCls}>Talla</label>
                  <select id="vf-size" value={variantForm.size} onChange={e => setVariantForm(p => ({ ...p, size: e.target.value }))} className={inputCls}>
                    <option value="">— Elige —</option>
                    {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="vf-color" className={labelCls}>Color</label>
                  <input id="vf-color" type="text" value={variantForm.color} onChange={e => setVariantForm(p => ({ ...p, color: e.target.value }))} placeholder="White/Black" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="vf-sku" className={labelCls}>SKU</label>
                  <input id="vf-sku" type="text" value={variantForm.sku} onChange={e => setVariantForm(p => ({ ...p, sku: e.target.value.toUpperCase() }))} placeholder="NK-AM90-42-WB" className={`${inputCls} type-label text-[0.8125rem]`} />
                </div>
                <div>
                  <label htmlFor="vf-stock" className={labelCls}>Stock inicial</label>
                  <input id="vf-stock" type="number" min="0" value={variantForm.stockQuantity} onChange={e => setVariantForm(p => ({ ...p, stockQuantity: parseInt(e.target.value) || 0 }))} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="vf-mod" className={labelCls}>Suplemento (€)</label>
                  <input id="vf-mod" type="number" step="0.01" value={variantForm.priceModifier} onChange={e => setVariantForm(p => ({ ...p, priceModifier: parseFloat(e.target.value) || 0 }))} className={inputCls} />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={addVariant} disabled={!canAdd} className={`${btnGhost} w-full`}>
                    <PlusIcon className="size-4" />
                    Añadir
                  </button>
                </div>
              </div>
              {duplicate && <p className="mt-2 text-xs text-alarm">Ya hay una caja de la talla {variantForm.size} en {variantForm.color}.</p>}
            </div>
          </section>

          {error && <FormError>{error}</FormError>}
        </div>

        <div className="flex justify-end gap-2 border-t border-form-rule px-5 py-4">
          <button type="button" onClick={onClose} className={btnGhost}>Cancelar</button>
          <button type="submit" disabled={isPending} className={btnPrimary}>
            {isPending ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function VariantTable({ rows, onRemove, highlight = false }: {
  rows: (Pick<VariantRequestDto, 'size' | 'color' | 'sku' | 'stockQuantity'> & { key: string })[]
  onRemove?: (key: string) => void
  highlight?: boolean
}) {
  return (
    <div className={`overflow-x-auto border ${highlight ? 'border-ink' : 'border-form-rule'}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-form-rule text-left">
            <th className="type-field px-3 py-2 font-semibold">Talla</th>
            <th className="type-field px-3 py-2 font-semibold">Color</th>
            <th className="type-field hidden px-3 py-2 font-semibold sm:table-cell">SKU</th>
            <th className="type-field px-3 py-2 text-right font-semibold">Uds</th>
            {onRemove && <th className="px-3 py-2"><span className="sr-only">Quitar</span></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-form-rule">
          {rows.map(v => (
            <tr key={v.key}>
              <td className="type-label px-3 py-2 text-[0.8125rem] font-bold">{v.size}</td>
              <td className="px-3 py-2">{v.color}</td>
              <td className="type-label hidden px-3 py-2 text-ink-soft sm:table-cell">{v.sku}</td>
              <td className="type-label px-3 py-2 text-right text-[0.8125rem]">{v.stockQuantity}</td>
              {onRemove && (
                <td className="px-2 py-1 text-right">
                  <button type="button" onClick={() => onRemove(v.key)} className={`${btnIcon} hover:text-alarm`} aria-label={`Quitar talla ${v.size} ${v.color}`}>
                    <TrashIcon className="size-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
