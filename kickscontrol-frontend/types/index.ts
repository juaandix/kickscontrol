export type UserRole = 'USER' | 'ADMIN' | 'SHIFT_LEADER'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ProductVariant {
  id: number
  size: string
  color: string
  sku: string
  stockQuantity: number
  priceModifier: number
  imageUrl: string | null
  isActive: boolean
}

export interface Product {
  id: number
  name: string
  brand: string
  description: string
  gender: string
  category: string
  basePrice: number
  imageUrl: string | null
  isActive: boolean
  variants: ProductVariant[]
  totalStock?: number
}

export interface CartItem {
  id: number
  variant: ProductVariant & { product: Product }
  quantity: number
}

export interface OrderItem {
  id: number
  variant: ProductVariant & { product: Product }
  quantity: number
  unitPrice: number
}

export interface Order {
  id: number
  status: OrderStatus
  totalAmount: number
  shippingAddress: string
  createdAt: string
  items: OrderItem[]
}

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
  timestamp: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface ProductFilters {
  brand?: string
  category?: string
  gender?: string
  minPrice?: number
  maxPrice?: number
  size?: string
  inStock?: boolean
  page?: number
  size_page?: number
}
