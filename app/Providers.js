'use client'
// app/Providers.js
// Single client boundary for all context providers.
// layout.js (Server Component) imports ONLY this file,
// keeping metadata exports and providers cleanly separated.

import { AuthProvider } from '../lib/auth'
import { CartProvider } from '../lib/cart'
import { WishlistProvider } from '../context/WishlistContext'
import { LangProvider } from '../lib/lang'

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <LangProvider>
            {children}
          </LangProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}