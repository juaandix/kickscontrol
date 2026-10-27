'use client'

import type { OrderStatusCountDto } from '@/lib/analytics'
import { Panel } from './ui'

interface Props {
  data: OrderStatusCountDto[]
}

// In the order a parcel moves through the shop; cancelled last
const FLOW = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

/** Orders by status as a ruled tally: one bar per status, all against the same total. */
export function OrdersStatusPieChart({ data }: Props) {
  const counts = new Map(data.map(d => [d.status, Number(d.count)]))
  const total = [...counts.values()].reduce((s, n) => s + n, 0)
  const rows = FLOW.filter(s => counts.has(s)).map(s => ({ status: s, count: counts.get(s)! }))

  return (
    <Panel title="Pedidos por estado" aside={`${total.toLocaleString('es-ES')} en total`}>
      <ul className="divide-y divide-form-rule">
        {rows.map(r => {
          const share = total ? (r.count / total) * 100 : 0
          return (
            <li key={r.status} className="px-4 py-3 sm:px-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className={r.status === 'CANCELLED' ? 'text-ink-soft' : 'font-medium'}>{STATUS_LABELS[r.status] ?? r.status}</span>
                <span className="type-label tabular-nums">
                  {r.count.toLocaleString('es-ES')} <span className="text-ink-soft">· {share.toFixed(0)}%</span>
                </span>
              </div>
              <div className="mt-2 h-1.5 bg-form-wash" aria-hidden>
                <div
                  className={r.status === 'CANCELLED' ? 'h-full bg-alarm' : r.status === 'PENDING' ? 'h-full bg-ink-soft' : 'h-full bg-ink'}
                  style={{ width: `${Math.max(share, 0.75)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}
