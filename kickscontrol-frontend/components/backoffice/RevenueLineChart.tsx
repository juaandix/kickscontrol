'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueDataPointDto } from '@/lib/analytics'

interface Props {
  data: RevenueDataPointDto[]
}

function formatCurrency(value: number) {
  return `€${value.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function RevenueLineChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-700 mb-4">Ingresos diarios</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Ingresos']}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#f97316' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4" />
      <div className={`bg-neutral-100 rounded-xl`} style={{ height }} />
    </div>
  )
}
