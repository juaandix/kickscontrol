interface StockBadgeProps {
  stock: number
  lowThreshold?: number
}

export function StockBadge({ stock, lowThreshold = 5 }: StockBadgeProps) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center border border-current px-1.5 py-px text-[0.6875rem] font-semibold uppercase tracking-wide text-neutral-500">
        Agotado
      </span>
    )
  }
  if (stock <= lowThreshold) {
    return (
      <span className="inline-flex items-center border border-current px-1.5 py-px text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--alarm,#c8241c)]">
        Últimas unidades
      </span>
    )
  }
  return null
}
