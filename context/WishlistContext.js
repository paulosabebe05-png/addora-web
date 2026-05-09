'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('addora_wishlist')
    if (saved) setWishlist(JSON.parse(saved))
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('addora_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  const addToWishlist = (product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) return prev
      return [...prev, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(p => p.id !== productId))
  }

  const isWishlisted = (productId) => wishlist.some(p => p.id === productId)

  const toggleWishlist = (product) => {
    isWishlisted(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)