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
import { PageHead } from '@/components/backoffice/ui'
import { LOW_STOCK } from '@/lib/sheet'

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatCurrency(v: number) {
  return `€${Number(v).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

type Granularity = 'day' | 'week' | 'month'

const GRANULARITY_LABEL: Record<Granularity, string> = { day: 'Día', week: 'Semana', month: 'Mes' }

const dateCls = 'type-label h-10 border border-form-rule bg-paper px-2.5 text-[0.75rem] text-ink focus:border-ink focus:outline-none'

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
  const todayLabel = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8">
      <PageHead kicker={`Parte del turno · ${todayLabel}`} title={<>Bienvenido, {user?.firstName}</>}>
        <label className="flex items-center gap-2">
          <span className="type-field">Desde</span>
          <input type="date" value={from} max={to} onChange={e => setFrom(e.target.value)} className={dateCls} />
        </label>
        <label className="flex items-center gap-2">
          <span className="type-field">Hasta</span>
          <input type="date" value={to} min={from} onChange={e => setTo(e.target.value)} className={dateCls} />
        </label>
        <div role="group" aria-label="Agrupar ingresos por" className="flex border border-form-rule">
          {(['day', 'week', 'month'] as Granularity[]).map(g => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              aria-pressed={granularity === g}
              className={`press h-10 px-3 text-sm font-medium ${granularity === g ? 'bg-ink text-paper' : 'text-ink hover:bg-form-wash'}`}
            >
              {GRANULARITY_LABEL[g]}
            </button>
          ))}
        </div>
      </PageHead>

      {/* The shift report: sales on the first row, the shelf on the second */}
      <section aria-label="Indicadores">
        {summaryQ.isError ? (
          <p className="border border-form-rule px-5 py-8 text-sm text-alarm">No se pudieron cargar los indicadores.</p>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-form-rule bg-form-rule lg:grid-cols-4">
            {summaryQ.isPending || !s ? (
              Array.from({ length: 8 }).map((_, i) => <KpiCardSkeleton key={i} />)
            ) : (
              <>
                <KpiCard title="Ingresos totales" value={formatCurrency(s.totalRevenue)} subtitle="de pedidos confirmados" />
                <KpiCard title="Pedidos" value={s.totalOrders.toLocaleString('es-ES')} subtitle="confirmados en el periodo" />
                <KpiCard title="Ticket medio" value={formatCurrency(s.avgTicket)} subtitle="ingresos / pedidos" />
                <KpiCard title="Unidades vendidas" value={s.totalUnitsSold.toLocaleString('es-ES')} subtitle="pares y prendas" />
                <KpiCard title="Sell-through" value={`${Number(s.sellThroughRate).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`} subtitle="vendidas / (vendidas + en stock)" />
                <KpiCard title="Días de cobertura" value={`${Number(s.avgDaysOfCoverage).toFixed(0)} días`} subtitle="stock actual / venta media diaria" />
                <KpiCard
                  title="Merma"
                  value={`${Number(s.shrinkageRate).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
                  subtitle={`${s.shrinkageUnits} uds perdidas / (vendidas + perdidas)`}
                />
                <KpiCard
                  title="Tallas en alerta"
                  value={s.lowStockAlerts.toLocaleString('es-ES')}
                  subtitle={`variantes con ≤ ${LOW_STOCK} uds`}
                  alert={s.lowStockAlerts > 0}
                />
              </>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {revenueQ.isPending ? <ChartSkeleton height={240} /> : revenueQ.data ? <RevenueLineChart data={revenueQ.data} granularity={granularity} /> : null}
        </div>
        {statusQ.isPending ? <ChartSkeleton height={240} /> : statusQ.data ? <OrdersStatusPieChart data={statusQ.data} /> : null}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_3fr]">
        {topSellersQ.isPending ? <ChartSkeleton height={320} /> : topSellersQ.data ? <TopSellersBarChart data={topSellersQ.data} /> : null}
        <LowStockPanel />
      </div>
    </div>
  )
}
