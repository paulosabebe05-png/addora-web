'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'
import { useLang } from '../lib/lang'
import MobileSearchOverlay from '../components/search/MobileSearchOverlay'
import { useSearch } from '../components/search/useSearch'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

// ── Categories hook — fetches from DB (parent categories only) ──
function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, name_am, icon')   // ← name_am added
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setCategories(data || []))
  }, [])
  return categories
}

// CAT_PILLS now uses translation keys instead of hardcoded English labels
const CAT_PILL_KEYS = [
  { key: 'catAll',         icon: '🛍️' },
  { key: 'catKids',        icon: '🧸' },
  { key: 'catElectronics', icon: '📱' },
  { key: 'catHomeLiving',  icon: '🛋️' },
  { key: 'catBeauty',      icon: '💄' },
  { key: 'catFashion',     icon: '👗' },
  { key: 'catWatches',     icon: '⌚' },
  { key: 'catSports',      icon: '⚽' },
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
function HeroBannerCarousel({ banners, loading, isMobile = false }) {
  const router = useRouter()
  const { tr } = useLang()   // ← ADDED
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
      <div
        className={styles.heroBannerFallback}
        style={isMobile ? { borderRadius: 18, overflow: 'hidden' } : {}}
      >
        <div className={styles.heroBannerFallbackContent}>
          <span className={styles.heroBannerTag}>{tr('limitedTime')}</span>
          <h2 className={styles.heroBannerTitle}>{tr('heroBannerTitle').split('\n').map((l, i) => <span key={i}>{l}{i === 0 && <br />}</span>)}</h2>
          <p className={styles.heroBannerSub}>{tr('heroBannerSub')}</p>
          <Link href="/?cat=sale" className={styles.heroBannerCta}>{tr('shopNow')}</Link>
        </div>
        <div className={styles.heroBannerFallbackOrb} />
      </div>
    )
  }

  const banner = banners[activeIdx]
  return (
    <div
      className={styles.heroBannerWrap}
      style={isMobile ? { borderRadius: 18, overflow: 'hidden' } : {}}
    >
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
  const { tr } = useLang()   // ← ADDED
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
            <span className={styles.timerLabel}>{tr('endsIn') || 'Ends in'}</span>
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
        <Link href={seeAllHref} className={styles.seeAll}>{tr('seeAll')}</Link>
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
  const { tr } = useLang()   // ← ADDED
  const icons = [
    { labelKey: 'catElectronics', icon: '📱', slug: 'electronics' },
    { labelKey: 'catComputers',   icon: '💻', slug: 'computers' },
    { labelKey: 'catWatches',     icon: '⌚', slug: 'watches' },
    { labelKey: 'catCamera',      icon: '📷', slug: 'camera' },
    { labelKey: 'catHeadphones',  icon: '🎧', slug: 'headphones' },
    { labelKey: 'catGaming',      icon: '🎮', slug: 'gaming' },
    { labelKey: 'catFashion',     icon: '👗', slug: 'fashion' },
    { labelKey: 'catBeauty',      icon: '💄', slug: 'beauty' },
    { labelKey: 'catHomeLiving',  icon: '🛋️', slug: 'home' },
    { labelKey: 'catSports',      icon: '⚽', slug: 'sports' },
    { labelKey: 'catKids',        icon: '🧸', slug: 'kids' },
    { labelKey: 'catHealth',      icon: '💊', slug: 'medicine' },
  ]
  return (
    <div className={styles.catGrid}>
      {icons.map((c, i) => (
        <Link key={c.slug} href={`/?cat=${c.slug}`} className={styles.catGridItem}>
          <div className={`${styles.catGridIcon} ${i === 3 ? styles.catGridIconActive : ''}`}>
            <span className={styles.catGridEmoji}>{c.icon}</span>
          </div>
          <span className={styles.catGridLabel}>{tr(c.labelKey)}</span>
        </Link>
      ))}
    </div>
  )
}

// ── Promo Banner ──
function PromoBanner() {
  const { tr } = useLang()   // ← ADDED
  const STATS = [
    { n: '200+', lKey: 'statProducts' },
    { n: '1–3',  lKey: 'statDayDelivery' },
    { n: '100%', lKey: 'trustCODTitle' },
    { n: '4.9★', lKey: 'rating' },
  ]
  const FEATURES = [
    { icon: '🚀', textKey: 'aboutBullet1' },
    { icon: '💳', textKey: 'aboutBullet2' },
    { icon: '✅', textKey: 'aboutBullet3' },
    { icon: '🔄', textKey: 'aboutBullet4' },
  ]
  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBannerLeft}>
        <span className={styles.promoLabel}>{tr('whyAddora')}</span>
        <h3 className={styles.promoTitle}>
          {tr('aboutHeadline')}
        </h3>
        <div className={styles.promoFeatures}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.promoFeatureItem}>
              <span className={styles.promoFeatureIcon}>{f.icon}</span>
              <span className={styles.promoFeatureText}>{tr(f.textKey)}</span>
            </div>
          ))}
        </div>
        <div className={styles.promoStats}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.promoStat}>
              <span className={styles.promoStatNum}>{s.n}</span>
              <span className={styles.promoStatLabel}>{tr(s.lKey)}</span>
            </div>
          ))}
        </div>
        <Link href="/categories" className={styles.promoCta}>
          {tr('shopNow')}
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
  const { tr } = useLang()   // ← ADDED
  const items = [
    { icon: '🚚', titleKey: 'trustFreeDeliveryTitle', subKey: 'trustFreeDeliverySub' },
    { icon: '📞', titleKey: 'trustSupportTitle',      subKey: 'trustSupportSub' },
    { icon: '🔒', titleKey: 'trustMoneyBackTitle',    subKey: 'trustMoneyBackSub' },
  ]
  return (
    <div className={styles.trustStrip}>
      {items.map((t, i) => (
        <div key={i} className={styles.trustItem}>
          <div className={styles.trustIconWrap}>
            <span style={{ fontSize: 28 }}>{t.icon}</span>
          </div>
          <div>
            <p className={styles.trustTitle}>{tr(t.titleKey)}</p>
            <p className={styles.trustSub}>{tr(t.subKey)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main export ──
export default function HomeClient() {
  const { tr, lang } = useLang()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('catAll')
  const [search, setSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const countdown = useCountdown(6)
  const dbCategories = useCategories()

  const {
    query, setQuery,
    results, loading: searchLoading,
    recent, saveRecent,
    clearRecent, removeRecent,
  } = useSearch()

  const [activeIndex, setActiveIndex] = useState(-1)

  const commitSearch = useCallback((term) => {
    const t = (term || query).trim()
    if (!t) return
    saveRecent(t)
    router.push(`/search?q=${encodeURIComponent(t)}`)
    setMobileSearchOpen(false)
    setActiveIndex(-1)
  }, [query, saveRecent, router])

  // Returns Amharic name when lang === 'am' and name_am exists, else English name
  const catName = (cat) =>
    (lang === 'am' && cat?.name_am) ? cat.name_am : cat?.name

  const { banners: desktopBanners, loadingBanners: loadingDesktop } = useBanners('desktop')
  const { banners: mobileBanners,  loadingBanners: loadingMobile  } = useBanners('mobile')

  const { products: flashProducts,  loading: loadingFlash }  = useSectionProducts('flash_sale',   { orderCol: 'discount',  ascending: false })
  const { products: bestSellers,    loading: loadingBest }   = useSectionProducts('best_sellers', { orderCol: 'sold',       ascending: false })
  const { products: newArrivals,    loading: loadingNew }    = useSectionProducts('new_arrivals', { orderCol: 'created_at', ascending: false })
  const { products: todayDeals,     loading: loadingDeals }  = useSectionProducts('todays_deals', { orderCol: 'discount',  ascending: false })
  const { products: allProducts,    loading: loadingAll }    = useAllProducts()

  // Map pill key → English label for filtering (product names are stored in English)
  const KEY_TO_EN = {
    catAll: 'All', catKids: 'Kids', catElectronics: 'Electronics',
    catHomeLiving: 'Home & Living', catBeauty: 'Beauty',
    catFashion: 'Fashion', catWatches: 'Watches', catSports: 'Sports',
  }
  const activeLabelEn = KEY_TO_EN[activeCategory] || 'All'

  const filtered = allProducts.filter(p => {
    const matchCat    = activeLabelEn === 'All' || p.name.toLowerCase().includes(activeLabelEn.toLowerCase())
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isFiltering = activeCategory !== 'catAll' || search.trim() !== ''

  return (
    <>
    <div className={styles.page}>

      {/* ══ DESKTOP LAYOUT ══ */}
      <div className={styles.desktopLayout}>
        <aside className={styles.sidebar}>
          <ul className={styles.sidebarList}>
            {dbCategories.map(cat => (
              <li key={cat.id}>
                <Link href={`/categories?cat=${cat.id}`} className={styles.sidebarLink}>
                  <span>{cat.icon || '🛍️'}</span>
                  {catName(cat)}
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

        {/* Mobile search bar — branded pill, opens full overlay */}
        <button
          className={styles.mobileSearchWrap}
          onClick={() => setMobileSearchOpen(true)}
          type="button"
          aria-label={tr('openSearch')}
        >
          <span className={styles.mobileSearchIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <span className={styles.mobileSearchPlaceholder}>{tr('searchProducts')}</span>
          <span className={styles.mobileSearchBtn}>{tr('search')}</span>
        </button>

        <div
          className={styles.mobileBannerWrap}
          style={{ margin: '0 14px 10px', borderRadius: 18, overflow: 'hidden', boxShadow: '0 6px 20px rgba(0,0,0,0.10)' }}
        >
          <HeroBannerCarousel banners={mobileBanners} loading={loadingMobile} isMobile={true} />
        </div>

        {/* Mobile category pills — translated */}
        <div className={styles.mobileCatRow}>
          {CAT_PILL_KEYS.map(cat => (
            <button key={cat.key}
              className={`${styles.catPill} ${activeCategory === cat.key ? styles.catPillActive : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span>{cat.icon}</span>{tr(cat.key)}
            </button>
          ))}
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <main className={styles.main}>

        {/* Desktop filter bar — translated */}
        <div className={styles.filterBar}>
          <div className={styles.filterCats}>
            {CAT_PILL_KEYS.map(cat => (
              <button key={cat.key}
                className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
                onClick={() => setActiveCategory(cat.key)}>
                {cat.icon} {tr(cat.key)}
              </button>
            ))}
          </div>
          <div className={styles.searchWrap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder={tr('searchProducts')}
              value={search} onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {isFiltering ? (
          <section className={styles.section} id="all-products">
            <SectionHeader
              title={`${filtered.length} ${tr('items')}${activeCategory !== 'catAll' ? ` in ${tr(activeCategory)}` : ''}`}
              seeAllHref="/categories"
            />
            {loadingAll ? (
              <div className={styles.productGrid}>{[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}</div>
            ) : filtered.length === 0 ? (
              <div className={styles.empty}><p>{tr('noProductsFound')}</p></div>
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
              <SectionHeader label={tr('sectionTodayLabel')} title={tr('sectionFlashTitle')} countdown={countdown} seeAllHref="/?cat=sale" />
              <ProductRow products={flashProducts} loading={loadingFlash} itemWidth={220} />
            </section>

            <section className={styles.section}>
              <SectionHeader label={tr('sectionCategoriesLabel')} title={tr('sectionBrowseTitle')} seeAllHref="/categories" />
              <CategoryGrid />
            </section>

            <section className={styles.section}>
              <SectionHeader label={tr('sectionThisMonthLabel')} title={tr('sectionBestSellingTitle')} seeAllHref="/?cat=bestsellers" />
              <ProductRow products={bestSellers} loading={loadingBest} itemWidth={220} />
            </section>

            <PromoBanner />

            <section className={styles.section}>
              <SectionHeader label={tr('sectionOnlyTodayLabel')} title={tr('sectionTodayDealsTitle')} seeAllHref="/?cat=deals" />
              <ProductRow products={todayDeals} loading={loadingDeals} itemWidth={220} />
            </section>

            <section className={styles.section}>
              <SectionHeader label={tr('sectionFreshLabel')} title={tr('sectionNewArrivalsTitle')} seeAllHref="/?cat=new" />
              <ProductRow products={newArrivals} loading={loadingNew} itemWidth={220} />
            </section>

            <TrustStrip />

            <section className={styles.section} id="all-products">
              <SectionHeader title={tr('sectionAllProductsTitle')} label={loadingAll ? '' : `${allProducts.length} ${tr('items')}`} />
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

      <MobileSearchOverlay
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        query={query}
        setQuery={setQuery}
        results={results}
        loading={searchLoading}
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
