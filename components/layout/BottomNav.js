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
      href: '/categories',
      label: 'Categories',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      ),
    },
    {
      href: '/account',
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
