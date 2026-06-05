'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchProduct } from '@/lib/products'
import { StockBadge } from '@/components/ui/StockBadge'
import { useCart } from '@/context/CartContext'
import type { ProductVariant } from '@/types'

interface Props {
  id: number
}

export function ProductDetailClient({ id }: Props) {
  const router = useRouter()
  const { addItem } = useCart()
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [adding, setAdding] = useState(false)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  })

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-10 animate-pulse">
        <div className="aspect-square bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return <div className="py-16 text-center text-neutral-500 dark:text-neutral-400">Producto no encontrado.</div>
  }

  const activeVariants = product.variants.filter(v => v.isActive)
  const colors = [...new Set(activeVariants.map(v => v.color))]
  const sizes = [...new Set(activeVariants.map(v => v.size))].sort((a, b) => Number(a) - Number(b))

  const getVariant = (size: string, color: string) =>
    activeVariants.find(v => v.size === size && v.color === color) ?? null

  const currentColor = selectedVariant?.color ?? colors[0]
  const currentSize = selectedVariant?.size ?? null

  const handleSizeClick = (size: string) => setSelectedVariant(getVariant(size, currentColor))
  const handleColorClick = (color: string) =>
    setSelectedVariant(currentSize ? getVariant(currentSize, color) : null)

  const effectiveVariant = selectedVariant ?? getVariant(currentSize ?? '', currentColor)
  const finalPrice = product.basePrice + (selectedVariant?.priceModifier ?? 0)

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 mb-6 flex items-center gap-1"
      >
        ← Volver al catálogo
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-8xl overflow-hidden">
          {product.imageUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : '👟'}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">{product.brand}</p>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-white mt-1 leading-tight">{product.name}</h1>
            <p className="text-4xl font-black text-neutral-900 dark:text-white mt-3">
              {finalPrice.toFixed(2)} <span className="text-2xl font-bold text-neutral-500 dark:text-neutral-400">€</span>
            </p>
          </div>

          {product.description && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{product.description}</p>
          )}

          {/* Color selector */}
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
              Color: <span className="font-normal text-neutral-500 dark:text-neutral-400">{currentColor}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button key={color} onClick={() => handleColorClick(color)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    color === currentColor
                      ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500 text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800'
                  }`}>
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-200 mb-2">
              Talla (EU)
              {currentSize && <span className="font-normal text-neutral-500 dark:text-neutral-400 ml-1">— {currentSize}</span>}
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => {
                const variant = getVariant(size, currentColor)
                const hasStock = (variant?.stockQuantity ?? 0) > 0
                const isSelected = currentSize === size
                return (
                  <button key={size} onClick={() => handleSizeClick(size)}
                    disabled={!variant || !hasStock}
                    className={`relative w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl border text-sm font-bold transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white shadow-md scale-105'
                        : hasStock
                          ? 'border-neutral-300 dark:border-neutral-600 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 text-neutral-900 dark:text-white bg-white dark:bg-neutral-800'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 dark:text-neutral-600 bg-neutral-50 dark:bg-neutral-900 cursor-not-allowed opacity-50'
                    }`}>
                    {size}
                    {!hasStock && variant && (
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="block w-full h-px bg-neutral-400 rotate-45 opacity-60" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {effectiveVariant && (
            <div className="flex items-center gap-2">
              <StockBadge stock={effectiveVariant.stockQuantity} />
              {effectiveVariant.stockQuantity > 0 && (
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{effectiveVariant.stockQuantity} disponibles</span>
              )}
            </div>
          )}

          <button
            disabled={!selectedVariant || selectedVariant.stockQuantity === 0 || adding}
            onClick={async () => {
              if (!selectedVariant) return
              setAdding(true)
              try { await addItem(selectedVariant.id, 1) } finally { setAdding(false) }
            }}
            className="w-full py-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-700 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? 'Añadiendo...'
              : !selectedVariant ? 'Selecciona una talla'
              : selectedVariant.stockQuantity === 0 ? 'Sin stock'
              : 'Añadir al carrito'}
          </button>
        </div>
      </div>
    </div>
  )
}
