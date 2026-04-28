'use client'

import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import styles from './Header.module.css'

export default function Header() {
  const { user, signOut } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  const transparent = isHome && !scrolled

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : styles.solid}`}>
      <div className={styles.inner}>

        {/* ── Logo (YOUR IMAGE) ── */}
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <Image
              src="/logo.png"
              alt="Addora Logo"
              width={34}
              height={34}
              priority
            />
          </div>
          <span className={styles.logoText}>Addora</span>
        </Link>

        {/* ── Nav links ── */}
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/#products" className={styles.navLink}>Shop</Link>
          <Link href="/orders" className={styles.navLink}>Orders</Link>
        </nav>

        {/* ── Right actions ── */}
        <div className={styles.actions}>

          {/* Cart */}
          <Link href="/cart" className={styles.cartBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className={styles.cartBadge}>{count > 9 ? '9+' : count}</span>}
          </Link>

          {/* Auth */}
          {user ? (
            <div className={styles.userMenu} onClick={e => e.stopPropagation()}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <span className={styles.avatar}>{user.name[0].toUpperCase()}</span>
                <span className={styles.userName}>{user.name.split(' ')[0]}</span>
              </button>

              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHead}>
                    <div className={styles.dropdownAvatar}>
                      {user.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.dropdownName}>{user.name}</div>
                      <div className={styles.dropdownPhone}>{user.phone}</div>
                    </div>
                  </div>

                  <Link href="/orders" className={styles.dropdownItem}>
                    My Orders
                  </Link>

                  <Link href="/cart" className={styles.dropdownItem}>
                    My Cart
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button className={styles.dropdownSignOut} onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authBtns}>
              <Link href="/auth/signin" className={styles.signinBtn}>Sign In</Link>
              <Link href="/auth/signup" className={styles.signupBtn}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}