'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { TopSellerDto } from '@/lib/analytics'

interface Props {
  data: TopSellerDto[]
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#fff7ed', '#fef3c7', '#fde68a']

export function TopSellersBarChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.productName.length > 16 ? d.productName.slice(0, 14) + '…' : d.productName,
    revenue: Number(d.revenue),
    units: d.unitsSold,
  }))

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-700 mb-4">Top productos por ingresos</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v: number) => `€${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={56}
          />
          <Tooltip
            formatter={(v, _name, props) => [
              `€${Number(v ?? 0).toLocaleString('es-ES')} (${(props as { payload?: { units?: number } }).payload?.units ?? 0} uds)`,
              'Ingresos',
            ]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {chartData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
