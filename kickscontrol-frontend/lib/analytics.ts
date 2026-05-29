import { apiClient } from './api'

export interface KpiSummaryDto {
  totalRevenue: number
  totalOrders: number
  avgTicket: number
  totalUnitsSold: number
  lowStockAlerts: number
  sellThroughRate: number
  avgDaysOfCoverage: number
  shrinkageRate: number
}

export interface RevenueDataPointDto {
  date: string
  revenue: number
  orders: number
}

export interface TopSellerDto {
  productId: number
  productName: string
  brand: string
  unitsSold: number
  revenue: number
}

export interface OrderStatusCountDto {
  status: string
  count: number
}

export async function fetchKpiSummary(from: string, to: string): Promise<KpiSummaryDto> {
  const res = await apiClient.get<KpiSummaryDto>(`/api/admin/analytics/summary?from=${from}&to=${to}`)
  return res.data
}

export async function fetchRevenueChart(
  from: string,
  to: string,
  granularity = 'day'
): Promise<RevenueDataPointDto[]> {
  const res = await apiClient.get<RevenueDataPointDto[]>(
    `/api/admin/analytics/revenue-chart?from=${from}&to=${to}&granularity=${granularity}`
  )
  return res.data
}

export async function fetchTopSellers(from: string, to: string, limit = 8): Promise<TopSellerDto[]> {
  const res = await apiClient.get<TopSellerDto[]>(
    `/api/admin/analytics/top-sellers?from=${from}&to=${to}&limit=${limit}`
  )
  return res.data
}

export async function fetchOrdersByStatus(): Promise<OrderStatusCountDto[]> {
  const res = await apiClient.get<OrderStatusCountDto[]>('/api/admin/analytics/orders-by-status')
  return res.data
}
