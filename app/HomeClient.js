'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

// ── Guard: if env vars are missing, log clearly so it's obvious ──
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error(
    '[HomeClient] ❌ Missing Supabase env vars!\n' +
    '  NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL, '\n' +
    '  NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ set' : '❌ missing'
  )
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

// ── Categories hook ──
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
  { label: 'All',          icon: '🛍️' },
  { label: 'Kids',         icon: '🧸' },
  { label: 'Electronics',  icon: '📱' },
  { label: 'Home & Living',icon: '🛋️' },
  { label: 'Beauty',       icon: '💄' },
  { label: 'Fashion',      icon: '👗' },
  { label: 'Watches',      icon: '⌚' },
  { label: 'Sports',       icon: '⚽' },
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

// ── Flash Sale hook ──
// Step 1: section = 'flash_sale'
// Step 2: fallback → discount > 0, sorted by highest discount
function useFlashSaleProducts(limit = 10) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      // 1️⃣ Section-based fetch
      const { data: sectionData, error: sectionErr } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .eq('section', 'flash_sale')
        .order('discount', { ascending: false })
        .limit(limit)

      if (process.env.NODE_ENV === 'development') {
        console.log('🔥 flash_sale fetch:', { count: sectionData?.length ?? 0, error: sectionErr?.message ?? null })
      }

      if (!sectionErr && sectionData && sectionData.length > 0) {
        setProducts(sectionData)
        setLoading(false)
        return
      }

      // 2️⃣ Fallback: any product with discount > 0
      const { data: fallback, error: fallbackErr } = await supabase
        .from('products')
        .select(PRODUCT_FIELDS)
        .eq('active', true)
        .gt('discount', 0)
        .order('discount', { ascending: false })
        .limit(limit)

      if (process.env.NODE_ENV === 'development') {
        console.log('🔥 flash_sale fallback:', { count: fallback?.length ?? 0, error: fallbackErr?.message ?? null })
      }

      if (fallbackErr) console.error('Flash sale fallback error:', fallbackErr)
      setProducts(fallback || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  return { products, loading }
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

// ── Banners hook ──
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
      } catch {
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
function HeroBannerCarousel({ banners, loading, isMobile = false }) {
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
      <div className={styles.heroBannerFallback} style={isMobile ? { borderRadius: 18, overflow: 'hidden' } : {}}>
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
    <div className={styles.heroBannerWrap} style={isMobile ? { borderRadius: 18, overflow: 'hidden' } : {}}>
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

// ── Promo Banner ──
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
        <h3 className={styles.promoTitle}>Ethiopia's Most<br />Trusted Marketplace</h3>
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
        <Link href="/categories" className={styles.promoCta}>Start Shopping →</Link>
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

// ── Main export ──
export default function HomeClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const countdown    = useCountdown(6)
  const dbCategories = useCategories()

  const { banners: desktopBanners, loadingBanners: loadingDesktop } = useBanners('desktop')
  const { banners: mobileBanners,  loadingBanners: loadingMobile  } = useBanners('mobile')

  // ✅ Flash sale: section='flash_sale' first, fallback to discount > 0
  const { products: flashProducts, loading: loadingFlash }  = useFlashSaleProducts(10)
  const { products: bestSellers,   loading: loadingBest  }  = useSectionProducts('best_sellers', { orderCol: 'sold',       ascending: false })
  const { products: newArrivals,   loading: loadingNew   }  = useSectionProducts('new_arrivals', { orderCol: 'created_at', ascending: false })
  const { products: todayDeals,    loading: loadingDeals }  = useSectionProducts('todays_deals', { orderCol: 'discount',   ascending: false })
  const { products: allProducts,   loading: loadingAll   }  = useAllProducts()

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
        <div
          className={styles.mobileBannerWrap}
          style={{ margin: '0 14px 10px', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
        >
          <HeroBannerCarousel banners={mobileBanners} loading={loadingMobile} isMobile={true} />
        </div>
        <div className={styles.mobileTrustRow}>
          {[
            { icon: '✓',  label: 'Cash on Delivery' },
            { icon: '🚚', label: '1–3 Days' },
            { icon: '🔒', label: 'Verified' },
            { icon: '🆓', label: 'Free in Addis' },
          ].map((t, i) => (
            <div key={i} className={styles.mobileTrustItem}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <div className={styles.mobileCatRow}>
          {CAT_PILLS.map(cat => (
            <button key={cat.label}
              className={`${styles.catPill} ${activeCategory === cat.label ? styles.catPillActive : ''}`}
              onClick={() => setActiveCategory(cat.label)}>
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
            <SectionHeader
              title={`${filtered.length} products${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`}
              seeAllHref="/categories"
            />
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
    </div>
  )
}
