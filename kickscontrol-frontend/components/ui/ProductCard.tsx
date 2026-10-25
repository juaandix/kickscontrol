'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ViewTransition } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProduct } from '@/lib/products'
import { LOW_STOCK, formatPrice, hasBackdrop, rawImage, sortSizes, productImage } from '@/lib/sheet'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  /** Morph the photo into the product page; only one grid on a page may claim a product */
  morph?: boolean
}

/** A product in the grid: photo on its tile, small captions, and its sizes in stock on hover. */
export function ProductCard({ product, morph = false }: ProductCardProps) {
  const totalStock = product.totalStock ?? 0
  const isOutOfStock = totalStock === 0
  const isLow = !isOutOfStock && totalStock <= LOW_STOCK

  // The list endpoint omits variants; the detail is shared with the product page cache.
  const { data: detail } = useQuery({
    queryKey: ['product', product.id],
    queryFn: () => fetchProduct(product.id),
    staleTime: 30_000,
  })
  const unitsBySize = new Map<string, number>()
  for (const v of detail?.variants ?? []) {
    if (v.isActive) unitsBySize.set(v.size, (unitsBySize.get(v.size) ?? 0) + v.stockQuantity)
  }
  const sizesInStock = sortSizes([...unitsBySize.keys()]).filter(size => unitsBySize.get(size)! > 0)

  const tile = (
    <div className="tile tile-zoom relative aspect-square overflow-hidden">
      {product.imageUrl && (
        <Image
          src={productImage(product.imageUrl)}
          alt={product.name}
          fill
          unoptimized={rawImage(product.imageUrl)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`on-paper ${hasBackdrop(product.imageUrl) ? 'object-cover' : 'object-contain p-6'} ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
        />
      )}
      {(isOutOfStock || isLow) && (
        <span className={`absolute top-3 left-3 text-[0.6875rem] font-semibold ${isOutOfStock ? 'text-ink-soft' : 'text-alarm'}`}>
          {isOutOfStock ? 'Agotado' : 'Últimas unidades'}
        </span>
      )}
    </div>
  )

  return (
    <Link href={`/products/${product.id}`} className="group block">
      {morph ? <ViewTransition name={`shoe-${product.id}`} share="morph">{tile}</ViewTransition> : tile}

      <div className="pt-3 text-sm">
        <p className="text-xs text-ink-soft">{product.brand}</p>
        <h3 className="mt-0.5 font-medium">{product.name}</h3>
        <div className="relative mt-1 h-5">
          <p className="card-price absolute inset-0">{formatPrice(product.basePrice)}</p>
          <p className="card-sizes absolute inset-0 truncate text-xs leading-5 text-ink-soft" aria-label="Tallas con stock">
            {sizesInStock.length > 0
              ? <>Tallas: {sizesInStock.map(s => (
                  <span key={s} className={unitsBySize.get(s)! <= LOW_STOCK ? 'text-alarm' : 'text-ink'}>{s} </span>
                ))}</>
              : detail ? 'Sin stock' : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}
