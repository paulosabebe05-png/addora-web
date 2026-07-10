'use client'
import Link                                         from 'next/link'
import Image                                        from 'next/image'
import { useAuth }                                  from '../../lib/auth'
import { useCart }                                  from '../../lib/cart'
import { useLang }                                  from '../../lib/lang'
import { useRouter, usePathname }                   from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import dynamic                                      from 'next/dynamic'
import { useSearch }                                from '../search/useSearch'
import LangToggle                                   from '../ui/LangToggle'
import styles                                       from './Header.module.css'

/*
  Heavy components loaded only after the page is interactive.
  This eliminates them from the critical render path — the main
  cause of the 720ms render-blocking insight in PageSpeed.

  NotificationBell: makes a Supabase realtime subscription on mount
  SearchDropdown:   renders a large dropdown with images
  MobileSearchOverlay: full-screen overlay — never needed on first paint
*/
const NotificationBell     = dynamic(() => import('./NotificationBell'),           { ssr: false })
const SearchDropdown       = dynamic(() => import('../search/SearchDropdown'),      { ssr: false })
const MobileSearchOverlay  = dynamic(() => import('./MobileSearchOverlay'),         { ssr: false })

export default function Header() {
  const { user, signOut } = useAuth()
  const { count }         = useCart()
  const { tr }            = useLang()
  const router            = useRouter()
  const pathname          = usePathname()
  const [menuOpen, setMenuOpen]   = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  // Desktop search state
  const [desktopOpen, setDesktopOpen] = useState(false)
  const desktopRef                    = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Mobile overlay
  const [mobileOpen, setMobileOpen] = useState(false)

  const {
    query, setQuery,
    results, loading,
    recent, saveRecent,
    clearRecent, removeRecent,
  } = useSearch()

  const isHome    = pathname === '/'
  const transparent = isHome && !scrolled

  /*
    Defer non-critical effects until after first paint.
    `mounted` gate ensures heavy dynamic imports + subscriptions
    don't block the initial render.
  */
  useEffect(() => {
    setMounted(true)
  }, [])

  // Scroll listener — passive, no render impact
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

  const allItems = [
    ...(results.categories || []),
    ...(results.products   || []),
    ...(recent             || []),
  ]

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

  // Guard against user.name being empty/undefined (e.g. phone sign-ins
  // that never set a display name) so this never throws.
  const displayName = user?.name || 'User'
  const initial      = displayName.charAt(0).toUpperCase()

  return (
    <>
      <header className={`${styles.header} ${transparent ? styles.transparent : styles.solid}`}>
        <div className={styles.inner}>

          {/* ── Logo ── */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoMark}>
              <Image
                src="/logo.png"
                alt="Addora logo"
                width={32}
                height={32}
                className={styles.logoImg}
                priority
                fetchPriority="high"
              />
            </div>
            <span className={styles.logoText}>Addora</span>
          </Link>

          {/* ── Desktop search bar ── */}
          <div ref={desktopRef} className={styles.desktopSearchWrap}>
            <div className={styles.desktopSearch}>
              <span className={styles.desktopSearchIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                placeholder={tr('searchPlaceholder')}
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
                  aria-label={tr('clear')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
              <button
                className={styles.desktopSearchBtn}
                onClick={() => commitSearch(query)}
                type="button"
              >
                {tr('search')}
              </button>
            </div>

            {/*
              Only render dropdown after mount — keeps it out of SSR HTML
              and off the critical render path entirely.
            */}
            {mounted && desktopOpen && (
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

          {/* ── Desktop nav links ── */}
          <nav className={styles.nav}>
            <Link href="/"          className={styles.navLink}>{tr('home')}</Link>
            <Link href="/#products" className={styles.navLink}>{tr('shop')}</Link>
            <Link
              href="/categories"
              className={`${styles.navLink} ${pathname === '/categories' ? styles.navLinkActive : ''}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3"  y="3"  width="7" height="7" rx="1.5"/>
                <rect x="14" y="3"  width="7" height="7" rx="1.5"/>
                <rect x="3"  y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              {tr('categories')}
            </Link>
            <Link href="/orders" className={styles.navLink}>{tr('orders')}</Link>
          </nav>

          {/* ── Right actions ── */}
          <div className={styles.actions}>
            <LangToggle transparent={transparent} />

            {/*
              NotificationBell is dynamic (ssr:false) — it makes a Supabase
              realtime subscription. Rendering it only after mount prevents
              it from blocking the initial paint.
            */}
            {mounted && <NotificationBell transparent={transparent} />}

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn} aria-label={tr('cart')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {count > 0 && (
                <span className={styles.cartBadge}>{count > 9 ? '9+' : count}</span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className={styles.userMenu} onClick={e => e.stopPropagation()}>
                <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                  <span className={styles.avatar}>{initial}</span>
                  <span className={styles.userName}>{displayName.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div className={styles.dropdown}>
                    <Link href="/account" className={styles.dropdownHead}
                      onClick={() => setMenuOpen(false)}
                      style={{ textDecoration: 'none', cursor: 'pointer' }}>
                      <div className={styles.dropdownAvatar}>{initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.dropdownName}>{displayName}</div>
                        <div className={styles.dropdownPhone}>{user.email || ''}</div>
                      </div>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="#bbb" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </Link>
                    <Link href="/account" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {tr('accountManagement')}
                    </Link>
                    <Link href="/orders" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {tr('myOrders')}
                    </Link>
                    <Link href="/cart" className={styles.dropdownItem} onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                      </svg>
                      {tr('myCart')} {count > 0 && <span className={styles.inlineCount}>{count}</span>}
                    </Link>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownSignOut} onClick={handleSignOut}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      {tr('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authBtns}>
                <Link href="/auth/signin" className={styles.signinBtn}>{tr('signIn')}</Link>
                <Link href="/auth/signup" className={styles.signupBtn}>{tr('signUp')}</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Only mount overlay after hydration — it's never needed on first paint */}
      {mounted && (
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
      )}
    </>
  )
}
