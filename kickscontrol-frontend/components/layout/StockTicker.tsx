'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'

const units = new Intl.NumberFormat('es-ES')

/** A strip above the header with the warehouse count, refreshed every minute: the store's live stock truth. */
export function StockTicker() {
  const { data, dataUpdatedAt } = useQuery({
    queryKey: ['products', 'stock-count'],
    queryFn: () => fetchProducts({ page: 0, size_page: 500 }),
    refetchInterval: 60_000,
  })
  const products = data?.content ?? []
  const total = products.reduce((sum, p) => sum + (p.totalStock ?? 0), 0)
  const time = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : null

  return (
    <div className="bg-ink text-paper">
      <p className="type-label mx-auto flex max-w-[90rem] items-center gap-x-3 overflow-hidden px-4 py-1.5 whitespace-nowrap sm:px-6 lg:px-10" aria-live="off">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 animate-pulse rounded-full bg-alarm" aria-hidden />
          Stock en directo
        </span>
        {data && (
          <>
            <span className="hidden sm:inline" aria-hidden>·</span>
            <span className="hidden sm:inline">{data.totalElements} referencias</span>
            <span aria-hidden>·</span>
            <span>{units.format(total)} unidades</span>
            {time && <span className="hidden sm:inline">· Recuento {time}</span>}
          </>
        )}
      </p>
    </div>
  )
}
