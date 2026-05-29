'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { OrderDto } from '@/lib/cart'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  SHIPPED:   { label: 'Enviado',    color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Entregado',  color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'Cancelado',  color: 'bg-red-100 text-red-700' },
}

async function fetchAdminOrders(status?: string): Promise<{ content: OrderDto[] }> {
  const qs = status ? `?status=${status}` : ''
  const res = await apiClient.get<{ content: OrderDto[] }>(`/api/admin/orders${qs}`)
  return res.data
}

async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await apiClient.patch(`/api/admin/orders/${orderId}/status?status=${status}`, {})
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', filterStatus],
    queryFn: () => fetchAdminOrders(filterStatus || undefined),
  })

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  const orders = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Pedidos</h1>
          <p className="text-sm text-neutral-500">{orders.length} resultados</p>
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600">#</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden md:table-cell">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-neutral-600">Estado</th>
              <th className="text-right px-4 py-3 font-semibold text-neutral-600">Total</th>
              <th className="px-4 py-3 font-semibold text-neutral-600">Cambiar estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-neutral-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              : orders.map(order => {
                  const status = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-neutral-100 text-neutral-600' }
                  return (
                    <tr key={order.id} className="hover:bg-neutral-50">
                      <td className="px-4 py-3 font-mono font-semibold">#{order.id}</td>
                      <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">
                        {new Date(order.createdAt).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">{order.totalAmount.toFixed(2)} €</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={e => statusMutation.mutate({ orderId: order.id, status: e.target.value })}
                          className="border border-neutral-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          {STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        {!isLoading && orders.length === 0 && (
          <div className="py-12 text-center text-neutral-500">No hay pedidos</div>
        )}
      </div>
    </div>
  )
}
