'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '../../../lib/cart'
import { useAuth } from '../../../lib/auth'
import { useRouter } from 'next/navigation'
import styles from './store.module.css'

export default function StorePageClient({ store, products = [] }) {
  const { user }    = useAuth()
  const { addItem } = useCart()
  const router      = useRouter()

  const [search,  setSearch]  = useState('')
  const [sortBy,  setSortBy]  = useState('newest')
  const [addedId, setAddedId] = useState(null)

  const filtered = products
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_asc')  return a.price - b.price
      if (sortBy === 'price_desc') return b.price - a.price
      if (sortBy === 'discount')   return (b.discount ?? 0) - (a.discount ?? 0)
      return 0 // newest (db order)
    })

  const handleAddToCart = (product) => {
    if (!user) { router.push(`/auth/signin?redirect=/stores/${store.id}`); return }
    const finalPrice = product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : Number(product.price)
    addItem({ id: product.id, name: product.name, price: finalPrice, image_url: product.image_url, qty: 1 })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 2000)
  }

  return (
    <div className={styles.page}>

      {/* ── Store Header ── */}
      <div className={styles.storeHeader}>
        <div className={styles.storeHeaderInner}>
          <div className={styles.storeAvatar}>
            {store.logo_url
              ? <img src={store.logo_url} alt={store.name} className={styles.storeAvatarImg} />
              : <span className={styles.storeAvatarLetter}>{store.name?.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div className={styles.storeHeaderInfo}>
            <div className={styles.storeHeaderNameRow}>
              <h1 className={styles.storeHeaderName}>{store.name}</h1>
              {store.verified && (
                <span className={styles.verifiedBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb" stroke="none">
                    <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  Verified Seller
                </span>
              )}
            </div>
            {store.rating > 0 && (
              <div className={styles.storeRatingRow}>
                {[1,2,3,4,5].map(n => (
                  <svg key={n} width="13" height="13" viewBox="0 0 24 24"
                    fill={n <= Math.round(store.rating) ? '#f59e0b' : 'none'}
                    stroke="#f59e0b" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                <span className={styles.ratingVal}>{Number(store.rating).toFixed(1)}</span>
              </div>
            )}
            <p className={styles.productCount}>{products.length} product{products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.sortSelect}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div className={styles.gridWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p>No products found</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(product => {
              const isOos = (product.stock ?? 0) <= 0
              const finalPrice = product.discount > 0
                ? product.price * (1 - product.discount / 100)
                : Number(product.price)
              const isAdded = addedId === product.id

              return (
                <div key={product.id} className={styles.card}>
                  <Link href={`/products/${product.id}`} className={styles.cardImgWrap}>
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className={styles.cardImg} />
                      : <div className={styles.cardNoImg}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                        </div>
                    }
                    {product.discount > 0 && (
                      <span className={styles.discBadge}>-{product.discount}%</span>
                    )}
                    {isOos && (
                      <div className={styles.oosOverlay}>Out of Stock</div>
                    )}
                  </Link>

                  <div className={styles.cardBody}>
                    <Link href={`/products/${product.id}`} className={styles.cardName}>{product.name}</Link>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardPricing}>
                        <span className={styles.cardPrice}>ETB {Number(finalPrice).toLocaleString()}</span>
                        {product.discount > 0 && (
                          <span className={styles.cardOrigPrice}>ETB {Number(product.price).toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        className={`${styles.addBtn} ${isOos ? styles.addBtnDisabled : ''} ${isAdded ? styles.addBtnAdded : ''}`}
                        onClick={() => !isOos && handleAddToCart(product)}
                        disabled={isOos}
                        aria-label="Add to cart"
                      >
                        {isAdded ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                          </svg>
                        )}
                        <span className={styles.addBtnText}>{isAdded ? 'Added!' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}