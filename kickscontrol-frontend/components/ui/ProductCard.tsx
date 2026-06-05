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
      className="group flex flex-col bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-neutral-700 hover:shadow-xl hover:shadow-neutral-200/60 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`object-contain p-3 transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'opacity-40 grayscale' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl select-none">
            👟
          </div>
        )}

        {/* Bottom gradient for depth */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

        {/* Stock badge */}
        {(isOutOfStock || totalStock <= 5) && (
          <div className="absolute top-2.5 left-2.5">
            <StockBadge stock={totalStock} />
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="rounded-full bg-black/50 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {product.category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1 bg-white dark:bg-neutral-800">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-500">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-auto pt-3 flex items-end justify-between">
          <div>
            <span className="text-xl font-black text-neutral-900 dark:text-white leading-none">
              {product.basePrice.toFixed(2)}
            </span>
            <span className="text-sm font-bold text-neutral-400 dark:text-neutral-500 ml-0.5">€</span>
          </div>
          {!isOutOfStock ? (
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mb-0.5">
              {totalStock} uds.
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 mb-0.5">Sin stock</span>
          )}
        </div>
      </div>

      {/* Bottom CTA strip — visible on hover */}
      <div className="h-0 group-hover:h-9 overflow-hidden transition-all duration-200 bg-orange-500">
        <p className="h-9 flex items-center justify-center text-xs font-bold text-white tracking-wide">
          Ver producto →
        </p>
      </div>
    </Link>
  )
}
