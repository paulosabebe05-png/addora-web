'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const CartContext = createContext(null)

// Unique key per cart line: variant_id if present, otherwise product id
const lineKey = (item) => item.variant_id ? `${item.id}__${item.variant_id}` : item.id

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('addora_cart')
    if (stored) setItems(JSON.parse(stored))
  }, [])

  const save = (newItems) => {
    setItems(newItems)
    localStorage.setItem('addora_cart', JSON.stringify(newItems))
  }

  const addItem = (product) => {
    const key = lineKey(product)
    const existing = items.find(i => lineKey(i) === key)
    if (existing) {
      // Stock was already decremented by the RPC for product.qty units,
      // so just add that qty on top of what's already in the cart
      save(items.map(i => lineKey(i) === key
        ? { ...i, qty: i.qty + (product.qty ?? 1) }
        : i
      ))
    } else {
      // New cart line — respect the qty passed in (from the product page qty selector)
      save([...items, { ...product, qty: product.qty ?? 1 }])
    }
  }

  const removeItem = (key) => save(items.filter(i => lineKey(i) !== key))

  const updateQty = (key, qty) => {
    if (qty < 1) return removeItem(key)
    save(items.map(i => lineKey(i) === key ? { ...i, qty } : i))
  }

  const clearCart = () => save([])

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
