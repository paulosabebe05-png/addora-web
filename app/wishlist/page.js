'use client'
import Link from 'next/link'
import styles from '../SharedPage.module.css'

export default function WishlistPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
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
            <p className={styles.heroSub}>Save items you love and buy them later</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛍️</span>
            <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
            <p className={styles.emptySub}>Tap the ❤️ on any product to save it here for later</p>
            <Link href="/" className={styles.emptyBtn}>Browse Products</Link>
          </div>
        </div>
      </div>
    </div>
  )
}