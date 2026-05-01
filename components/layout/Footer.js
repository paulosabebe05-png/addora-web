import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#E75525"/>
              <path d="M8 24 Q16 8 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="8" cy="24" r="2.5" fill="white"/>
              <circle cx="16" cy="13" r="2.5" fill="white"/>
              <circle cx="24" cy="24" r="2.5" fill="white"/>
            </svg>
            <span>Addora</span>
          </div>
          <p>Ethiopia's trusted local eCommerce platform. Shop confidently, pay when delivered.</p>
          <div className={styles.codBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Cash on Delivery Only
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>Shop</h4>
            <Link href="/">All Products</Link>
            <Link href="/?cat=kids">Kids Clothing</Link>
            <Link href="/cart">My Cart</Link>
            <Link href="/orders">My Orders</Link>
          </div>

          <div className={styles.col}>
            <h4>Delivery</h4>
            <p>Addis Ababa: 1–2 days</p>
            <p>Other cities: 3–5 days</p>
            <p>Pay when you receive</p>
            <p>Free returns on defects</p>
          </div>

          <div className={styles.col}>
            <h4>Contact</h4>
            <a href="tel:+251900000000">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">support@addora.et</a>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Addora Technology PLC. All rights reserved.</p>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
