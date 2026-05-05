'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { user, signOut } = useAuth()

  const accountLinks = [
    {
      group: 'My Account',
      items: [
        { href: '/orders', label: 'My Orders', desc: 'Track, return or buy again', icon: '📦' },
        { href: '/wishlist', label: 'Wishlist', desc: 'Saved items for later', icon: '❤️' },
        { href: '/account/addresses', label: 'Addresses', desc: 'Delivery addresses', icon: '📍' },
        { href: '/account/payment', label: 'Payment Methods', desc: 'Telebirr, CBE Birr & more', icon: '💳' },
        { href: '/account/notifications', label: 'Notifications', desc: 'Manage alerts', icon: '🔔' },
      ],
    },
    {
      group: 'Help & Legal',
      items: [
        { href: '/help', label: 'Help Center', desc: 'FAQs and support', icon: '💬' },
        { href: '/contact', label: 'Contact Us', desc: 'Get in touch with us', icon: '📞' },
        { href: '/refund-policy', label: 'Refund & Returns', desc: 'Our return policy', icon: '🔄' },
        { href: '/privacy', label: 'Privacy Policy', desc: 'How we use your data', icon: '🔒' },
        { href: '/terms', label: 'Terms of Service', desc: 'Terms and conditions', icon: '📋' },
        { href: '/about', label: 'About Addora', desc: 'Our story and mission', icon: 'ℹ️' },
      ],
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Account</h1>
          {user ? (
            <div className={styles.userCard}>
              <div className={styles.avatar}>
                {user.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <Link href="/account/edit" className={styles.editBtn}>Edit</Link>
            </div>
          ) : (
            <div className={styles.guestCard}>
              <div className={styles.guestIcon}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.guestText}>
                <span className={styles.guestTitle}>Welcome to Addora</span>
                <span className={styles.guestSub}>Sign in to access your account</span>
              </div>
              <div className={styles.authButtons}>
                <Link href="/auth/signin" className={styles.signInBtn}>Sign In</Link>
                <Link href="/auth/signup" className={styles.signUpBtn}>Register</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {user && (
        <div className={styles.statsBar}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>0</span>
            <span className={styles.statLabel}>Orders</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>0</span>
            <span className={styles.statLabel}>Wishlist</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>0</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
        </div>
      )}

      <div className={styles.affiliateBanner}>
        <div className={styles.affiliateLeft}>
          <span className={styles.affiliateEarn}>Earn with Addora</span>
          <span className={styles.affiliateDesc}>Share products & earn on every sale</span>
        </div>
        <Link href="/affiliates" className={styles.affiliateJoin}>Join →</Link>
      </div>

      <div className={styles.sections}>
        {accountLinks.map((group) => (
          <div key={group.group} className={styles.group}>
            <span className={styles.groupLabel}>{group.group}</span>
            <div className={styles.groupCard}>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className={styles.linkRow}>
                  <span className={styles.linkIcon}>{item.icon}</span>
                  <div className={styles.linkText}>
                    <span className={styles.linkLabel}>{item.label}</span>
                    <span className={styles.linkDesc}>{item.desc}</span>
                  </div>
                  {item.badge && <span className={styles.badge}>{item.badge}</span>}
                  <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {user && (
        <button className={styles.signOutBtn} onClick={signOut}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      )}

      <div className={styles.footer}>
        <span className={styles.footerLogo}>Addora</span>
        <span className={styles.footerSub}>© 2025 Addora Technology PLC · Addis Ababa, Ethiopia</span>
        <div className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link>
          <span>·</span>
          <Link href="/terms">Terms</Link>
          <span>·</span>
          <Link href="/contact">Contact</Link>
        </div>
      </div>
      <div className={styles.bottomPad} />
    </div>
  )
}
