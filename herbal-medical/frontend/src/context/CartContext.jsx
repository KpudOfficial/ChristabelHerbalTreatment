/**
 * Cart context: local cart for guests, synced cart for users.
 * Guest cart lives in localStorage; merges to server on login.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { cartAPI } from '../services/api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)
const LOCAL_CART_KEY = 'herbal_cart'

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState({ items: [], total: 0, item_count: 0 })
  const [loading, setLoading] = useState(false)

  // Load cart
  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.getCart()
        setCart(res.data)
      } catch (_) {}
    } else {
      // Load from localStorage
      const stored = localStorage.getItem(LOCAL_CART_KEY)
      if (stored) {
        try {
          setCart(JSON.parse(stored))
        } catch (_) {}
      }
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  // Persist guest cart to localStorage
  const persistLocalCart = (cartData) => {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cartData))
  }

  const addItem = useCallback(async (product, quantity = 1) => {
    setLoading(true)
    if (isAuthenticated) {
      try {
        const res = await cartAPI.addItem({ product: product.id, quantity })
        setCart(res.data)
        toast.success(`${product.name} added to cart`)
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to add item')
      }
    } else {
      // Guest: manage in state + localStorage
      setCart((prev) => {
        const existingIdx = prev.items.findIndex((i) => i.product === product.id)
        let newItems
        if (existingIdx >= 0) {
          newItems = prev.items.map((item, idx) =>
            idx === existingIdx ? { ...item, quantity: item.quantity + quantity } : item
          )
        } else {
          newItems = [...prev.items, {
            id: Date.now(),
            product: product.id,
            product_detail: product,
            quantity,
            subtotal: product.price * quantity,
          }]
        }
        const newCart = {
          ...prev,
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (parseFloat(i.product_detail?.price || 0) * i.quantity), 0),
          item_count: newItems.reduce((sum, i) => sum + i.quantity, 0),
        }
        persistLocalCart(newCart)
        toast.success(`${product.name} added to cart`)
        return newCart
      })
    }
    setLoading(false)
  }, [isAuthenticated])

  const updateItem = useCallback(async (itemId, quantity) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.updateItem(itemId, quantity)
        setCart(res.data)
      } catch (err) {
        toast.error(err.response?.data?.error || 'Update failed')
      }
    } else {
      setCart((prev) => {
        const newItems = prev.items.map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        )
        const newCart = {
          ...prev,
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (parseFloat(i.product_detail?.price || 0) * i.quantity), 0),
          item_count: newItems.reduce((sum, i) => sum + i.quantity, 0),
        }
        persistLocalCart(newCart)
        return newCart
      })
    }
  }, [isAuthenticated])

  const removeItem = useCallback(async (itemId) => {
    if (isAuthenticated) {
      try {
        const res = await cartAPI.removeItem(itemId)
        setCart(res.data)
        toast.success('Item removed')
      } catch (_) {}
    } else {
      setCart((prev) => {
        const newItems = prev.items.filter((i) => i.id !== itemId)
        const newCart = {
          ...prev,
          items: newItems,
          total: newItems.reduce((sum, i) => sum + (parseFloat(i.product_detail?.price || 0) * i.quantity), 0),
          item_count: newItems.reduce((sum, i) => sum + i.quantity, 0),
        }
        persistLocalCart(newCart)
        return newCart
      })
    }
  }, [isAuthenticated])

  const mergeGuestCart = useCallback(async () => {
    const stored = localStorage.getItem(LOCAL_CART_KEY)
    if (!stored) return
    try {
      const localCart = JSON.parse(stored)
      if (localCart.items?.length) {
        const items = localCart.items.map((i) => ({
          product_id: i.product,
          quantity: i.quantity,
        }))
        const res = await cartAPI.mergeCart(items)
        setCart(res.data)
        localStorage.removeItem(LOCAL_CART_KEY)
      }
    } catch (_) {}
  }, [])

  const clearCart = useCallback(() => {
    setCart({ items: [], total: 0, item_count: 0 })
    localStorage.removeItem(LOCAL_CART_KEY)
  }, [])

  return (
    <CartContext.Provider value={{
      cart, loading, addItem, updateItem, removeItem, fetchCart, mergeGuestCart, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
