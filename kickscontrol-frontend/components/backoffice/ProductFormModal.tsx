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
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Props {
  product?: Product | null
  onClose: () => void
}

const GENDERS = ['HOMBRE', 'MUJER', 'UNISEX', 'NIÑO']
const CATEGORIES = ['RUNNING', 'BASKETBALL', 'LIFESTYLE', 'TRAINING', 'SKATE']
const SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48']

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
    gender: product?.gender ?? 'HOMBRE',
    category: product?.category ?? 'LIFESTYLE',
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

  function addVariant() {
    if (!variantForm.size || !variantForm.color || !variantForm.sku) return
    setPendingVariants(prev => [...prev, { ...variantForm, _key: variantKey }])
    setVariantKey(k => k + 1)
    setVariantForm(emptyVariant())
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
    isEdit ? updateMutation.mutate() : createMutation.mutate()
  }

  const inputCls =
    'w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400'
  const labelCls = 'block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0">
          <h2 className="text-lg font-black text-neutral-900">
            {isEdit ? `Editar · ${product.name}` : 'Nuevo producto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-8">

          {/* ── Datos del producto ── */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Datos del producto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nombre *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Nike Air Max 90"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Marca *</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={e => setField('brand', e.target.value)}
                  placeholder="Nike"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Precio base (€) *</label>
                <input
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
                <label className={labelCls}>Género</label>
                <select
                  value={form.gender}
                  onChange={e => setField('gender', e.target.value)}
                  className={inputCls}
                >
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Categoría</label>
                <select
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  className={inputCls}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>URL de imagen</label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={e => setField('imageUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  rows={3}
                  placeholder="Describe el producto..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </section>

          {/* ── Variantes ── */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Variantes{!isEdit && ' *'}
              </h3>
              {isEdit && (
                <span className="text-xs text-neutral-400">
                  El stock de variantes existentes se ajusta desde la tabla de inventario
                </span>
              )}
            </div>

            {/* Existing variants (edit mode only) */}
            {isEdit && (product.variants?.length ?? 0) > 0 && (
              <div className="rounded-xl border border-neutral-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-neutral-50 text-neutral-400 font-semibold uppercase">
                    <tr>
                      <th className="text-left px-3 py-2">Talla</th>
                      <th className="text-left px-3 py-2">Color</th>
                      <th className="text-left px-3 py-2 hidden sm:table-cell">SKU</th>
                      <th className="text-right px-3 py-2">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {product.variants!.map(v => (
                      <tr key={v.id} className="text-neutral-700">
                        <td className="px-3 py-2 font-bold">{v.size}</td>
                        <td className="px-3 py-2">{v.color}</td>
                        <td className="px-3 py-2 font-mono text-neutral-400 hidden sm:table-cell">{v.sku}</td>
                        <td className="px-3 py-2 text-right">{v.stockQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pending new variants */}
            {pendingVariants.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
                <p className="text-xs font-semibold text-orange-600 px-3 pt-3 pb-1">
                  {pendingVariants.length} variante{pendingVariants.length > 1 ? 's' : ''} a crear
                </p>
                <table className="w-full text-xs">
                  <thead className="text-orange-400 font-semibold uppercase">
                    <tr>
                      <th className="text-left px-3 py-1.5">Talla</th>
                      <th className="text-left px-3 py-1.5">Color</th>
                      <th className="text-left px-3 py-1.5 hidden sm:table-cell">SKU</th>
                      <th className="text-right px-3 py-1.5">Stock</th>
                      <th className="px-3 py-1.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100">
                    {pendingVariants.map(v => (
                      <tr key={v._key}>
                        <td className="px-3 py-2 font-bold">{v.size}</td>
                        <td className="px-3 py-2">{v.color}</td>
                        <td className="px-3 py-2 font-mono text-neutral-400 hidden sm:table-cell">{v.sku}</td>
                        <td className="px-3 py-2 text-right">{v.stockQuantity}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeVariant(v._key)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add variant form */}
            <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 space-y-3">
              <p className="text-xs font-semibold text-neutral-500">Añadir variante</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Talla</label>
                  <select
                    value={variantForm.size}
                    onChange={e => setVariantForm(p => ({ ...p, size: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">— Elige —</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Color</label>
                  <input
                    type="text"
                    value={variantForm.color}
                    onChange={e => setVariantForm(p => ({ ...p, color: e.target.value }))}
                    placeholder="Negro"
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">SKU</label>
                  <input
                    type="text"
                    value={variantForm.sku}
                    onChange={e => setVariantForm(p => ({ ...p, sku: e.target.value }))}
                    placeholder="NK-AM90-42-NGR"
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Stock inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={variantForm.stockQuantity}
                    onChange={e => setVariantForm(p => ({ ...p, stockQuantity: parseInt(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500 mb-1 block">Mod. precio (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={variantForm.priceModifier}
                    onChange={e => setVariantForm(p => ({ ...p, priceModifier: parseFloat(e.target.value) || 0 }))}
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    disabled={!variantForm.size || !variantForm.color || !variantForm.sku}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Añadir
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <p className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors"
            >
              {isPending
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
