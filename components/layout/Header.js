'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import NotificationBell from './NotificationBell'
import styles from './Header.module.css'

export default function Header() {
  const { user, signOut } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearch, setMobileSearch] = useState('')

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

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setMenuOpen(false)
  }

  // On mobile home page, handle search submission
  const handleMobileSearch = (e) => {
    if (e.key === 'Enter' && mobileSearch.trim()) {
      router.push(`/?search=${encodeURIComponent(mobileSearch.trim())}`)
    }
  }

  const transparent = isHome && !scrolled

  return (
    <>
      <header className={`${styles.header} ${transparent ? styles.transparent : styles.solid}`}>
        <div className={styles.inner}>

          {/* ── Logo ── */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M8 24 Q16 8 24 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                <circle cx="8"  cy="24" r="2.8" fill="white"/>
                <circle cx="16" cy="13" r="2.8" fill="white"/>
                <circle cx="24" cy="24" r="2.8" fill="white"/>
              </svg>
            </div>
            <span className={styles.logoText}>Addora</span>
          </Link>

          {/* ── Nav links (center) ── */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/#products" className={styles.navLink}>Shop</Link>
            <Link href="/orders" className={styles.navLink}>Orders</Link>
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.actions}>

            <NotificationBell />

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropdownHead}>
                      <div className={styles.dropdownAvatar}>{user.name[0].toUpperCase()}</div>
                      <div>
                        <div className={styles.dropdownName}>{user.name}</div>
                        <div className={styles.dropdownPhone}>{user.email || ''}</div>
                      </div>
                    </div>
                    <Link href="/orders" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      My Orders
                    </Link>
                    <Link href="/cart" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                      My Cart {count > 0 && <span className={styles.inlineCount}>{count}</span>}
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownSignOut} onClick={handleSignOut}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
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

        {/* ── Mobile search row (visible only on mobile) ── */}
        <div className={styles.mobileSearchRow}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span className={styles.mobileSearchIcon} style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              color: 'rgba(255,255,255,0.4)'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products..."
              value={mobileSearch}
              onChange={e => setMobileSearch(e.target.value)}
              onKeyDown={handleMobileSearch}
              className={styles.mobileSearchInput}
            />
          </div>
        </div>
      </header>
    </>
  )
}
