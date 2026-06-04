'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetchProducts, adminDeleteProduct } from '@/lib/admin'
import { StockAdjustModal } from '@/components/backoffice/StockAdjustModal'
import { ProductFormModal } from '@/components/backoffice/ProductFormModal'
import { StockBadge } from '@/components/ui/StockBadge'
import type { Product, ProductVariant } from '@/types'
import { PlusIcon, PencilSquareIcon, AdjustmentsHorizontalIcon, TrashIcon } from '@heroicons/react/24/outline'

type FormTarget = 'new' | Product | null

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [adjustVariant, setAdjustVariant] = useState<(ProductVariant & { productName: string }) | null>(null)
  const [formTarget, setFormTarget] = useState<FormTarget>(null)
  const [search, setSearch] = useState('')

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminFetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  })

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 bg-neutral-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Inventario</h1>
          <p className="text-sm text-neutral-500">{products.length} productos en el sistema</p>
        </div>
        <button
          onClick={() => setFormTarget('new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar por nombre o marca..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full sm:w-72 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden md:table-cell">Marca</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden lg:table-cell">Categoría</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-600">Precio base</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-600">Stock total</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.map(product => {
              const totalStock = product.variants?.reduce((s, v) => s + v.stockQuantity, 0) ?? 0
              const isExpanded = expandedId === product.id

              return (
                <>
                  <tr
                    key={product.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : product.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-neutral-900">{product.name}</span>
                        <StockBadge stock={totalStock} lowThreshold={10} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{product.brand}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">{product.category}</td>
                    <td className="px-4 py-3 text-right font-mono">{product.basePrice?.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${totalStock === 0 ? 'text-red-500' : totalStock <= 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setFormTarget(product)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Desactivar "${product.name}"?`)) {
                              deleteMutation.mutate(product.id)
                            }
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-500 hover:text-red-500 transition-colors"
                          title="Desactivar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded variants */}
                  {isExpanded && (
                    <tr key={`${product.id}-variants`}>
                      <td colSpan={6} className="px-4 pb-4 bg-neutral-50">
                        <div className="mt-2 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-neutral-400 font-semibold uppercase tracking-wider">
                                <th className="text-left py-1.5">Talla</th>
                                <th className="text-left py-1.5">Color</th>
                                <th className="text-left py-1.5 hidden sm:table-cell">SKU</th>
                                <th className="text-right py-1.5">Stock</th>
                                <th className="text-right py-1.5">Mod. precio</th>
                                <th className="py-1.5" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                              {(product.variants ?? []).map(variant => (
                                <tr key={variant.id}>
                                  <td className="py-1.5 font-bold">{variant.size}</td>
                                  <td className="py-1.5 text-neutral-600">{variant.color}</td>
                                  <td className="py-1.5 font-mono text-neutral-400 hidden sm:table-cell">{variant.sku}</td>
                                  <td className="py-1.5 text-right">
                                    <span className={`font-bold ${variant.stockQuantity === 0 ? 'text-red-500' : variant.stockQuantity <= 5 ? 'text-orange-500' : 'text-neutral-900'}`}>
                                      {variant.stockQuantity}
                                    </span>
                                  </td>
                                  <td className="py-1.5 text-right text-neutral-500">
                                    {variant.priceModifier > 0 ? `+${variant.priceModifier}€` : '—'}
                                  </td>
                                  <td className="py-1.5">
                                    <button
                                      onClick={() => setAdjustVariant({ ...variant, productName: product.name })}
                                      className="ml-2 p-1 rounded hover:bg-neutral-200 text-neutral-500 transition-colors"
                                      title="Ajustar stock"
                                    >
                                      <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-neutral-500">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Modals */}
      {adjustVariant && (
        <StockAdjustModal
          variant={adjustVariant}
          onClose={() => setAdjustVariant(null)}
        />
      )}

      {formTarget !== null && (
        <ProductFormModal
          product={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
        />
      )}
    </div>
  )
}
