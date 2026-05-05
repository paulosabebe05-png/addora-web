import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Addora"
              width={28}
              height={28}
              className={styles.logoImg}
            />
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
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Addora Technology PLC. All rights reserved.</p>
        <div className={styles.bottomLinks}>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="/refund-policy">Refund Policy</a>
        </div>
      </div>
    </footer>
  )
}
