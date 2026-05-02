'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '../../lib/cart'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const pathname = usePathname()
  const { count } = useCart()

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
      href: '/?explore=1',
      label: 'Explore',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
      href: '/orders',
      label: 'Account',
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
        const active = pathname === link.href || (link.href === '/' && pathname === '/')

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