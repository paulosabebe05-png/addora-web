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
  const [search, setSearch] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
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

  const handleSearch = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const transparent = isHome && !scrolled

  // Announcement items — duplicated for seamless ticker loop
  const announcements = [
    { icon: '✓', text: 'Cash on Delivery' },
    { icon: '⏱', text: '1–3 Day Delivery' },
    { icon: '→', text: 'Free in Addis' },
  ]
  const tickerItems = [...announcements, ...announcements] // duplicate for loop

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

          {/* ── Desktop search bar (center) ── */}
          <div className={styles.desktopSearch}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.desktopSearchIcon}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className={styles.desktopSearchInput}
            />
          </div>

          {/* ── Mobile search bar — inline in header bar ── */}
          <div className={styles.mobileSearchRow}>
            <div className={styles.mobileSearchWrap}>
              <span className={styles.mobileSearchIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearch}
                className={styles.mobileSearchInput}
              />
            </div>
          </div>

          {/* ── Nav links (desktop only) ── */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/#products" className={styles.navLink}>Shop</Link>
            <Link href="/orders" className={styles.navLink}>Orders</Link>
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.actions}>
            {/* Notification bell — hide on mobile if not needed */}
            {!isMobile && <NotificationBell />}

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && <span className={styles.cartBadge}>{count > 9 ? '9+' : count}</span>}
            </Link>

            {/* Auth — desktop only (mobile uses bottom nav) */}
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

        {/* ── Orange announcement strip — mobile only ── */}
        <div className={styles.announcementStrip}>
          <div className={styles.announcementInner}>
            {tickerItems.map((item, i) => (
              <span key={i} className={styles.announcementItem}>
                <span>{item.icon}</span>
                <span>{item.text}</span>
                {i < tickerItems.length - 1 && <span className={styles.announcementDot} />}
              </span>
            ))}
          </div>
        </div>
      </header>
    </>
  )
}
