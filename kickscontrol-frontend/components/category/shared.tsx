'use client'

import Image from 'next/image'
import { useEffect, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'
import { hasBackdrop, productImage, rawImage } from '@/lib/sheet'
import type { Product } from '@/types'

/** Breaks a category page out of the store's padded <main> so it can own the whole canvas. */
export const BLEED = '-mx-4 -mt-4 -mb-16 sm:-mx-6 lg:-mx-10'
export const GUTTER = 'px-4 sm:px-6 lg:px-10'

export function useCategoryProducts(category: string) {
  return useQuery({
    queryKey: ['products', 'category-all', category],
    queryFn: () => fetchProducts({ category, page: 0, size_page: 100 }),
    select: page => page.content,
  })
}

export function categoryFigures(products: Product[]) {
  return {
    models: products.length,
    brands: new Set(products.map(p => p.brand)).size,
    from: products.length ? Math.min(...products.map(p => p.basePrice)) : 0,
    pairs: products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0),
  }
}

/**
 * Starts muted looping footage. React doesn't render `muted` into the server HTML, so browsers block
 * autoplay; mute and play here. Safari in Low Power Mode refuses outright, so retry on the first interaction.
 * Reduced motion keeps the poster frame.
 */
export function useLoopVideo(ref: RefObject<HTMLVideoElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.muted = true
    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    const retry = () => {
      el.play().catch(() => {})
      events.forEach(e => window.removeEventListener(e, retry))
    }
    el.play().catch(() => events.forEach(e => window.addEventListener(e, retry, { passive: true })))
    return () => events.forEach(e => window.removeEventListener(e, retry))
  }, [ref])
}

/** A product photo filling its box: cut-outs are contained and blend into the tile, full photos cover it. */
export function ShoeImage({ product, sizes, className = '', pad = 'p-6' }: { product: Product; sizes: string; className?: string; pad?: string }) {
  if (!product.imageUrl) return null
  const backdrop = hasBackdrop(product.imageUrl)
  return (
    <Image
      src={productImage(product.imageUrl)}
      alt={product.name}
      fill
      sizes={sizes}
      unoptimized={rawImage(product.imageUrl)}
      // Only cut-outs on white blend into their tile; a photo with its own backdrop would get tinted
      className={`${backdrop ? 'object-cover' : `on-paper object-contain ${pad}`} ${className}`}
    />
  )
}
