import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchKpiSummary,
  fetchRevenueChart,
  fetchTopSellers,
  fetchOrdersByStatus,
} from '@/lib/analytics'

vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

import { apiClient } from '@/lib/api'

const mockGet = vi.mocked(apiClient.get)

describe('analytics API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchKpiSummary', () => {
    it('calls the correct endpoint with date params', async () => {
      const mockSummary = { totalRevenue: 1000, totalOrders: 10, avgTicket: 100 }
      mockGet.mockResolvedValue({ success: true, data: mockSummary } as never)

      const result = await fetchKpiSummary('2026-05-01', '2026-05-31')

      expect(mockGet).toHaveBeenCalledWith(
        '/api/admin/analytics/summary?from=2026-05-01&to=2026-05-31'
      )
      expect(result).toEqual(mockSummary)
    })
  })

  describe('fetchRevenueChart', () => {
    it('calls the endpoint with granularity defaulting to day', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] } as never)

      await fetchRevenueChart('2026-05-01', '2026-05-31')

      expect(mockGet).toHaveBeenCalledWith(
        '/api/admin/analytics/revenue-chart?from=2026-05-01&to=2026-05-31&granularity=day'
      )
    })

    it('passes custom granularity param', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] } as never)

      await fetchRevenueChart('2026-05-01', '2026-05-31', 'week')

      expect(mockGet).toHaveBeenCalledWith(
        '/api/admin/analytics/revenue-chart?from=2026-05-01&to=2026-05-31&granularity=week'
      )
    })

    it('returns an array of data points', async () => {
      const points = [{ date: '2026-05-01', revenue: 500, orders: 5 }]
      mockGet.mockResolvedValue({ success: true, data: points } as never)

      const result = await fetchRevenueChart('2026-05-01', '2026-05-31')

      expect(result).toEqual(points)
    })
  })

  describe('fetchTopSellers', () => {
    it('calls the endpoint with default limit of 8', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] } as never)

      await fetchTopSellers('2026-05-01', '2026-05-31')

      expect(mockGet).toHaveBeenCalledWith(
        '/api/admin/analytics/top-sellers?from=2026-05-01&to=2026-05-31&limit=8'
      )
    })

    it('passes custom limit param', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] } as never)

      await fetchTopSellers('2026-05-01', '2026-05-31', 5)

      expect(mockGet).toHaveBeenCalledWith(
        '/api/admin/analytics/top-sellers?from=2026-05-01&to=2026-05-31&limit=5'
      )
    })
  })

  describe('fetchOrdersByStatus', () => {
    it('calls the correct endpoint without date params', async () => {
      const statusCounts = [{ status: 'CONFIRMED', count: 12 }]
      mockGet.mockResolvedValue({ success: true, data: statusCounts } as never)

      const result = await fetchOrdersByStatus()

      expect(mockGet).toHaveBeenCalledWith('/api/admin/analytics/orders-by-status')
      expect(result).toEqual(statusCounts)
    })
  })
})
