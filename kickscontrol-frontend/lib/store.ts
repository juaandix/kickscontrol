import { apiClient } from './api'
import type { OrderDto } from './cart'
import type { Product } from '@/types'

/** Physical store API: the till and the barcode lookup. Same stock as the web shop. */

export type PaymentMethod = 'CARD' | 'CASH'

export interface StoreSale extends OrderDto {
  channel: 'ONLINE' | 'STORE'
  paymentMethod: PaymentMethod | null
  cashGiven: number | null
  change: number | null
  soldBy: string | null
}

export interface StoreSaleRequest {
  items: { variantId: number; quantity: number }[]
  paymentMethod: PaymentMethod
  cashGiven?: number
}

export async function ringUpSale(dto: StoreSaleRequest): Promise<StoreSale> {
  const res = await apiClient.post<StoreSale>('/api/store/sales', dto)
  return res.data
}

export async function fetchTodaySales(): Promise<StoreSale[]> {
  const res = await apiClient.get<StoreSale[]>('/api/store/sales/today')
  return res.data
}

/** A scanned SKU: the variant and its product with every size on the shelf. */
export async function lookupSku(sku: string): Promise<{ variantId: number; product: Product }> {
  const res = await apiClient.get<{ variantId: number; product: Product }>(`/api/store/variants/${encodeURIComponent(sku)}`)
  return res.data
}

/** SKUs look like "NK-AM90-42-WB": letters/digits in at least three dash-separated parts. */
export const looksLikeSku = (text: string) => /^[A-Z0-9]+(-[A-Z0-9]+){2,}$/i.test(text.trim())
