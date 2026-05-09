'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import NotificationBell from './NotificationBell'
import { useSearch } from './useSearch'
import SearchDropdown from './SearchDropdown'
import MobileSearchOverlay from './MobileSearchOverlay'
import styles from './Header.module.css'

export default function Header() {
  const { user, signOut } = useAuth()
  const { count } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Desktop search state
  const [desktopOpen, setDesktopOpen] = useState(false)
  const desktopRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Mobile overlay
  const [mobileOpen, setMobileOpen] = useState(false)

  const {
    query, setQuery,
    results, loading,
    recent, saveRecent,
    clearRecent, removeRecent,
  } = useSearch()

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [menuOpen])

  // Close desktop dropdown on outside click
  useEffect(() => {
    const close = (e) => {
      if (desktopRef.current && !desktopRef.current.contains(e.target)) {
        setDesktopOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  // Keyboard navigation for desktop dropdown
  const allItems = [...(results.categories || []), ...(results.products || []), ...(recent || [])]
  const handleDesktopKey = (e) => {
    if (!desktopOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Escape') {
      setDesktopOpen(false)
      setActiveIndex(-1)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      commitSearch(query)
    }
  }

  const commitSearch = useCallback((term) => {
    const t = (term || query).trim()
    if (!t) return
    saveRecent(t)
    router.push(`/search?q=${encodeURIComponent(t)}`)
    setDesktopOpen(false)
    setActiveIndex(-1)
  }, [query, saveRecent, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    setMenuOpen(false)
  }

  const announcements = [
    { icon: '✓', text: 'Cash on Delivery' },
    { icon: '⏱', text: '1–3 Day Delivery' },
    { icon: '→', text: 'Free in Addis' },
  ]
  const tickerItems = [...announcements, ...announcements]

  return (
    <>
      <header className={`${styles.header} ${transparent ? styles.transparent : styles.solid}`}>
        <div className={styles.inner}>

          {/* ── Logo ── */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <img src="/logo.png" alt="Addora logo" className={styles.logoImg} />
            </div>
            <span className={styles.logoText}>Addora</span>
          </Link>

          {/* ── Desktop search bar ── */}
          <div
            ref={desktopRef}
            className={`${styles.desktopSearchWrap} ${desktopOpen ? styles.desktopSearchOpen : ''}`}
          >
            <div className={styles.desktopSearch}>
              <span className={styles.desktopSearchIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={e => { setQuery(e.target.value); setDesktopOpen(true) }}
                onFocus={() => setDesktopOpen(true)}
                onKeyDown={handleDesktopKey}
                className={styles.desktopSearchInput}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
              {query && (
                <button
                  className={styles.clearInputBtn}
                  onClick={() => { setQuery(''); setDesktopOpen(true) }}
                  tabIndex={-1}
                  aria-label="Clear"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
              <button
                className={styles.desktopSearchBtn}
                onClick={() => commitSearch(query)}
                type="button"
              >
                Search
              </button>
            </div>

            {/* Dropdown */}
            {desktopOpen && (
              <div className={styles.desktopDropdownWrap}>
                <SearchDropdown
                  query={query}
                  results={results}
                  loading={loading}
                  recent={recent}
                  onSelect={commitSearch}
                  onRemoveRecent={removeRecent}
                  onClearRecent={clearRecent}
                  activeIndex={activeIndex}
                  setActiveIndex={setActiveIndex}
                />
              </div>
            )}
          </div>

          {/* ── Mobile search pill (opens overlay) ── */}
          <div className={styles.mobileSearchRow}>
            <button
              className={styles.mobileSearchPill}
              onClick={() => setMobileOpen(true)}
              type="button"
              aria-label="Open search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <span className={styles.mobileSearchPillText}>Search products...</span>
            </button>
          </div>

          {/* ── Nav links (desktop only) ── */}
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/#products" className={styles.navLink}>Shop</Link>
            <Link href="/categories" className={`${styles.navLink} ${pathname === '/categories' ? styles.navLinkActive : ''}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              Categories
            </Link>
            <Link href="/orders" className={styles.navLink}>Orders</Link>
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.actions}>
            <NotificationBell transparent={transparent} />

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

        {/* ── Announcement strip ── */}
        {isHome && (
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
        )}
      </header>

      {/* ── Mobile search full-screen overlay ── */}
      <MobileSearchOverlay
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        query={query}
        setQuery={setQuery}
        results={results}
        loading={loading}
        recent={recent}
        saveRecent={saveRecent}
        onRemoveRecent={removeRecent}
        onClearRecent={clearRecent}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </>
  )
}
