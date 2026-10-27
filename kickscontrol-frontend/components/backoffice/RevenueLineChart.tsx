'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueDataPointDto } from '@/lib/analytics'
import { Panel, Skeleton } from './ui'

interface Props {
  data: RevenueDataPointDto[]
  granularity?: 'day' | 'week' | 'month'
}

const TITLE = { day: 'Ingresos por día', week: 'Ingresos por semana', month: 'Ingresos por mes' }

function formatCurrency(value: number) {
  return `€${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

const shortDate = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

const axisTick = { fontSize: 10, fill: '#6b6b6b', fontFamily: 'var(--font-label), monospace' }

export function RevenueLineChart({ data, granularity = 'day' }: Props) {
  const total = data.reduce((s, d) => s + Number(d.revenue), 0)

  return (
    <Panel title={TITLE[granularity]} aside={`${formatCurrency(total)} en el periodo`}>
      <div className="px-2 pt-4 pb-2 sm:px-4">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenue-wash" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111111" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#111111" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e6e6e6" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={axisTick} tickLine={false} axisLine={{ stroke: '#111111' }} minTickGap={24} />
            <YAxis tickFormatter={formatCurrency} tick={axisTick} tickLine={false} axisLine={false} width={60} />
            <Tooltip
              formatter={(v, _n, p) => [
                `${formatCurrency(Number(v ?? 0))} · ${(p as { payload?: { orders?: number } }).payload?.orders ?? 0} pedidos`,
                'Ingresos',
              ]}
              labelFormatter={l => shortDate(String(l))}
              contentStyle={{ borderRadius: 0, border: '1px solid #111111', fontSize: 12 }}
              cursor={{ stroke: '#111111', strokeDasharray: '2 3' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#111111" strokeWidth={1.75} fill="url(#revenue-wash)" activeDot={{ r: 4, fill: '#111111', stroke: '#ffffff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="border border-form-rule p-5">
      <Skeleton className="mb-4 h-4 w-1/3" />
      <div className="animate-pulse bg-form-wash" style={{ height }} />
    </div>
  )
}
