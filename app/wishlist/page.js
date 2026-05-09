'use client'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import styles from '../SharedPage.module.css'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist()

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Account
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>Wishlist</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>❤️</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>My Wishlist</h1>
            <p className={styles.heroSub}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>

        <div className={styles.card}>
          {wishlist.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🛍️</span>
              <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
              <p className={styles.emptySub}>Tap the ❤️ on any product to save it here for later</p>
              <Link href="/" className={styles.emptyBtn}>Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', padding: '16px' }}>
              {wishlist.map(product => (
                <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}
                  >
                    ❤️
                  </button>
                  <div style={{ padding: '8px' }}>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{product.name}</p>
                    <p style={{ color: '#1B5C4E', fontWeight: 700, margin: '4px 0 8px' }}>ETB {product.price}</p>
                    <Link
                      href={`/product/${product.id}`}
                      style={{ display: 'block', textAlign: 'center', background: '#1B5C4E', color: 'white', padding: '6px', borderRadius: '6px', fontSize: 12, textDecoration: 'none' }}
                    >
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
