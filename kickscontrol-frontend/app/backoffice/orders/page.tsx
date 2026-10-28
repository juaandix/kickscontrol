'use client'

import { Fragment, useState } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { fetchOrdersByStatus } from '@/lib/analytics'
import { formatPrice } from '@/lib/sheet'
import type { OrderDto } from '@/lib/cart'
import { PageHead, Skeleton, btnGhost } from '@/components/backoffice/ui'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

const STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

const PAGE_SIZE = 20

interface OrdersPage {
  content: OrderDto[]
  totalElements: number
  totalPages: number
  number: number
}

async function fetchAdminOrders(status: string, page: number): Promise<OrdersPage> {
  const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
  if (status) qs.set('status', status)
  const res = await apiClient.get<OrdersPage>(`/api/admin/orders?${qs}`)
  return res.data
}

async function updateOrderStatus(orderId: number, status: string): Promise<void> {
  await apiClient.patch(`/api/admin/orders/${orderId}/status?status=${status}`, {})
}

const when = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<number | null>(null)

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['admin-orders', filterStatus, page],
    queryFn: () => fetchAdminOrders(filterStatus, page),
    placeholderData: keepPreviousData,
  })
  const { data: counts = [] } = useQuery({ queryKey: ['analytics-orders-status'], queryFn: fetchOrdersByStatus })
  const countOf = (s: string) => Number(counts.find(c => c.status === s)?.count ?? 0)
  const allCount = counts.reduce((n, c) => n + Number(c.count), 0)

  const statusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics-orders-status'] })
    },
  })

  const orders = data?.content ?? []
  const total = data?.totalElements ?? 0
  const pages = data?.totalPages ?? 1
  const pick = (s: string) => { setFilterStatus(s); setPage(0); setOpenId(null) }

  return (
    <div className="space-y-6">
      <PageHead kicker={`${total.toLocaleString('es-ES')} pedidos${filterStatus ? ` · ${STATUS_LABELS[filterStatus].toLowerCase()}s` : ''}`} title="Pedidos" />

      <div role="tablist" aria-label="Filtrar por estado" className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[['', 'Todos', allCount] as const, ...STATUSES.map(s => [s, STATUS_LABELS[s], countOf(s)] as const)].map(([value, label, n]) => (
          <button
            key={label}
            role="tab"
            aria-selected={filterStatus === value}
            onClick={() => pick(value)}
            className={`press flex h-10 shrink-0 items-center gap-2 border px-3 text-sm font-medium ${filterStatus === value ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'}`}
          >
            {label}
            <span className={`type-label ${filterStatus === value ? 'text-paper/60' : 'text-ink-soft'}`}>{n.toLocaleString('es-ES')}</span>
          </button>
        ))}
      </div>

      <div className={`overflow-x-auto border-t border-ink ${isPlaceholderData ? 'grid-busy' : 'grid-idle'}`}>
        <table className="w-full min-w-[38rem] text-sm">
          <thead>
            <tr className="border-b border-form-rule text-left">
              <th className="type-field py-2.5 pr-3 font-semibold">Pedido</th>
              <th className="type-field hidden px-3 py-2.5 font-semibold md:table-cell">Fecha</th>
              <th className="type-field px-3 py-2.5 font-semibold">Contenido</th>
              <th className="type-field px-3 py-2.5 text-right font-semibold">Total</th>
              <th className="type-field py-2.5 pl-3 font-semibold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="py-1"><Skeleton className="h-11" /></td></tr>
                ))
              : orders.map(order => {
                  const units = order.items.reduce((s, it) => s + it.quantity, 0)
                  const open = openId === order.id
                  return (
                    <Fragment key={order.id}>
                      <tr className={`border-b border-form-rule ${open ? 'bg-form-wash' : 'hover:bg-form-wash'}`}>
                        <td className="py-2.5 pr-3">
                          <button onClick={() => setOpenId(open ? null : order.id)} aria-expanded={open} className="type-label flex items-center gap-1.5 text-[0.8125rem] font-bold">
                            #{order.id}
                            <ChevronDownIcon className={`size-3.5 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="type-label hidden px-3 py-2.5 text-ink-soft md:table-cell">{when(order.createdAt)}</td>
                        <td className="max-w-[18rem] px-3 py-2.5">
                          <p className="truncate">{order.items[0]?.productName ?? '—'}{order.items.length > 1 && <span className="text-ink-soft"> y {order.items.length - 1} más</span>}</p>
                          <p className="type-label text-ink-soft">
                            {units} {units === 1 ? 'ud' : 'uds'}
                            {order.channel === 'STORE' && <span className="ml-2 bg-ink px-1.5 py-px text-paper">Tienda</span>}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatPrice(order.totalAmount)}</td>
                        <td className="py-2.5 pl-3">
                          <select
                            value={order.status}
                            onChange={e => statusMutation.mutate({ orderId: order.id, status: e.target.value })}
                            aria-label={`Estado del pedido ${order.id}`}
                            className={`h-9 border bg-paper px-2 text-sm focus:border-ink focus:outline-none ${order.status === 'CANCELLED' ? 'border-alarm/40 text-alarm' : order.status === 'PENDING' ? 'border-ink font-semibold' : 'border-form-rule'}`}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </td>
                      </tr>
                      {open && (
                        <tr className="border-b border-ink bg-form-wash">
                          <td colSpan={5} className="pt-1 pb-4">
                            <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                              <ul className="divide-y divide-form-rule border border-form-rule bg-paper">
                                {order.items.map(it => (
                                  <li key={it.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                    <div className="min-w-0">
                                      <p className="truncate font-medium">{it.productBrand} {it.productName}</p>
                                      <p className="type-label text-ink-soft">Talla {it.size} · {it.color} · {it.sku}</p>
                                    </div>
                                    <p className="type-label shrink-0 text-right">{it.quantity} × {formatPrice(it.unitPrice)}</p>
                                  </li>
                                ))}
                              </ul>
                              <div>
                                {order.channel === 'STORE' ? (
                                  <>
                                    <p className="type-field">Venta en tienda</p>
                                    <p className="mt-1 text-sm">Cobrada en caja por {order.soldBy ?? '—'}</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="type-field">Envío a</p>
                                    <p className="mt-1 text-sm">{order.shippingAddress || '—'}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
          </tbody>
        </table>
        {!isLoading && orders.length === 0 && <p className="py-12 text-center text-sm text-ink-soft">No hay pedidos con este estado.</p>}
      </div>

      {pages > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-between gap-3">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className={btnGhost}>Anterior</button>
          <p className="type-label text-ink-soft">Página {page + 1} de {pages}</p>
          <button onClick={() => setPage(p => p + 1)} disabled={page + 1 >= pages} className={btnGhost}>Siguiente</button>
        </nav>
      )}
    </div>
  )
}
