'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const pathname = usePathname()
  const { count } = useCart()
  const { user, signOut } = useAuth()

  const links = [
    {
      href: '/',
      label: 'Home',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E75525' : 'none'}
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: '/orders',
      label: 'Orders',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      href: '/cart',
      label: 'Cart',
      isCenter: true,
      icon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      ),
    },
    {
      href: '/wishlist',
      label: 'Wishlist',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
    },
    {
      href: '/account',
      label: 'Account',
      isAccount: true,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className={styles.nav}>
      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : pathname === link.href || pathname.startsWith(link.href + '/')

        if (link.isCenter) {
          return (
            <Link key={link.href} href={link.href} className={styles.centerBtn}>
              {link.icon(false)}
              {count > 0 && (
                <span className={styles.centerBadge}>{count > 9 ? '9+' : count}</span>
              )}
            </Link>
          )
        }

        if (link.isAccount) {
          return (
            <div key={link.href} className={styles.accountWrap}>
              <button
                className={`${styles.item} ${styles.accountBtn} ${active ? styles.active : ''}`}
                onClick={() => {
                  const panel = document.getElementById('accountPanel')
                  if (panel) panel.classList.toggle(styles.panelOpen)
                }}
              >
                {link.icon(active)}
                <span className={styles.label}>{link.label}</span>
              </button>

              {/* Account panel */}
              <div id="accountPanel" className={styles.accountPanel}>
                <div className={styles.panelArrow} />
                {user ? (
                  <>
                    <div className={styles.panelUser}>
                      <div className={styles.panelAvatar}>
                        {user.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div className={styles.panelInfo}>
                        <span className={styles.panelName}>
                          {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                        </span>
                        <span className={styles.panelEmail}>{user.email}</span>
                      </div>
                    </div>
                    <Link href="/orders" className={styles.panelLink} onClick={() => document.getElementById('accountPanel')?.classList.remove(styles.panelOpen)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      My Orders
                    </Link>
                    <Link href="/wishlist" className={styles.panelLink} onClick={() => document.getElementById('accountPanel')?.classList.remove(styles.panelOpen)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      Wishlist
                    </Link>
                    <button className={`${styles.panelLink} ${styles.panelSignOut}`} onClick={() => { signOut(); document.getElementById('accountPanel')?.classList.remove(styles.panelOpen) }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <p className={styles.panelGuest}>Sign in to manage your account</p>
                    <Link href="/auth/signin" className={styles.panelSignIn} onClick={() => document.getElementById('accountPanel')?.classList.remove(styles.panelOpen)}>
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          )
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.item} ${active ? styles.active : ''}`}
          >
            {link.icon(active)}
            <span className={styles.label}>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
