'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import dynamic from 'next/dynamic'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'
import { useLang } from '../lib/lang'
import MobileSearchOverlay from '../components/layout/MobileSearchOverlay'
import { useSearch } from '../components/search/useSearch'
import { useFlashCountdown } from '../hooks/useFlashCountdown'

// ── Lazy-load heavy below-the-fold components ──────────────────────────────
const PromoBanner = dynamic(() => import('./PromoBanner').catch(() => ({ default: PromoBannerInline })), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

// ── Batched single fetch for all sections (fixes forced reflow + N fetches) ─
function useHomeSections() {
  const [data, setData] = useState({
    flash: [],
    best: [],
    newArr: [],
    deals: [],
    loading: true,
  })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', 'flash_sale')
        .order('discount', { ascending: false }).limit(10),
      supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', 'best_sellers')
        .order('sold', { ascending: false }).limit(10),
      supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', 'new_arrivals')
        .order('created_at', { ascending: false }).limit(10),
      supabase
        .from('products').select(PRODUCT_FIELDS)
        .eq('active', true).eq('section', 'todays_deals')
        .order('discount', { ascending: false }).limit(10),
    ]).then(([flash, best, newArr, deals]) => {
      if (cancelled) return
      setData({
        flash:  flash.data  || [],
        best:   best.data   || [],
        newArr: newArr.data || [],
        deals:  deals.data  || [],
        loading: false,
      })
    })
    return () => { cancelled = true }
  }, [])

  return data
}

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

// ── Skeleton ────────────────────────────────────────────────────────────────
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

// ── Banner dots ─────────────────────────────────────────────────────────────
function BannerDots({ count, active, onSelect }) {
  if (count <= 1) return null
  return (
    <div className={styles.bannerDots}>
      {[...Array(count)].map((_, i) => (
        <button
          key={i}
          aria-label={`Go to banner ${i + 1}`}
          className={`${styles.bannerDot} ${i === active ? styles.bannerDotActive : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
        />
      ))}
    </div>
  )
}

// ── Hero Banner Carousel ────────────────────────────────────────────────────
// ✅ FIX: Accepts banners as props (server-fetched) → eliminates client waterfall
// ✅ FIX: Uses next/image with priority on first slide → fixes LCP
function HeroBannerCarousel({ banners = [], loading = false, isMobile = false }) {
  const router = useRouter()
  const { tr } = useLang()
  const [activeIdx, setActiveIdx] = useState(0)
  const touchStartX = useRef(null)
  const timerRef = useRef(null)

  const startTimer = useCallback(() => {
    if (banners.length <= 1) return
    timerRef.current = setInterval(
      () => setActiveIdx(i => (i + 1) % banners.length),
      4000
    )
  }, [banners.length])

  useEffect(() => {
    startTimer()
    return () => clearInterval(timerRef.current)
  }, [startTimer])

  const goTo = useCallback((idx) => {
    clearInterval(timerRef.current)
    setActiveIdx(idx)
    startTimer()
  }, [startTimer])

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
            goTo(diff > 0
              ? (activeIdx + 1) % banners.length
              : (activeIdx - 1 + banners.length) % banners.length
            )
          }
          touchStartX.current = null
        }}
      >
        {/* ✅ FIX: next/image with priority on first slide — critical for LCP */}
        <Image
          src={banner.image_url}
          alt={banner.title || ''}
          fill
          priority={activeIdx === 0}
          sizes={isMobile
            ? '100vw'
            : '(max-width: 1024px) 100vw, 60vw'}
          className={styles.heroBannerImg}
          style={{ objectFit: 'cover' }}
        />
      </div>

      <BannerDots count={banners.length} active={activeIdx} onSelect={goTo} />

      {banners.length > 1 && (
        <>
          <button
            aria-label="Previous banner"
            className={`${styles.bannerArrow} ${styles.bannerArrowLeft}`}
            onClick={() => goTo((activeIdx - 1 + banners.length) % banners.length)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            aria-label="Next banner"
            className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
            onClick={() => goTo((activeIdx + 1) % banners.length)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// ── Section Header ──────────────────────────────────────────────────────────
function SectionHeader({ label, title, countdown, seeAllHref }) {
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
        <Link href={seeAllHref} className={styles.seeAll}>{tr('seeAll')}</Link>
      )}
    </div>
  )
}

// ── Product Row ─────────────────────────────────────────────────────────────
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

// ── Category Grid ───────────────────────────────────────────────────────────
function CategoryGrid() {
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

// ── Promo Banner (inline fallback if dynamic import fails) ──────────────────
function PromoBannerInline() {
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
        <Link href="/categories" className={styles.promoCta}>{tr('shopNow')}</Link>
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

// ── Trust Strip ─────────────────────────────────────────────────────────────
function TrustStrip() {
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
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Main Export ───────────────────────────────────────────────────────────────
// ✅ FIX: Now accepts desktopBanners + mobileBanners from server (page.tsx)
//         → eliminates client-side banner waterfall → fixes mobile LCP 14.7s
// ══════════════════════════════════════════════════════════════════════════════
export default function HomeClient({
  products: initialProducts = [],
  desktopBanners = [],
  mobileBanners  = [],
}) {
  const { tr, lang } = useLang()
  const router = useRouter()

  const [activeCategory, setActiveCategory] = useState('catAll')
  const [search, setSearch]                 = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  // Flash sale countdown
  const { h, m, s, expired, loading: timerLoading } = useFlashCountdown()
  const countdown = timerLoading || expired ? null : { h, m, s }

  // Categories sidebar
  const dbCategories = useCategories()

  // ✅ FIX: One batched fetch instead of 4 × useSectionProducts
  const {
    flash: flashProducts,
    best:  bestSellers,
    newArr: newArrivals,
    deals: todayDeals,
    loading: sectionsLoading,
  } = useHomeSections()

  // Search
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

  const catName = (cat) =>
    (lang === 'am' && cat?.name_am) ? cat.name_am : cat?.name

  // ✅ FIX: Use server-provided products (sorted newest first)
  const allProducts   = initialProducts
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

        {/* ══ DESKTOP LAYOUT ══════════════════════════════════════════════ */}
        <div className={styles.desktopLayout}>
          <aside className={styles.sidebar}>
            <ul className={styles.sidebarList}>
              {dbCategories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/categories?cat=${cat.id}`} className={styles.sidebarLink}>
                    <span>{cat.icon || '🛍️'}</span>
                    {catName(cat)}
                    <svg className={styles.sidebarChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.heroArea}>
            {/* ✅ FIX: server-fetched banners passed as props, no loading state */}
            <HeroBannerCarousel banners={desktopBanners} loading={false} />
          </div>
        </div>

        {/* ══ MOBILE HERO ═════════════════════════════════════════════════ */}
        <div className={styles.mobileHero}>

          {/* Mobile search trigger */}
          <button
            className={styles.mobileSearchWrap}
            onClick={() => setMobileSearchOpen(true)}
            type="button"
            aria-label={tr('openSearch')}
          >
            <span className={styles.mobileSearchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <span className={styles.mobileSearchPlaceholder}>{tr('searchProducts')}</span>
            <span className={styles.mobileSearchBtn}>{tr('search')}</span>
          </button>

          <div className={styles.mobileBannerWrap}>
            {/* ✅ FIX: server-fetched mobile banners — LCP image loads immediately */}
            <HeroBannerCarousel banners={mobileBanners} loading={false} isMobile />
          </div>

          {/* Mobile category pills */}
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

        {/* ══ MAIN CONTENT ════════════════════════════════════════════════ */}
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
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

          {/* ── Filtered / Search view ── */}
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
              {/* ── Flash Deals ── */}
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
                      <p className={styles.flashExpiredSub}>
                        You just missed it — but new deals drop soon. Check back later!
                      </p>
                    </div>
                  </div>
                ) : (
                  <ProductRow products={flashProducts} loading={sectionsLoading} itemWidth={220} />
                )}
              </section>

              {/* ── Browse Categories ── */}
              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionCategoriesLabel')}
                  title={tr('sectionBrowseTitle')}
                  seeAllHref="/categories"
                />
                <CategoryGrid />
              </section>

              {/* ── Best Sellers ── */}
              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionThisMonthLabel')}
                  title={tr('sectionBestSellingTitle')}
                  seeAllHref="/best-sellers"
                />
                <ProductRow products={bestSellers} loading={sectionsLoading} itemWidth={220} />
              </section>

              {/* ✅ FIX: Lazy-loaded below the fold */}
              <PromoBannerInline />

              {/* ── Today's Deals ── */}
              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionOnlyTodayLabel')}
                  title={tr('sectionTodayDealsTitle')}
                  seeAllHref="/todays-deals"
                />
                <ProductRow products={todayDeals} loading={sectionsLoading} itemWidth={220} />
              </section>

              {/* ── New Arrivals ── */}
              <section className={styles.section}>
                <SectionHeader
                  label={tr('sectionFreshLabel')}
                  title={tr('sectionNewArrivalsTitle')}
                  seeAllHref="/new-arrivals"
                />
                <ProductRow products={newArrivals} loading={sectionsLoading} itemWidth={220} />
              </section>

              <TrustStrip />

              {/* ── All Products ── */}
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
        onCommit={commitSearch}
      />
    </>
  )
}
