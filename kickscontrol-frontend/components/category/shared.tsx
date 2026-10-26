'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState, type RefObject } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCategoryShoes } from '@/lib/products'
import { otherCategories } from '@/lib/categories'
import { hasBackdrop, productImage, rawImage, sortSizes, swatchInks } from '@/lib/sheet'
import { useCart } from '@/context/CartContext'
import type { Product } from '@/types'

/** Breaks a category page out of the store's padded <main>; the tone shell paints the ground. */
export const BLEED = '-mx-4 -mt-4 -mb-16 sm:-mx-6 lg:-mx-10'
export const GUTTER = 'px-4 sm:px-6 lg:px-10'

export interface CategoryPageProps {
  slug: string
  video: string
  poster: string
  /** Rendered on the server so the shoes are in the HTML and there is no empty first paint */
  initialProducts: Product[]
}

export function useCategoryProducts(category: string, initialProducts: Product[]) {
  return useQuery({
    queryKey: ['products', 'category-shoes', category],
    queryFn: () => fetchCategoryShoes(category),
    initialData: initialProducts.length ? initialProducts : undefined,
    staleTime: 30_000,
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

export function flagship(products: Product[]) {
  return products.length ? products.reduce((top, p) => (p.basePrice > top.basePrice ? p : top)) : undefined
}

/**
 * Muted looping footage that only plays while on screen, with a visible pause control.
 * React doesn't render `muted` into the server HTML, so browsers block autoplay; mute and play here.
 * Safari in Low Power Mode refuses autoplay outright: the control (or any tap) starts it.
 * Reduced motion keeps the poster frame until the visitor presses play.
 */
export function useLoopVideo(ref: RefObject<HTMLVideoElement | null>) {
  const [playing, setPlaying] = useState(false)
  // The visitor's own pause wins over scrolling back into view
  const userPaused = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.muted = true
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    const retry = () => {
      if (!userPaused.current) el.play().catch(() => {})
      events.forEach(e => window.removeEventListener(e, retry))
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) el.pause()
      else if (!reduced && !userPaused.current) {
        el.play().catch(() => events.forEach(e => window.addEventListener(e, retry, { passive: true })))
      }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => {
      io.disconnect()
      events.forEach(e => window.removeEventListener(e, retry))
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [ref])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    userPaused.current = !el.paused
    if (el.paused) el.play().catch(() => {})
    else el.pause()
  }

  return { playing, toggle }
}

/**
 * Size-and-colour picking for adding a pair straight from a category page.
 * Colours with no stock are dropped; sizes come back with their stock so pages can mark the empty ones.
 */
export function useQuickAdd(product: Product) {
  const { addItem } = useCart()
  const colors = [...new Set(product.variants.filter(v => v.stockQuantity > 0).map(v => v.color))]
  const [color, setColor] = useState(colors[0] ?? '')
  const [size, setSize] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle')

  const ofColor = product.variants.filter(v => v.color === color)
  const sizes = sortSizes([...new Set(ofColor.map(v => v.size))]).map(s => ({
    size: s,
    stock: ofColor.find(v => v.size === s)?.stockQuantity ?? 0,
  }))
  const variant = ofColor.find(v => v.size === size)

  useEffect(() => {
    if (status !== 'added') return
    const t = setTimeout(() => setStatus('idle'), 1600)
    return () => clearTimeout(t)
  }, [status])

  const add = async () => {
    if (!variant) return
    setStatus('adding')
    try {
      await addItem(variant.id, 1)
      setStatus('added')
    } catch {
      setStatus('idle')
    }
  }

  return {
    colors, color, setColor: (c: string) => { setColor(c); setSize(null) },
    sizes, size, setSize, variant, add, status,
    price: product.basePrice + (variant?.priceModifier ?? 0),
  }
}

/** Broad tone of a colourway, for browsing by colour: light, dark, neutral or colour. */
export function toneFamily(color: string): 'Claras' | 'Oscuras' | 'Neutras' | 'Color' {
  const hex = swatchInks(color)[0].slice(1)
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  const s = max === min ? 0 : (max - min) / (1 - Math.abs(2 * l - 1))
  if (l > 0.82) return 'Claras'
  if (l < 0.3) return 'Oscuras'
  if (s < 0.15) return 'Neutras'
  return 'Color'
}

/** A product photo filling its box: cut-outs are contained and blend into the tile, full photos cover it. */
export function ShoeImage({ product, sizes, className = '', pad = 'p-6', priority }: { product: Product; sizes: string; className?: string; pad?: string; priority?: boolean }) {
  if (!product.imageUrl) return null
  const backdrop = hasBackdrop(product.imageUrl)
  return (
    <Image
      src={productImage(product.imageUrl)}
      alt={product.name}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={rawImage(product.imageUrl)}
      // Only cut-outs on white blend into their tile; a photo with its own backdrop would get tinted
      className={`${backdrop ? 'object-cover' : `on-paper object-contain ${pad}`} ${className}`}
    />
  )
}

/** Links to the other category pages; each page dresses them in its own style. */
export function OtherCategories({ slug, className, linkClassName, render }: {
  slug: string
  className?: string
  linkClassName?: string | ((i: number) => string)
  render?: (title: string, i: number) => React.ReactNode
}) {
  return (
    <div className={className}>
      {otherCategories(slug).map((c, i) => (
        <Link key={c.slug} href={`/categoria/${c.slug}`} className={typeof linkClassName === 'function' ? linkClassName(i) : linkClassName}>
          {render ? render(c.title, i) : c.title}
        </Link>
      ))}
    </div>
  )
}
