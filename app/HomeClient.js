'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

// ── Supabase client ──
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

const CATEGORIES = [
  { label: 'All',           icon: '🛍️' },
  { label: 'Kids',          icon: '👶' },
  { label: 'Electronics',   icon: '📱' },
  { label: 'Home & Living', icon: '🛋️' },
  { label: 'Beauty',        icon: '💄' },
  { label: 'Fashion',       icon: '👗' },
  { label: 'Watches',       icon: '⌚' },
  { label: 'Sports',        icon: '⚽' },
]

// Category icons for the visual category strip (desktop + mobile)
const CATEGORY_ICONS = [
  { label: 'Phones',     icon: '📱', query: 'Electronics' },
  { label: 'Computers',  icon: '💻', query: 'Electronics' },
  { label: 'Watch',      icon: '⌚', query: 'Watches' },
  { label: 'Camera',     icon: '📷', query: 'Electronics' },
  { label: 'Audio',      icon: '🎧', query: 'Electronics' },
  { label: 'Gaming',     icon: '🎮', query: 'Electronics' },
  { label: 'Fashion',    icon: '👗', query: 'Fashion' },
  { label: 'Home',       icon: '🛋️', query: 'Home & Living' },
]

const TRUST_ITEMS = [
  { icon: '✓',   label: 'Cash on\nDelivery' },
  { icon: '🚚',  label: '1–3 Day\nDelivery' },
  { icon: '🔒',  label: 'Verified\nSellers' },
  { icon: '🆓',  label: 'Free in\nAddis' },
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
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`
}

// Promo countdown — 23h 59m 35s
function usePromoCountdown() {
  const [time, setTime] = useState({ h: 23, m: 59, s: 35 })
  useEffect(() => {
    const end = Date.now() + (23 * 3600 + 59 * 60 + 35) * 1000
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
  const pad = (n) => String(n).padStart(2, '0')
  return { h: pad(time.h), m: pad(time.m), s: pad(time.s), days: '05' }
}

// ── Per-section product hook ──
function useSectionProducts(sectionValue, { orderCol = 'created_at', ascending = false, limit = 10 } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .eq('section', sectionValue)
        .order(orderCol, { ascending })
        .limit(limit)
      if (error) console.error(`Section [${sectionValue}] fetch error:`, error)
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [sectionValue])

  return { products, loading }
}

// ── All-products hook ──
function useAllProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .order('created_at', { ascending: false })
      if (error) console.error('All-products fetch error:', error)
      setProducts(data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { products, loading }
}

// ── Banners hook ──
function useBanners(device) {
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('id, image_url, target_url, title, sort_order')
          .eq('active', true)
          .eq('device', device)
          .order('sort_order', { ascending: true })
        if (error) throw error
        setBanners(data || [])
      } catch (err) {
        console.error('Failed to fetch banners:', err)
        setBanners([])
      } finally {
        setLoadingBanners(false)
      }
    }
    fetchBanners()
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
        <button
          key={i}
          className={`${styles.bannerDot} ${i === active ? styles.bannerDotActive : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
          aria-label={`Banner ${i + 1}`}
        />
      ))}
    </div>
  )
}

// ── Section header ──
function SectionHeader({ icon, label, title, subtitle, countdown, seeAllHref }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeaderLeft}>
        {icon && <span className={styles.sectionIcon}>{icon}</span>}
        <div>
          {label && <p className={styles.sectionLabel}>{label}</p>}
          <h2 className={styles.sectionTitle}>{title}</h2>
          {subtitle && <p className={styles.sectionSubtitle}>{subtitle}</p>}
        </div>
        {countdown && (
          <div className={styles.timerPill}>
            {countdown.split(':').map((seg, i) => (
              <span key={i} className={styles.timerGroup}>
                <span className={styles.timerNum}>{seg}</span>
                {i < 2 && <span className={styles.timerColon}>:</span>}
              </span>
            ))}
          </div>
        )}
      </div>
      {seeAllHref && (
        <Link href={seeAllHref} className={styles.seeAll}>See all →</Link>
      )}
    </div>
  )
}

// ── Horizontal scroll product row ──
function ProductRow({ products, loading }) {
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
        <div key={p.id} className={styles.hScrollItem}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  )
}

// ── Promo Banner ──
function PromoBanner() {
  const promo = usePromoCountdown()
  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBannerLeft}>
        <p className={styles.promoBannerLabel}>Limited Offer</p>
        <h3 className={styles.promoBannerTitle}>Enhance Your<br />Music Experience</h3>
        <div className={styles.promoTimerRow}>
          <div className={styles.promoTimeBox}>
            <span className={styles.promoNum}>{promo.h}</span>
            <span className={styles.promoUnit}>hrs</span>
          </div>
          <div className={styles.promoTimeBox}>
            <span className={styles.promoNum}>{promo.days}</span>
            <span className={styles.promoUnit}>days</span>
          </div>
          <div className={styles.promoTimeBox}>
            <span className={styles.promoNum}>{promo.m}</span>
            <span className={styles.promoUnit}>mins</span>
          </div>
          <div className={styles.promoTimeBox}>
            <span className={styles.promoNum}>{promo.s}</span>
            <span className={styles.promoUnit}>secs</span>
          </div>
        </div>
        <button className={styles.promoBannerBtn}>Buy Now!</button>
      </div>
      <div className={styles.promoBannerIcon}>🎧</div>
    </div>
  )
}

// ── Features strip ──
function FeaturesStrip() {
  const features = [
    { icon: '🚚', title: 'Free in Addis',    sub: 'Delivery in Addis Ababa' },
    { icon: '💵', title: 'Cash on Delivery', sub: 'Pay when you receive' },
    { icon: '🎧', title: '24/7 Support',     sub: 'Friendly service always' },
    { icon: '🛡️', title: 'Money Back',       sub: '30-day return guarantee' },
  ]
  return (
    <div className={styles.featuresStrip}>
      {features.map((f, i) => (
        <div key={i} className={styles.featureItem}>
          <span className={styles.featureIcon}>{f.icon}</span>
          <div>
            <p className={styles.featureTitle}>{f.title}</p>
            <p className={styles.featureSub}>{f.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Category Icons Strip ──
function CategoryStrip({ onSelect }) {
  const [active, setActive] = useState(null)
  const handle = (cat) => {
    const next = active === cat.label ? null : cat.label
    setActive(next)
    onSelect(next ? cat.query : 'All')
  }
  return (
    <div className={styles.categoryStrip}>
      {CATEGORY_ICONS.map(cat => (
        <button
          key={cat.label}
          className={`${styles.catIconItem} ${active === cat.label ? styles.catIconActive : ''}`}
          onClick={() => handle(cat)}
        >
          <span className={styles.catIconBox}>{cat.icon}</span>
          <span className={styles.catIconLabel}>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}

// ── Home Footer ──
function HomeFooter() {
  return (
    <footer className={styles.homeFooter}>
      <div className={styles.homeFooterInner}>
        <div className={styles.footerCol}>
          <p className={styles.footerLogo}>Addora</p>
          <p className={styles.footerSub}>Subscribe &amp; get 10% off your first order</p>
          <div className={styles.footerEmailRow}>
            <input type="email" placeholder="Enter your email" className={styles.footerEmailInput} />
            <button className={styles.footerEmailBtn}>→</button>
          </div>
          <div className={styles.footerSocials}>
            {['📘', '🐦', '📸', '💼'].map((icon, i) => (
              <span key={i} className={styles.footerSocialIcon}>{icon}</span>
            ))}
          </div>
        </div>
        <div className={styles.footerCol}>
          <h5 className={styles.footerColTitle}>Support</h5>
          {['FAQ', 'Contact Us', 'Returns', 'Shipping Info'].map(l => (
            <Link key={l} href="#" className={styles.footerLink}>{l}</Link>
          ))}
        </div>
        <div className={styles.footerCol}>
          <h5 className={styles.footerColTitle}>Account</h5>
          {['My Account', 'My Orders', 'Wishlist', 'Cart'].map(l => (
            <Link key={l} href="#" className={styles.footerLink}>{l}</Link>
          ))}
        </div>
        <div className={styles.footerCol}>
          <h5 className={styles.footerColTitle}>Company</h5>
          {['About Us', 'Privacy Policy', 'Terms of Use', 'Careers'].map(l => (
            <Link key={l} href="#" className={styles.footerLink}>{l}</Link>
          ))}
        </div>
      </div>
      <div className={styles.footerCopy}>
        © {new Date().getFullYear()} Addora. All rights reserved. Made with ❤️ in Addis Ababa.
      </div>
    </footer>
  )
}

// ── Desktop Hero ──
function DesktopHero({ banners, loadingBanners }) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setActiveIdx(i => (i + 1) % banners.length), 4500)
    return () => clearInterval(id)
  }, [banners.length])

  if (loadingBanners || banners.length === 0) return null

  const banner = banners[activeIdx]
  const handleClick = () => { if (banner.target_url) router.push(banner.target_url) }
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setActiveIdx(i => diff > 0
        ? (i + 1) % banners.length
        : (i - 1 + banners.length) % banners.length)
    }
    touchStartX.current = null
  }

  return (
    <section
      className={styles.hero}
      style={{ cursor: banner.target_url ? 'pointer' : 'default' }}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={activeIdx}
        src={banner.image_url}
        alt={banner.title || 'Promotion'}
        className={styles.heroBannerImg}
      />
      <div className={styles.heroInner}>
        <BannerDots count={banners.length} active={activeIdx} onSelect={setActiveIdx} />
      </div>
    </section>
  )
}

// ── Mobile Hero ──
function MobileHero({ banners, loadingBanners, activeCategory, setActiveCategory }) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)
  const touchStartX = useRef(null)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setActiveIdx(i => (i + 1) % banners.length), 4500)
    return () => clearInterval(id)
  }, [banners.length])

  const banner = banners[activeIdx]
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      setActiveIdx(i => diff > 0
        ? (i + 1) % banners.length
        : (i - 1 + banners.length) % banners.length)
    }
    touchStartX.current = null
  }

  return (
    <section className={styles.mobileHero}>
      {!loadingBanners && banners.length > 0 && (
        <>
          <div
            className={styles.mobileBanner}
            key={activeIdx}
            style={{ cursor: banner.target_url ? 'pointer' : 'default' }}
            onClick={() => banner.target_url && router.push(banner.target_url)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={banner.image_url}
              alt={banner.title || 'Promotion'}
              className={styles.mobileBannerBgImg}
            />
          </div>
          <BannerDots count={banners.length} active={activeIdx} onSelect={setActiveIdx} />
        </>
      )}

      <div className={styles.trustStrip}>
        {TRUST_ITEMS.map((t, i) => (
          <div key={i} className={styles.trustItem}>
            <span className={styles.trustIcon}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.catRow}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            className={`${styles.catPill} ${activeCategory === cat.label ? styles.catPillActive : ''}`}
            onClick={() => setActiveCategory(cat.label)}
          >
            <span>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </section>
  )
}

// ── Main export ──
export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const countdown = useCountdown(6)

  const { banners: desktopBanners, loadingBanners: loadingDesktop } = useBanners('desktop')
  const { banners: mobileBanners,  loadingBanners: loadingMobile  } = useBanners('mobile')

  const { products: flashProducts,  loading: loadingFlash       } = useSectionProducts('flash_sale',   { orderCol: 'discount',   ascending: false })
  const { products: todayDeals,     loading: loadingDeals        } = useSectionProducts('todays_deals', { orderCol: 'discount',   ascending: false })
  const { products: forYou,         loading: loadingForYou       } = useSectionProducts('for_you',      { orderCol: 'created_at', ascending: false })
  const { products: bestSellers,    loading: loadingBestSellers  } = useSectionProducts('best_sellers', { orderCol: 'sold',       ascending: false })
  const { products: topRated,       loading: loadingTopRated     } = useSectionProducts('top_rated',    { orderCol: 'rating',     ascending: false })
  const { products: newArrivals,    loading: loadingNewArrivals  } = useSectionProducts('new_arrivals', { orderCol: 'created_at', ascending: false })

  const { products: allProducts, loading: loadingAll } = useAllProducts()

  const filtered = allProducts.filter(p => {
    const matchCat =
      activeCategory === 'All' ||
      (p.category_id && p.category_id === activeCategory) ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase())
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isFiltering = activeCategory !== 'All' || search.trim() !== ''

  return (
    <>
      <DesktopHero banners={desktopBanners} loadingBanners={loadingDesktop} />
      <MobileHero
        banners={mobileBanners}
        loadingBanners={loadingMobile}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <main className={styles.main}>

        {/* ── Desktop filter bar ── */}
        <div className={styles.filterBar}>
          <div className={styles.filterCats}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                className={`${styles.catBtn} ${activeCategory === cat.label ? styles.catActive : ''}`}
                onClick={() => setActiveCategory(cat.label)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {isFiltering ? (
          /* ── Filtered / search view ── */
          <section className={styles.section} id="all-products">
            <SectionHeader
              title={`${filtered.length} product${filtered.length !== 1 ? 's' : ''}${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`}
              seeAllHref="/categories"
            />
            {loadingAll ? (
              <div className={styles.productGrid}>
                {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}><p>No products found</p></div>
            ) : (
              <div className={styles.productGrid}>
                {filtered.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 0.03}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          /* ── Default home view ── */
          <>
            {/* Flash Sale */}
            <section className={styles.section}>
              <SectionHeader
                label="Today's"
                title="Flash Sales"
                countdown={countdown}
                seeAllHref="/?cat=sale"
              />
              <ProductRow products={flashProducts} loading={loadingFlash} />
            </section>

            {/* Category icons strip */}
            <section className={`${styles.section} ${styles.categorySection}`}>
              <SectionHeader label="Discover" title="Browse By Category" seeAllHref="/categories" />
              <CategoryStrip onSelect={setActiveCategory} />
            </section>

            {/* Today's Deals */}
            <section className={styles.section}>
              <SectionHeader label="This Week" title="Today's Deals" subtitle="Hand-picked savings" seeAllHref="/?cat=deals" />
              <ProductRow products={todayDeals} loading={loadingDeals} />
            </section>

            {/* For You */}
            <section className={styles.section}>
              <SectionHeader label="Recommended" title="For You" subtitle="Curated picks" seeAllHref="/?cat=foryou" />
              <ProductRow products={forYou} loading={loadingForYou} />
            </section>

            {/* Promo Banner */}
            <PromoBanner />

            {/* Best Sellers */}
            <section className={styles.section}>
              <SectionHeader label="This Month" title="Best Sellers" subtitle="Most ordered products" seeAllHref="/?cat=bestsellers" />
              <ProductRow products={bestSellers} loading={loadingBestSellers} />
            </section>

            {/* Top Rated */}
            <section className={styles.section}>
              <SectionHeader label="Customer Picks" title="Top Rated" subtitle="Highest customer ratings" seeAllHref="/?cat=toprated" />
              <ProductRow products={topRated} loading={loadingTopRated} />
            </section>

            {/* New Arrivals */}
            <section className={styles.section}>
              <SectionHeader label="Just In" title="New Arrivals" subtitle="Fresh to the store" seeAllHref="/?cat=new" />
              <ProductRow products={newArrivals} loading={loadingNewArrivals} />
            </section>

            {/* Features strip */}
            <FeaturesStrip />

            {/* All Products */}
            <section className={styles.section} id="all-products">
              <SectionHeader
                title="All Products"
                subtitle={loadingAll ? '…' : `${allProducts.length} items`}
              />
              {loadingAll ? (
                <div className={styles.productGrid}>
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className={styles.productGrid}>
                  {allProducts.map((p, i) => (
                    <div key={p.id} style={{ animationDelay: `${i * 0.02}s` }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <HomeFooter />
    </>
  )
}
