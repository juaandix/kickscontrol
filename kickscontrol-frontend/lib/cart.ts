import { apiClient } from './api'
import type { ApiResponse } from '@/types'

export interface CartItemDto {
  id: number
  variantId: number
  sku: string
  size: string
  color: string
  productName: string
  productBrand: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  availableStock: number
}

export interface CartDto {
  items: CartItemDto[]
  totalItems: number
  totalAmount: number
}

export async function fetchCart(): Promise<CartDto> {
  const res = await apiClient.get<CartDto>('/api/cart')
  return res.data
}

export async function addToCart(variantId: number, quantity: number): Promise<CartDto> {
  const res = await apiClient.post<CartDto>('/api/cart/items', { variantId, quantity })
  return res.data
}

export async function updateCartItem(itemId: number, quantity: number): Promise<CartDto> {
  const res = await apiClient.put<CartDto>(`/api/cart/items/${itemId}?quantity=${quantity}`, {})
  return res.data
}

export async function removeCartItem(itemId: number): Promise<CartDto> {
  const res = await apiClient.delete<CartDto>(`/api/cart/items/${itemId}`)
  return res.data
}

export async function clearCartApi(): Promise<void> {
  await apiClient.delete('/api/cart')
}

export interface OrderDto {
  id: number
  status: string
  totalAmount: number
  shippingAddress: string
  createdAt: string
  items: OrderItemDto[]
}

export interface OrderItemDto {
  id: number
  variantId: number
  sku: string
  size: string
  color: string
  productName: string
  productBrand: string
  imageUrl: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

export async function checkout(shippingAddress: string): Promise<OrderDto> {
  const res = await apiClient.post<OrderDto>('/api/orders/checkout', { shippingAddress })
  return res.data
}

export async function fetchOrders(): Promise<{ content: OrderDto[] }> {
  const res = await apiClient.get<{ content: OrderDto[] }>('/api/orders')
  return res.data
}

export async function fetchOrder(id: number): Promise<OrderDto> {
  const res = await apiClient.get<OrderDto>(`/api/orders/${id}`)
  return res.data
}
