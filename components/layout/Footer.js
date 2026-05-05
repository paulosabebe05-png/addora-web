import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/* ── Top strip ── */}
      <div className={styles.topStrip}>
        <div className={styles.topStripInner}>
          <div className={styles.stripItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Cash on Delivery</span>
          </div>
          <div className={styles.stripDivider} />
          <div className={styles.stripItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>1–3 Day Delivery</span>
          </div>
          <div className={styles.stripDivider} />
          <div className={styles.stripItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Quality Guaranteed</span>
          </div>
          <div className={styles.stripDivider} />
          <div className={styles.stripItem}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            <span>Free Delivery in Addis</span>
          </div>
        </div>
      </div>

      {/* ── Main footer body ── */}
      <div className={styles.inner}>

        {/* Brand column */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill="#E75525"/>
              <path d="M8 24 Q16 8 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"/>
              <circle cx="8"  cy="24" r="2.6" fill="white"/>
              <circle cx="16" cy="13" r="2.6" fill="white"/>
              <circle cx="24" cy="24" r="2.6" fill="white"/>
            </svg>
            <span>Addora</span>
          </Link>

          <p className={styles.brandDesc}>
            Ethiopia's trusted online marketplace. Thousands of products, verified sellers, and the convenience of cash on delivery.
          </p>

          {/* Payment methods */}
          <div className={styles.paymentLabel}>Accepted payments</div>
          <div className={styles.paymentBadges}>
            <div className={styles.payBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Cash on Delivery
            </div>
            <div className={styles.payBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Telebirr
            </div>
            <div className={styles.payBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              Chapa
            </div>
          </div>

          {/* Social links */}
          <div className={styles.socials}>
            <a href="https://t.me/addora" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Telegram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </a>
            <a href="https://instagram.com/addora.et" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://facebook.com/addora.et" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>

        {/* Links grid */}
        <div className={styles.links}>

          <div className={styles.col}>
            <h4>Shop</h4>
            <Link href="/">All Products</Link>
            <Link href="/?cat=Kids">Kids & Baby</Link>
            <Link href="/?cat=Electronics">Electronics</Link>
            <Link href="/?cat=Fashion">Fashion</Link>
            <Link href="/?cat=Home">Home & Living</Link>
            <Link href="/?cat=Beauty">Beauty</Link>
          </div>

          <div className={styles.col}>
            <h4>My Account</h4>
            <Link href="/cart">My Cart</Link>
            <Link href="/orders">My Orders</Link>
            <Link href="/auth/signin">Sign In</Link>
            <Link href="/auth/signup">Create Account</Link>
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
            <a href="tel:+251926635307">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>Addis Ababa, Ethiopia</p>
            <p className={styles.hours}>Mon–Sat: 8am – 8pm</p>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <div className={styles.bottomLeft}>
          <p>© {new Date().getFullYear()} Addora Technology PLC. All rights reserved.</p>
          <p className={styles.bottomSub}>Registered in Addis Ababa, Ethiopia</p>
        </div>
        <div className={styles.bottomLinks}>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="mailto:addora@addora.com.et">Support</a>
        </div>
      </div>

    </footer>
  )
}
