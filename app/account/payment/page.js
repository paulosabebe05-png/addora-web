'use client'
import Link from 'next/link'
import styles from '../../SharedPage.module.css'

export default function PaymentPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Account
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>Payment Methods</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>💳</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Payment Methods</h1>
            <p className={styles.heroSub}>Telebirr, CBE Birr, and cash on delivery</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Accepted Payments</p>
          </div>
          {[
            { icon: '📱', label: 'Telebirr', sub: 'Pay via Telebirr mobile wallet' },
            { icon: '🏦', label: 'CBE Birr', sub: 'Pay via Commercial Bank of Ethiopia' },
            { icon: '💵', label: 'Cash on Delivery', sub: 'Pay when your order arrives' },
          ].map(m => (
            <div key={m.label} className={styles.row}>
              <div className={styles.rowIcon}>{m.icon}</div>
              <div className={styles.rowText}>
                <div className={styles.rowLabel}>{m.label}</div>
                <div className={styles.rowSub}>{m.sub}</div>
              </div>
              <svg className={styles.rowChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Saved Payment Info</p>
          </div>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>💳</span>
            <h2 className={styles.emptyTitle}>No saved payment info</h2>
            <p className={styles.emptySub}>Payment details will appear here after your first order</p>
          </div>
        </div>
      </div>
    </div>
  )
}