import Link from 'next/link'
import Image from 'next/image'
import { StockBadge } from './StockBadge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const totalStock = product.totalStock ?? 0

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square bg-neutral-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl select-none">
            👟
          </div>
        )}
        <div className="absolute top-2 left-2">
          <StockBadge stock={totalStock} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {product.brand}
        </p>
        <h3 className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-base font-bold text-neutral-900">
          {product.basePrice.toFixed(2)} €
        </p>
      </div>
    </Link>
  )
}
