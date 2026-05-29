'use client'

import {
  createContext, useContext, useReducer, useEffect, useCallback,
  type ReactNode
} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCart, addToCart, updateCartItem, removeCartItem, clearCartApi,
  type CartDto, type CartItemDto
} from '@/lib/cart'
import { useAuth } from './AuthContext'

interface CartContextValue {
  items: CartItemDto[]
  totalItems: number
  totalAmount: number
  isOpen: boolean
  isLoading: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (variantId: number, quantity: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useReducer((_: boolean, v: boolean) => v, false)

  const { data: cart, isLoading } = useQuery<CartDto>({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: isAuthenticated,
    initialData: { items: [], totalItems: 0, totalAmount: 0 },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['cart'] })

  const addMutation = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: number; quantity: number }) =>
      addToCart(variantId, quantity),
    onSuccess: () => invalidate(),
  })

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      updateCartItem(itemId, quantity),
    onSuccess: () => invalidate(),
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: number) => removeCartItem(itemId),
    onSuccess: () => invalidate(),
  })

  const clearMutation = useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => invalidate(),
  })

  const addItem = useCallback(async (variantId: number, quantity: number) => {
    await addMutation.mutateAsync({ variantId, quantity })
    setIsOpen(true)
  }, [addMutation])

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    await updateMutation.mutateAsync({ itemId, quantity })
  }, [updateMutation])

  const removeItem = useCallback(async (itemId: number) => {
    await removeMutation.mutateAsync(itemId)
  }, [removeMutation])

  const clearCart = useCallback(async () => {
    await clearMutation.mutateAsync()
  }, [clearMutation])

  return (
    <CartContext.Provider value={{
      items: cart?.items ?? [],
      totalItems: cart?.totalItems ?? 0,
      totalAmount: cart?.totalAmount ?? 0,
      isOpen,
      isLoading,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateItem,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
