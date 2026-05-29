import { apiClient } from './api'
import type { Product, ProductVariant } from '@/types'

export interface ProductRequestDto {
  name: string
  brand: string
  description: string
  gender: string
  category: string
  basePrice: number
  imageUrl: string
}

export interface VariantRequestDto {
  size: string
  color: string
  sku: string
  stockQuantity: number
  priceModifier: number
  imageUrl: string
}

export interface StockAdjustmentDto {
  delta: number
  reason: string
}

export async function adminFetchProducts(): Promise<Product[]> {
  const res = await apiClient.get<Product[]>('/api/admin/products')
  return res.data
}

export async function adminCreateProduct(dto: ProductRequestDto): Promise<Product> {
  const res = await apiClient.post<Product>('/api/admin/products', dto)
  return res.data
}

export async function adminUpdateProduct(id: number, dto: ProductRequestDto): Promise<Product> {
  const res = await apiClient.put<Product>(`/api/admin/products/${id}`, dto)
  return res.data
}

export async function adminDeleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/api/admin/products/${id}`)
}

export async function adminAddVariant(productId: number, dto: VariantRequestDto): Promise<ProductVariant> {
  const res = await apiClient.post<ProductVariant>(`/api/admin/products/${productId}/variants`, dto)
  return res.data
}

export async function adminUpdateVariant(variantId: number, dto: VariantRequestDto): Promise<ProductVariant> {
  const res = await apiClient.put<ProductVariant>(`/api/admin/variants/${variantId}`, dto)
  return res.data
}

export async function adminAdjustStock(variantId: number, dto: StockAdjustmentDto): Promise<ProductVariant> {
  const res = await apiClient.patch<ProductVariant>(`/api/admin/variants/${variantId}/stock`, dto)
  return res.data
}

export async function adminGetLowStock(threshold = 5): Promise<ProductVariant[]> {
  const res = await apiClient.get<ProductVariant[]>(`/api/admin/products/inventory/alerts?threshold=${threshold}`)
  return res.data
}
