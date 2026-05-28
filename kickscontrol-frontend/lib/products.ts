import { apiClient } from './api'
import type { PageResponse, Product, ProductFilters } from '@/types'

export async function fetchProducts(filters: ProductFilters = {}): Promise<PageResponse<Product>> {
  const params = new URLSearchParams()
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.gender) params.set('gender', filters.gender)
  if (filters.category) params.set('category', filters.category)
  if (filters.minPrice != null) params.set('minPrice', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('maxPrice', String(filters.maxPrice))
  if (filters.size) params.set('size', filters.size)
  if (filters.inStock != null) params.set('inStock', String(filters.inStock))
  if (filters.page != null) params.set('page', String(filters.page))
  if (filters.size_page != null) params.set('pageSize', String(filters.size_page))

  const qs = params.toString()
  const res = await apiClient.get<PageResponse<Product>>(`/api/products${qs ? `?${qs}` : ''}`)
  return res.data
}

export async function fetchProduct(id: number): Promise<Product> {
  const res = await apiClient.get<Product>(`/api/products/${id}`)
  return res.data
}

export async function fetchBrands(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/api/products/brands')
  return res.data
}

export async function fetchCategories(): Promise<string[]> {
  const res = await apiClient.get<string[]>('/api/products/categories')
  return res.data
}
