'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { OrderStatusCountDto } from '@/lib/analytics'

interface Props {
  data: OrderStatusCountDto[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#fbbf24',
  CONFIRMED: '#60a5fa',
  SHIPPED: '#a78bfa',
  DELIVERED: '#34d399',
  CANCELLED: '#f87171',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export function OrdersStatusPieChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: Number(d.count),
    status: d.status,
  }))

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
      <h3 className="text-sm font-bold text-neutral-700 mb-2">Pedidos por estado</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.status] ?? '#d1d5db'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${Number(v ?? 0)} pedidos`]}
            contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span style={{ fontSize: 11, color: '#6b7280' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
