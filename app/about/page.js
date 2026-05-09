import Link from 'next/link'
import styles from '../SharedPage.module.css'

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Account
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>About Addora</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>ℹ️</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>About Addora</h1>
            <p className={styles.heroSub}>Ethiopia's favorite online shopping destination</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>10K+</span>
            <span className={styles.statBoxLabel}>Products</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>1–3</span>
            <span className={styles.statBoxLabel}>Day Delivery</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>100%</span>
            <span className={styles.statBoxLabel}>Verified</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><p className={styles.cardTitle}>Our Story</p></div>
          <div className={styles.prose}>
            <h2>Shop More. Pay Less. Love More.</h2>
            <p>Addora is Ethiopia's fastest-growing e-commerce platform, built to make online shopping simple, affordable, and reliable for everyone in Addis Ababa and beyond.</p>
            <p>We partner with verified local and international sellers to bring you a wide range of fashion, electronics, home goods, beauty products, and more — delivered straight to your door in 1–3 days.</p>
            <h2>Why Addora?</h2>
            <ul>
              <li>✓ Cash on Delivery — pay when you receive your order</li>
              <li>✓ Free delivery within Addis Ababa</li>
              <li>✓ 100% verified sellers and authentic products</li>
              <li>✓ Easy returns within 7 days</li>
              <li>✓ 24/7 customer support</li>
            </ul>
            <h2>Contact</h2>
            <p>📞 +251 926 635 307 &nbsp;·&nbsp; ✉️ support@addora.com.et &nbsp;·&nbsp; 🌐 addora.com.et</p>
            <p style={{ color: '#bbb', fontSize: '12px', marginTop: '20px' }}>© 2025 Addora Technology PLC · Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </div>
    </div>
  )
}