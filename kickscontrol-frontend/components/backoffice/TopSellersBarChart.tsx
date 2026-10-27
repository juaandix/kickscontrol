'use client'

import type { TopSellerDto } from '@/lib/analytics'
import { Panel } from './ui'

interface Props {
  data: TopSellerDto[]
}

const euro = (v: number) => `€${v.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`

/** Best sellers as a ranked list: full names, the bar measured against the top seller. */
export function TopSellersBarChart({ data }: Props) {
  const top = Math.max(...data.map(d => Number(d.revenue)), 1)

  return (
    <Panel title="Lo que más sale" aside="por ingresos">
      {data.length === 0 ? (
        <p className="px-5 py-8 text-sm text-ink-soft">Sin ventas en este periodo.</p>
      ) : (
        <ol className="divide-y divide-form-rule">
          {data.map((d, i) => (
            <li key={d.productId} className="grid grid-cols-[1.75rem_1fr_auto] items-center gap-x-3 px-4 py-3 sm:px-5">
              <span className="type-label text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {d.productName} <span className="font-normal text-ink-soft">· {d.brand}</span>
                </p>
                <div className="mt-1.5 h-1.5 bg-form-wash" aria-hidden>
                  <div className="h-full bg-ink" style={{ width: `${(Number(d.revenue) / top) * 100}%` }} />
                </div>
              </div>
              <p className="text-right">
                <span className="block text-sm font-semibold tabular-nums">{euro(Number(d.revenue))}</span>
                <span className="type-label block text-ink-soft">{d.unitsSold} uds</span>
              </p>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}
