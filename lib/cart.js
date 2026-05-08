'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const CartContext = createContext(null)

// Unique key per cart line: variant_id if present, otherwise product id
const lineKey = (item) => item.variant_id ? `${item.id}__${item.variant_id}` : item.id

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('addora_cart')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch { /* ignore corrupt data */ }
    }
  }, [])

  // Always write through functional setState so we never read stale closure state
  const save = useCallback((updater) => {
    setItems(prev => {
      const newItems = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('addora_cart', JSON.stringify(newItems))
      return newItems
    })
  }, [])

  const addItem = useCallback((product) => {
    const key = lineKey(product)
    save(prev => {
      const existing = prev.find(i => lineKey(i) === key)
      if (existing) {
        return prev.map(i => lineKey(i) === key
          ? { ...i, qty: i.qty + (product.qty ?? 1) }
          : i
        )
      }
      return [...prev, { ...product, qty: product.qty ?? 1 }]
    })
  }, [save])

  const removeItem = useCallback((key) => {
    save(prev => prev.filter(i => lineKey(i) !== key))
  }, [save])

  const updateQty = useCallback((key, qty) => {
    if (qty < 1) return removeItem(key)
    save(prev => prev.map(i => lineKey(i) === key ? { ...i, qty } : i))
  }, [save, removeItem])

  const clearCart = useCallback(() => save([]), [save])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
