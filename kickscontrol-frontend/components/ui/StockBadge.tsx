interface StockBadgeProps {
  stock: number
  lowThreshold?: number
}

export function StockBadge({ stock, lowThreshold = 5 }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-500">
        Agotado
      </span>
    )
  }
  if (stock <= lowThreshold) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
        Últimas unidades
      </span>
    )
  }
  return null
}
