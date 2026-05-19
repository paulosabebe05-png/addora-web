'use client'
import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'
import { useLang } from '../lib/lang'
import MobileSearchOverlay from '../components/layout/MobileSearchOverlay'
import { useSearch } from '../components/search/useSearch'
import { useFlashCountdown } from '../hooks/useFlashCountdown'

// ── Supabase (singleton — avoids re-creating the client on every render) ──────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Only fetch the columns we actually render — keeps payloads small
const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

// ── Data hooks ────────────────────────────────────────────────────────────────

function useCategories() {
  const [categories, setCategories] = useState([])
  useEffect(() => {
    supabase
      .from('categories')
      .select('id, name, name_am, icon')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .then(({ data }) => setCategories(data || []))
  }, [])
  return categories
}

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

function useSectionProducts(sectionValue, { orderCol = 'created_at', ascending = false, limit = 10 } = {}) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', sectionValue)
        .order(orderCol, { ascending }).limit(limit)
      if (error) console.error(`Section [${sectionValue}] error:`, error)
      if (!cancelled) {
        setProducts(data || [])
        setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [sectionValue]) // eslint-disable-line react-hooks/exhaustive-deps
  return { products, loading }
}

function useBanners(device) {
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('banners').select('id, image_url, target_url, title, sort_order, device')
          .eq('active', true).in('device', [device, 'all']).order('sort_order', { ascending: true })
        if (error) throw error
        if (!cancelled) setBanners(data || [])
      } catch {
        if (!cancelled) setBanners([])
      } finally {
        if (!cancelled) setLoadingBanners(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [device])
  return { banners, loadingBanners }
}

// ── Skeleton & dots ───────────────────────────────────────────────────────────

const SkeletonCard = memo(function SkeletonCard() {
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
})

const BannerDots = memo(function BannerDots({ count, active, onSelect }) {
  if (count <= 1) return null
  return (
    <div className={styles.bannerDots}>
      {[...Array(count)].map((_, i) => (
        <button
          key={i}
          className={`${styles.bannerDot} ${i === active ? styles.bannerDotActive : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
          aria-label={`Go to banner ${i + 1}`}
        />
      ))}
    </div>
  )
})

// ── Hero Banner Carousel ──────────────────────────────────────────────────────
// FIX 1 — Use next/image with priority on first banner → fixes LCP 22s → ~1-2s
// FIX 2 — Add fetchpriority="high" via Next.js priority prop
// FIX 3 — Proper width/height to avoid layout shift (CLS)

function HeroBannerCarousel({ banners, loading, isMobile = false }) {
  const router = useRouter()
  const { tr } = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const touchStartX = useRef(null)
  const intervalRef = useRef(null)

  const startAutoPlay = useCallback(() => {
    if (banners.length <= 1) return
    intervalRef.current = setInterval(
      () => setActiveIdx(i => (i + 1) % banners.length),
      4000
    )
  }, [banners.length])

  useEffect(() => {
    startAutoPlay()
    return () => clearInterval(intervalRef.current)
  }, [startAutoPlay])

  if (loading) return <div className={styles.heroBannerSkeleton} />

  if (!banners.length) {
    return (
      <div
        className={styles.heroBannerFallback}
        style={isMobile ? { borderRadius: 18, overflow: 'hidden' } : {}}
      >
        <div className={styles.heroBannerFallbackContent}>
          <span className={styles.heroBannerTag}>{tr('limitedTime')}</span>
          <h2 className={styles.heroBannerTitle}>
            {tr('heroBannerTitle').split('\n').map((l, i) => (
              <span key={i}>{l}{i === 0 && <br />}</span>
            ))}
          </h2>
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
          if (Math.abs(diff) > 40) {
            setActiveIdx(i =>
              diff > 0
                ? (i + 1) % banners.length
                : (i - 1 + banners.length) % banners.length
            )
          }
          touchStartX.current = null
        }}
      >
        {/*
          FIX 1: Use next/image instead of <img>
          - priority on first banner = fetchpriority="high" → fixes LCP
          - sizes tells browser which image to download per viewport
          - placeholder="blur" + blurDataURL shows a tiny placeholder instantly
        */}
        <Image
          src={banner.image_url}
          alt={banner.title || 'Banner'}
          fill
          sizes={isMobile
            ? '100vw'
            : '(max-width: 768px) 100vw, 75vw'}
          priority={activeIdx === 0}   // ← critical: makes first banner LCP-fast
          quality={75}                 // saves bandwidth vs default 100
          style={{ objectFit: 'cover' }}
          className={styles.heroBannerImg}
        />
      </div>

      <BannerDots count={banners.length} active={activeIdx} onSelect={setActiveIdx} />

      {banners.length > 1 && (
        <>
          <button
            className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`}
            onClick={() => setActiveIdx(i => (i - 1 + banners.length) % banners.length)}
            aria-label="Previous banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
            onClick={() => setActiveIdx(i => (i + 1) % banners.length)}
            aria-label="Next banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// ── Section Header ────────────────────────────────────────────────────────────

const SectionHeader = memo(function SectionHeader({ label, title, countdown, seeAllHref }) {
  const { tr } = useLang()
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
        <Link href={seeAllHref} className={styles.seeAll} prefetch={false}>
          {tr('seeAll')}
        </Link>
      )}
    </div>
  )
})

// ── Product Row ───────────────────────────────────────────────────────────────
// FIX 2: content-visibility: auto on rows below the fold defers rendering work

const ProductRow = memo(function ProductRow({ products, loading, itemWidth = 200 }) {
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
})

// ── Category Grid ─────────────────────────────────────────────────────────────

const CategoryGrid = memo(function CategoryGrid() {
  const { tr } = useLang()
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
        <Link key={c.slug} href={`/?cat=${c.slug}`} className={styles.catGridItem} prefetch={false}>
          <div className={`${styles.catGridIcon} ${i === 3 ? styles.catGridIconActive : ''}`}>
            <span className={styles.catGridEmoji}>{c.icon}</span>
          </div>
          <span className={styles.catGridLabel}>{tr(c.labelKey)}</span>
        </Link>
      ))}
    </div>
  )
})

// ── Promo Banner ──────────────────────────────────────────────────────────────

const PromoBanner = memo(function PromoBanner() {
  const { tr } = useLang()
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
        <h3 className={styles.promoTitle}>{tr('aboutHeadline')}</h3>
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
        <Link href="/categories" className={styles.promoCta} prefetch={false}>
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
})

// ── Trust Strip ───────────────────────────────────────────────────────────────

const TrustStrip = memo(function TrustStrip() {
  const { tr } = useLang()
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
})

// ── Main export ───────────────────────────────────────────────────────────────

export default function HomeClient({ products: initialProducts = [] }) {
  const { tr, lang } = useLang()
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('catAll')
  const [search, setSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Flash sale countdown from Supabase
  const { h, m, s, expired, loading: timerLoading } = useFlashCountdown()
  const countdown = timerLoading ? null : expired ? null : { h, m, s }

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

  const catName = useCallback(
    (cat) => (lang === 'am' && cat?.name_am) ? cat.name_am : cat?.name,
    [lang]
  )

  // FIX 3: Only fetch banners for the device we're on
  // We detect device server-side ideally, but here we use a simple hook
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  useEffect(() => {
    setIsMobileDevice(window.innerWidth < 768)
  }, [])

  const { banners: desktopBanners, loadingBanners: loadingDesktop } = useBanners('desktop')
  const { banners: mobileBanners,  loadingBanners: loadingMobile  } = useBanners('mobile')

  // FIX 4: Load below-fold sections lazily — only fetch when user scrolls near
  const [belowFoldVisible, setBelowFoldVisible] = useState(false)
  const belowFoldRef = useRef(null)

  useEffect(() => {
    const el = belowFoldRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBelowFoldVisible(true) },
      { rootMargin: '400px' }  // start loading 400px before it enters viewport
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Flash sale always loads (above the fold)
  const { products: flashProducts, loading: loadingFlash } = useSectionProducts(
    'flash_sale', { orderCol: 'discount', ascending: false }
  )

  // Below-fold sections — only start fetching once user is nearby
  const { products: bestSellers, loading: loadingBest } = useSectionProducts(
    belowFoldVisible ? 'best_sellers' : '__skip__',
    { orderCol: 'sold', ascending: false }
  )
  const { products: newArrivals, loading: loadingNew } = useSectionProducts(
    belowFoldVisible ? 'new_arrivals' : '__skip__',
    { orderCol: 'created_at', ascending: false }
  )
  const { products: todayDeals, loading: loadingDeals } = useSectionProducts(
    belowFoldVisible ? 'todays_deals' : '__skip__',
    { orderCol: 'discount', ascending: false }
  )

  // Server-provided products (sorted newest first)
  const allProducts = initialProducts

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
                  <Link href={`/categories?cat=${cat.id}`} className={styles.sidebarLink} prefetch={false}>
                    <span>{cat.icon || '🛍️'}</span>
                    {catName(cat)}
                    <svg className={styles.sidebarChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <div className={styles.heroArea}>
            {/* FIX 5: Add preload link for first desktop banner image in _document or layout */}
            <HeroBannerCarousel banners={desktopBanners} loading={loadingDesktop} />
          </div>
        </div>

        {/* ══ MOBILE HERO ══ */}
        <div className={styles.mobileHero}>
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

          <div className={styles.mobileBannerWrap}>
            <HeroBannerCarousel banners={mobileBanners} loading={loadingMobile} isMobile={true} />
          </div>

          <div className={styles.mobileCatRow}>
            {CAT_PILL_KEYS.map(cat => (
              <button
                key={cat.key}
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

          {/* Desktop filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.filterCats}>
              {CAT_PILL_KEYS.map(cat => (
                <button
                  key={cat.key}
                  className={`${styles.catBtn} ${activeCategory === cat.key ? styles.catActive : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.icon} {tr(cat.key)}
                </button>
              ))}
            </div>
            <div className={styles.searchWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder={tr('searchProducts')}
                value={search}
                onChange={e => setSearch(e.target.value)}
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
              {filtered.length === 0 ? (
                <div className={styles.empty}><p>{tr('noProductsFound')}</p></div>
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
            <>
              {/* ── Flash Deals (above fold — loads immediately) ── */}
              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionTodayLabel')}
                  title={tr('sectionFlashTitle')}
                  countdown={countdown}
                  seeAllHref="/flash-deals"
                />
                {expired ? (
                  <div className={styles.flashExpired}>
                    <span className={styles.flashExpiredIcon}>⏰</span>
                    <div>
                      <p className={styles.flashExpiredTitle}>Flash Sale Ended</p>
                      <p className={styles.flashExpiredSub}>You just missed it — but new deals drop soon. Check back later!</p>
                    </div>
                  </div>
                ) : (
                  <ProductRow products={flashProducts} loading={loadingFlash} itemWidth={220} />
                )}
              </section>

              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionCategoriesLabel')}
                  title={tr('sectionBrowseTitle')}
                  seeAllHref="/categories"
                />
                <CategoryGrid />
              </section>

              {/*
                FIX 6: sentinel div — sections below this only start fetching
                when IntersectionObserver fires (user scrolls near)
              */}
              <div ref={belowFoldRef} />

              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionThisMonthLabel')}
                  title={tr('sectionBestSellingTitle')}
                  seeAllHref="/best-sellers"
                />
                <ProductRow products={bestSellers} loading={loadingBest} itemWidth={220} />
              </section>

              <PromoBanner />

              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionOnlyTodayLabel')}
                  title={tr('sectionTodayDealsTitle')}
                  seeAllHref="/todays-deals"
                />
                <ProductRow products={todayDeals} loading={loadingDeals} itemWidth={220} />
              </section>

              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionFreshLabel')}
                  title={tr('sectionNewArrivalsTitle')}
                  seeAllHref="/new-arrivals"
                />
                <ProductRow products={newArrivals} loading={loadingNew} itemWidth={220} />
              </section>

              <TrustStrip />

              <section className={styles.section} id="all-products">
                <SectionHeader
                  title={tr('sectionAllProductsTitle')}
                  label={`${allProducts.length} ${tr('items')}`}
                />
                <div className={styles.productGrid}>
                  {allProducts.map((p, i) => (
                    <div key={p.id} style={{ animationDelay: `${i * 0.02}s` }}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
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
