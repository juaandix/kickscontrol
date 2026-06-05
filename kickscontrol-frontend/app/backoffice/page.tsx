'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { KpiCard, KpiCardSkeleton } from '@/components/backoffice/KpiCard'
import { RevenueLineChart, ChartSkeleton } from '@/components/backoffice/RevenueLineChart'
import { TopSellersBarChart } from '@/components/backoffice/TopSellersBarChart'
import { OrdersStatusPieChart } from '@/components/backoffice/OrdersStatusPieChart'
import {
  fetchKpiSummary,
  fetchRevenueChart,
  fetchTopSellers,
  fetchOrdersByStatus,
} from '@/lib/analytics'
import { LowStockPanel } from '@/components/backoffice/LowStockPanel'
import {
  BanknotesIcon,
  ShoppingBagIcon,
  TicketIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  ScissorsIcon,
} from '@heroicons/react/24/outline'

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatCurrency(v: number) {
  return `€${Number(v).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type Granularity = 'day' | 'week' | 'month'

export default function BackofficePage() {
  const { user } = useAuth()

  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [from, setFrom] = useState(formatDate(thirtyDaysAgo))
  const [to, setTo] = useState(formatDate(today))
  const [granularity, setGranularity] = useState<Granularity>('day')

  const summaryQ = useQuery({
    queryKey: ['analytics-summary', from, to],
    queryFn: () => fetchKpiSummary(from, to),
  })

  const revenueQ = useQuery({
    queryKey: ['analytics-revenue', from, to, granularity],
    queryFn: () => fetchRevenueChart(from, to, granularity),
  })

  const topSellersQ = useQuery({
    queryKey: ['analytics-top-sellers', from, to],
    queryFn: () => fetchTopSellers(from, to),
  })

  const statusQ = useQuery({
    queryKey: ['analytics-orders-status'],
    queryFn: fetchOrdersByStatus,
  })

  const s = summaryQ.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">
            Bienvenido, {user?.firstName}
          </h1>
          <p className="text-neutral-500 text-sm mt-0.5">KPI Dashboard · KicksControl</p>
        </div>

        {/* Date range + granularity */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-3 py-2">
            <label className="text-xs text-neutral-500 font-medium">Desde</label>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="text-sm text-neutral-800 bg-transparent outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl px-3 py-2">
            <label className="text-xs text-neutral-500 font-medium">Hasta</label>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="text-sm text-neutral-800 bg-transparent outline-none"
            />
          </div>
          <div className="flex rounded-xl border border-neutral-200 overflow-hidden bg-white text-sm">
            {(['day', 'week', 'month'] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-3 py-2 font-medium capitalize transition-colors ${
                  granularity === g
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                {g === 'day' ? 'Día' : g === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryQ.isPending ? (
          Array.from({ length: 8 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : summaryQ.isError ? (
          <div className="col-span-4 text-center py-8 text-red-500 text-sm">
            Error cargando KPIs
          </div>
        ) : s ? (
          <>
            <KpiCard
              title="Ingresos totales"
              value={formatCurrency(s.totalRevenue)}
              subtitle={`${s.totalOrders} pedidos`}
              icon={<BanknotesIcon className="w-5 h-5" />}
              accentColor="bg-green-100 text-green-600"
            />
            <KpiCard
              title="Pedidos"
              value={s.totalOrders.toString()}
              icon={<ShoppingBagIcon className="w-5 h-5" />}
              accentColor="bg-blue-100 text-blue-600"
            />
            <KpiCard
              title="Ticket medio"
              value={formatCurrency(s.avgTicket)}
              icon={<TicketIcon className="w-5 h-5" />}
              accentColor="bg-purple-100 text-purple-600"
            />
            <KpiCard
              title="Unidades vendidas"
              value={s.totalUnitsSold.toString()}
              icon={<CubeIcon className="w-5 h-5" />}
              accentColor="bg-orange-100 text-orange-600"
            />
            <KpiCard
              title="Sell-Through Rate"
              value={`${Number(s.sellThroughRate).toFixed(1)}%`}
              subtitle="unidades vendidas / stock total"
              icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
              accentColor="bg-teal-100 text-teal-600"
            />
            <KpiCard
              title="Días de cobertura"
              value={`${Number(s.avgDaysOfCoverage).toFixed(0)} días`}
              subtitle="stock actual / venta media diaria"
              icon={<CalendarDaysIcon className="w-5 h-5" />}
              accentColor="bg-sky-100 text-sky-600"
            />
            <KpiCard
              title="Tasa de merma"
              value={`${Number(s.shrinkageRate).toFixed(2)}%`}
              subtitle="ajustes negativos / total movimientos"
              icon={<ScissorsIcon className="w-5 h-5" />}
              accentColor="bg-red-100 text-red-600"
            />
            <KpiCard
              title="Alertas stock bajo"
              value={s.lowStockAlerts.toString()}
              subtitle="variantes ≤ 5 uds"
              icon={<ExclamationTriangleIcon className="w-5 h-5" />}
              accentColor={s.lowStockAlerts > 0 ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'}
            />
          </>
        ) : null}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {revenueQ.isPending ? (
            <ChartSkeleton height={220} />
          ) : revenueQ.data ? (
            <RevenueLineChart data={revenueQ.data} />
          ) : null}
        </div>

        <div>
          {statusQ.isPending ? (
            <ChartSkeleton height={240} />
          ) : statusQ.data ? (
            <OrdersStatusPieChart data={statusQ.data} />
          ) : null}
        </div>
      </div>

      {/* Top sellers full width */}
      {topSellersQ.isPending ? (
        <ChartSkeleton height={220} />
      ) : topSellersQ.data ? (
        <TopSellersBarChart data={topSellersQ.data} />
      ) : null}

      {/* Low stock alerts */}
      <LowStockPanel />
    </div>
  )
}
