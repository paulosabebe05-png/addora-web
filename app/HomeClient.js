'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../components/ui/ProductCard'
import { useCart } from '../../lib/cart'
import styles from './HomeClient.module.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, reviews, sold, badge, created_at, category_id, stock, active'

// ── Categories hook — fetches from DB (parent categories only) ──
function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, icon')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setCategories(data || []))
  }, [])
  return categories
}

const CAT_PILLS = [
  { label: 'All',           icon: '🛍️' },
  { label: 'Kids',          icon: '🧸' },
  { label: 'Electronics',   icon: '📱' },
  { label: 'Home & Living', icon: '🛋️' },
  { label: 'Beauty',        icon: '💄' },
  { label: 'Fashion',       icon: '👗' },
  { label: 'Watches',       icon: '⌚' },
  { label: 'Sports',        icon: '⚽' },
]

// ── Countdown timer ──
function useCountdown(targetHours = 6) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 })
  useEffect(() => {
    const end = Date.now() + targetHours * 3600 * 1000
    const tick = () => {
      const diff = Math.max(0, end - Date.now())
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return time
}

// ── Section products hook ──
function useSectionProducts(sectionValue, { orderCol = 'created_at', ascending = false, limit = 10 } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', sectionValue)
        .order(orderCol, { ascending }).limit(limit)
      if (error) console.error(`Section [${sectionValue}] error:`, error)
      setProducts(data || [])
      setLoading(false)
    }
    fetchData()
  }, [sectionValue])
  return { products, loading }
}

// ── All products hook ──
function useAllProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).order('created_at', { ascending: false })
      if (error) console.error('All-products error:', error)
      setProducts(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])
  return { products, loading }
}

// ── Banners hook — fetches device-specific + 'all' banners ──
function useBanners(device) {
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('banners').select('id, image_url, target_url, title, sort_order, device')
          .eq('active', true).in('device', [device, 'all']).order('sort_order', { ascending: true })
        if (error) throw error
        setBanners(data || [])
      } catch (err) {
        setBanners([])
      } finally {
        setLoadingBanners(false)
      }
    }
    fetchData()
  }, [device])
  return { banners, loadingBanners }
}

// ── Skeleton card ──
function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '50%' }} />
        <div className={styles.skeletonLine} style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// ── Banner dots ──
function BannerDots({ count, active, onSelect }) {
  if (count <= 1) return null
  return (
    <div className={styles.bannerDots}>
      {[...Array(count)].map((_, i) => (
        <button key={i}
          className={`${styles.bannerDot} ${i === active ? styles.bannerDotActive : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
        />
      ))}
    </div>
  )
}

// ── Hero Banner Carousel ──
function HeroBannerCarousel({ banners, loading }) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setActiveIdx(i => (i + 1) % banners.length), 4000)
    return () => clearInterval(id)
  }, [banners.length])

  if (loading) return <div className={styles.heroBannerSkeleton} />
  if (!banners.length) {
    return (
      <div className={styles.heroBannerFallback}>
        <div className={styles.heroBannerFallbackContent}>
          <span className={styles.heroBannerTag}>🔥 Limited Time</span>
          <h2 className={styles.heroBannerTitle}>Up to 50% Off<br />Top Products</h2>
          <p className={styles.heroBannerSub}>Shop the best deals in Ethiopia</p>
          <Link href="/?cat=sale" className={styles.heroBannerCta}>Shop Now →</Link>
        </div>
        <div className={styles.heroBannerFallbackOrb} />
      </div>
    )
  }

  const banner = banners[activeIdx]
  return (
    <div className={styles.heroBannerWrap}>
      <div
        className={styles.heroBannerSlide}
        key={activeIdx}
        style={{ cursor: banner.target_url ? 'pointer' : 'default' }}
        onClick={() => banner.target_url && router.push(banner.target_url)}
        onTouchStart={e => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (!touchStartX.current) return
          const diff = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(diff) > 40) setActiveIdx(i => diff > 0 ? (i+1)%banners.length : (i-1+banners.length)%banners.length)
          touchStartX.current = null
        }}
      >
        <img src={banner.image_url} alt={banner.title || ''} className={styles.heroBannerImg} />
      </div>
      <BannerDots count={banners.length} active={activeIdx} onSelect={setActiveIdx} />
      {banners.length > 1 && (
        <>
          <button className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`}
            onClick={() => setActiveIdx(i => (i - 1 + banners.length) % banners.length)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
            onClick={() => setActiveIdx(i => (i + 1) % banners.length)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}
    </div>
  )
}

// ── Section header ──
function SectionHeader({ label, title, countdown, seeAllHref }) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionHeadLeft}>
        <div className={styles.sectionAccentBar} />
        <div>
          {label && <p className={styles.sectionLabel}>{label}</p>}
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>
        {countdown && (
          <div className={styles.timerPill}>
            <span className={styles.timerLabel}>Ends in</span>
            {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((seg, i) => (
              <span key={i} className={styles.timerGroup}>
                <span className={styles.timerBox}>{seg}</span>
                {i < 2 && <span className={styles.timerColon}>:</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} className={styles.seeAll}>View All →</Link>
      )}
    </div>
  )
}

// ── Horizontal scroll product row ──
function ProductRow({ products, loading, itemWidth = 200 }) {
  if (loading) {
    return (
      <div className={styles.hScrollRow}>
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  if (!products.length) return null
  return (
    <div className={styles.hScrollRow}>
      {products.map(p => (
        <div key={p.id} className={styles.hScrollItem} style={{ width: itemWidth }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ── Category icon grid ──
function CategoryGrid() {
  const icons = [
    { label: 'Phones',     icon: '📱', slug: 'electronics' },
    { label: 'Computers',  icon: '💻', slug: 'computers' },
    { label: 'SmartWatch', icon: '⌚', slug: 'watches' },
    { label: 'Camera',     icon: '📷', slug: 'camera' },
    { label: 'Headphones', icon: '🎧', slug: 'headphones' },
    { label: 'Gaming',     icon: '🎮', slug: 'gaming' },
    { label: 'Fashion',    icon: '👗', slug: 'fashion' },
    { label: 'Beauty',     icon: '💄', slug: 'beauty' },
    { label: 'Home',       icon: '🛋️', slug: 'home' },
    { label: 'Sports',     icon: '⚽', slug: 'sports' },
    { label: "Baby's",     icon: '🧸', slug: 'kids' },
    { label: 'Health',     icon: '💊', slug: 'medicine' },
  ]
  return (
    <div className={styles.catGrid}>
      {icons.map((c, i) => (
        <Link key={c.slug} href={`/?cat=${c.slug}`} className={styles.catGridItem}>
          <div className={`${styles.catGridIcon} ${i === 3 ? styles.catGridIconActive : ''}`}>
            <span className={styles.catGridEmoji}>{c.icon}</span>
          </div>
          <span className={styles.catGridLabel}>{c.label}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Promo Banner — hardcoded, no DB needed ──
function PromoBanner() {
  const STATS = [
    { n: '200+', l: 'Products' },
    { n: '1–3',  l: 'Day Delivery' },
    { n: '100%', l: 'Cash on Delivery' },
    { n: '4.9★', l: 'Rating' },
  ]
  const FEATURES = [
    { icon: '🚀', text: 'Fast delivery across Addis Ababa' },
    { icon: '💳', text: 'Pay cash when order arrives' },
    { icon: '✅', text: 'Verified local vendors only' },
    { icon: '🔄', text: '30-day return guarantee' },
  ]
  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBannerLeft}>
        <span className={styles.promoLabel}>Why Shop With Us</span>
        <h3 className={styles.promoTitle}>
          Ethiopia's Most<br />Trusted Marketplace
        </h3>
        <div className={styles.promoFeatures}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.promoFeatureItem}>
              <span className={styles.promoFeatureIcon}>{f.icon}</span>
              <span className={styles.promoFeatureText}>{f.text}</span>
            </div>
          ))}
        </div>
        <div className={styles.promoStats}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.promoStat}>
              <span className={styles.promoStatNum}>{s.n}</span>
              <span className={styles.promoStatLabel}>{s.l}</span>
            </div>
          ))}
        </div>
        <Link href="/categories" className={styles.promoCta}>
          Start Shopping →
        </Link>
      </div>
      <div className={styles.promoBannerRight}>
        <div className={styles.promoImgOrb} />
        <div className={styles.promoImgPlaceholder}>
          <div className={styles.promoIconStack}>
            <span style={{ fontSize: 52 }}>🛍️</span>
            <span style={{ fontSize: 28, position: 'absolute', bottom: 10, right: 10 }}>✅</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Trust badges strip ──
function TrustStrip() {
  const items = [
    { icon: '🚚', title: 'Free & Fast Delivery', sub: 'Free delivery in Addis Ababa' },
    { icon: '📞', title: '24/7 Customer Service', sub: 'Friendly 24/7 customer support' },
    { icon: '🔒', title: 'Money Back Guarantee', sub: 'We return money within 30 days' },
  ]
  return (
    <div className={styles.trustStrip}>
      {items.map((t, i) => (
        <div key={i} className={styles.trustItem}>
          <div className={styles.trustIconWrap}>
            <span style={{ fontSize: 28 }}>{t.icon}</span>
          </div>
          <div>
            <p className={styles.trustTitle}>{t.title}</p>
            <p className={styles.trustSub}>{t.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════
// MOBILE BOTTOM NAVIGATION BAR  ← NEW
// ══════════════════════════════════════════
function MobileBottomNav() {
  const pathname = usePathname()
  const { count } = useCart()

  const tabs = [
    {
      href: '/',
      label: 'Home',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E75525' : 'none'}
          stroke={active ? '#E75525' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      ),
    },
    {
      href: '/cart',
      label: 'Cart',
      badge: count > 0 ? count : null,
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      href: '/orders',
      label: 'Orders',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
    {
      href: '/auth/signin',
      label: 'Account',
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? '#E75525' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  return (
    <nav className={styles.mobileBottomNav} aria-label="Mobile navigation">
      {tabs.map(tab => {
        const active = pathname === tab.href
        return (
          <Link key={tab.href} href={tab.href} className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ''}`}>
            <span className={styles.mobileNavIconWrap}>
              {tab.icon(active)}
              {tab.badge && (
                <span className={styles.mobileNavBadge}>
                  {tab.badge > 9 ? '9+' : tab.badge}
                </span>
              )}
            </span>
            <span className={styles.mobileNavLabel}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Main export ──
export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const countdown = useCountdown(6)
  const dbCategories = useCategories()

  const { banners: desktopBanners, loadingBanners: loadingDesktop } = useBanners('desktop')
  const { banners: mobileBanners,  loadingBanners: loadingMobile  } = useBanners('mobile')

  const { products: flashProducts,  loading: loadingFlash }  = useSectionProducts('flash_sale',   { orderCol: 'discount',  ascending: false })
  const { products: bestSellers,    loading: loadingBest }   = useSectionProducts('best_sellers', { orderCol: 'sold',       ascending: false })
  const { products: newArrivals,    loading: loadingNew }    = useSectionProducts('new_arrivals', { orderCol: 'created_at', ascending: false })
  const { products: todayDeals,     loading: loadingDeals }  = useSectionProducts('todays_deals', { orderCol: 'discount',  ascending: false })
  const { products: allProducts,    loading: loadingAll }    = useAllProducts()

  const filtered = allProducts.filter(p => {
    const matchCat    = activeCategory === 'All' || p.name.toLowerCase().includes(activeCategory.toLowerCase())
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isFiltering = activeCategory !== 'All' || search.trim() !== ''

  return (
    <div className={styles.page}>

      {/* ══ DESKTOP LAYOUT ══ */}
      <div className={styles.desktopLayout}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarList}>
            {dbCategories.map(cat => (
              <li key={cat.id}>
                <Link href={`/categories?cat=${cat.id}`} className={styles.sidebarLink}>
                  <span>{cat.icon || '🛍️'}</span>
                  {cat.name}
                  <svg className={styles.sidebarChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <div className={styles.heroArea}>
          <HeroBannerCarousel banners={desktopBanners} loading={loadingDesktop} />
        </div>
      </div>

      {/* ══ MOBILE HERO ══ */}
      <div className={styles.mobileHero}>
        <div className={styles.mobileBannerWrap}>
          <HeroBannerCarousel banners={mobileBanners} loading={loadingMobile} />
        </div>
        <div className={styles.mobileTrustRow}>
          {[
            { icon: '✓', label: 'Cash on Delivery' },
            { icon: '🚚', label: '1–3 Days' },
            { icon: '🔒', label: 'Verified' },
            { icon: '🆓', label: 'Free in Addis' },
          ].map((t, i) => (
            <div key={i} className={styles.mobileTrustItem}>
              <span className={styles.mobileTrustIcon}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.mobileCatRow}>
          {CAT_PILLS.map(cat => (
            <button key={cat.label}
              className={`${styles.catPill} ${activeCategory === cat.label ? styles.catPillActive : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
              <span>{cat.icon}</span>{cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <main className={styles.main}>

        {/* Desktop filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterCats}>
            {CAT_PILLS.map(cat => (
              <button key={cat.label}
                className={`${styles.catBtn} ${activeCategory === cat.label ? styles.catActive : ''}`}
                onClick={() => setActiveCategory(cat.label)}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {isFiltering ? (
          <section className={styles.section} id="all-products">
            <SectionHeader title={`${filtered.length} products${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`} seeAllHref="/categories" />
            {loadingAll ? (
              <div className={styles.productGrid}>{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}><p>No products found</p></div>
            ) : (
              <div className={styles.productGrid}>
                {filtered.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 0.03}s` }}><ProductCard product={p} /></div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section className={styles.section}>
              <SectionHeader label="Today's" title="Flash Sales" countdown={countdown} seeAllHref="/?cat=sale" />
              <ProductRow products={flashProducts} loading={loadingFlash} itemWidth={220} />
            </section>

            <section className={styles.section}>
              <SectionHeader label="Categories" title="Browse By Category" seeAllHref="/categories" />
              <CategoryGrid />
            </section>

            <section className={styles.section}>
              <SectionHeader label="This Month" title="Best Selling Products" seeAllHref="/?cat=bestsellers" />
              <ProductRow products={bestSellers} loading={loadingBest} itemWidth={220} />
            </section>

            {/* ── Promo Banner ── */}
            <PromoBanner />

            <section className={styles.section}>
              <SectionHeader label="Only Today" title="Today's Deals" seeAllHref="/?cat=deals" />
              <ProductRow products={todayDeals} loading={loadingDeals} itemWidth={220} />
            </section>

            <section className={styles.section}>
              <SectionHeader label="Fresh" title="New Arrivals" seeAllHref="/?cat=new" />
              <ProductRow products={newArrivals} loading={loadingNew} itemWidth={220} />
            </section>

            <TrustStrip />

            <section className={styles.section} id="all-products">
              <SectionHeader title="All Products" label={loadingAll ? '' : `${allProducts.length} items`} />
              {loadingAll ? (
                <div className={styles.productGrid}>{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : (
                <div className={styles.productGrid}>
                  {allProducts.map((p, i) => (
                    <div key={p.id} style={{ animationDelay: `${i * 0.02}s` }}><ProductCard product={p} /></div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* ══ MOBILE BOTTOM NAV ══ */}
      <MobileBottomNav />
    </div>
  )
}
