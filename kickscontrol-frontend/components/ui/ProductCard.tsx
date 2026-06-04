import Link from 'next/link'
import Image from 'next/image'
import { StockBadge } from './StockBadge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.totalStock ?? 0
  const isOutOfStock = totalStock === 0

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-neutral-300 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none text-neutral-300">
            👟
          </div>
        )}

        {/* Stock badge */}
        <div className="absolute top-2 left-2">
          <StockBadge stock={totalStock} />
        </div>

        {/* Category badge */}
        <div className="absolute top-2 right-2">
          <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-neutral-900 shadow-md backdrop-blur-sm">
            Ver producto →
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-base font-black text-neutral-900">
            {product.basePrice.toFixed(2)} €
          </span>
          {!isOutOfStock && (
            <span className="text-xs text-neutral-400">
              {totalStock} uds.
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
