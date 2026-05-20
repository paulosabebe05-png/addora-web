'use client'

import { useState, useEffect, useRef, useCallback, memo } from 'react'
import Link            from 'next/link'
import Image           from 'next/image'
import { useRouter }   from 'next/navigation'
import { supabase }    from '../lib/supabase'
import ProductCard     from '../components/ui/ProductCard'
import styles          from './HomeClient.module.css'
import { useLang }     from '../lib/lang'
import MobileSearchOverlay from '../components/layout/MobileSearchOverlay'
import { useSearch }   from '../components/search/useSearch'
import { useFlashCountdown } from '../hooks/useFlashCountdown'

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

const PAGE_SIZE = 12

// ─────────────────────────────────────────────────────────────────────────────
// Data hooks — banners REMOVED (now server-fetched, passed as props)
// ─────────────────────────────────────────────────────────────────────────────

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

function useSectionProducts(
  sectionValue,
  { orderCol = 'created_at', ascending = false, limit = 10 } = {}
) {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (sectionValue === '__skip__') { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', sectionValue)
      .order(orderCol, { ascending })
      .limit(limit)
      .then(({ data, error }) => {
        if (error) console.error(`Section [${sectionValue}] error:`, error)
        if (!cancelled) { setProducts(data || []); setLoading(false) }
      })
    return () => { cancelled = true }
  }, [sectionValue]) // eslint-disable-line react-hooks/exhaustive-deps

  return { products, loading }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton & Dots — unchanged
// ─────────────────────────────────────────────────────────────────────────────

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
          onClick={e => { e.preventDefault(); e.stopPropagation(); onSelect(i) }}
          aria-label={`Go to banner ${i + 1}`}
        />
      ))}
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// Hero Banner Carousel
// Now accepts `banners` as prop — no internal fetch, no loading state needed
// for initial render since data comes from server
// ─────────────────────────────────────────────────────────────────────────────

function HeroBannerCarousel({
  banners        = [],
  isMobile       = false,
  heroPreloadUrl = null,
}) {
  const router      = useRouter()
  const { tr }      = useLang()
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

  // No loading skeleton needed — banners come from server, available immediately
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
        <Image
          src={banner.image_url}
          alt={banner.title || 'Banner'}
          fill
          sizes={isMobile ? '100vw' : '(max-width: 768px) 100vw, 75vw'}
          priority={activeIdx === 0}
          quality={75}
          style={{ objectFit: 'cover' }}
          className={styles.heroBannerImg}
          fetchPriority={activeIdx === 0 ? 'high' : 'low'}
          decoding={activeIdx === 0 ? 'sync' : 'async'}
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <button
            className={`${styles.bannerArrow} ${styles.bannerArrowRight}`}
            onClick={() => setActiveIdx(i => (i + 1) % banners.length)}
            aria-label="Next banner"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeader, ProductRow, CategoryGrid, PromoBanner, TrustStrip
// unchanged from your original — paste your existing implementations here
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader = memo(function SectionHeader({ label, title, countdown, seeAllHref }) {
  const { tr } = useLang()
  const pad = n => String(n).padStart(2, '0')
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

const ProductRow = memo(function ProductRow({ products, loading, itemWidth = 200, aboveFold = false }) {
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
      {products.map((p, i) => (
        <div key={p.id} className={styles.hScrollItem} style={{ width: itemWidth }}>
          <ProductCard product={p} priority={aboveFold && i < 4} />
        </div>
      ))}
    </div>
  )
})

const CategoryGrid = memo(function CategoryGrid() {
  const { tr } = useLang()
  const icons = [
    { labelKey: 'catElectronics', icon: '📱', slug: 'electronics' },
    { labelKey: 'catComputers',   icon: '💻', slug: 'computers'   },
    { labelKey: 'catWatches',     icon: '⌚', slug: 'watches'     },
    { labelKey: 'catCamera',      icon: '📷', slug: 'camera'      },
    { labelKey: 'catHeadphones',  icon: '🎧', slug: 'headphones'  },
    { labelKey: 'catGaming',      icon: '🎮', slug: 'gaming'      },
    { labelKey: 'catFashion',     icon: '👗', slug: 'fashion'     },
    { labelKey: 'catBeauty',      icon: '💄', slug: 'beauty'      },
    { labelKey: 'catHomeLiving',  icon: '🛋️', slug: 'home'       },
    { labelKey: 'catSports',      icon: '⚽', slug: 'sports'      },
    { labelKey: 'catKids',        icon: '🧸', slug: 'kids'        },
    { labelKey: 'catHealth',      icon: '💊', slug: 'medicine'    },
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

const PromoBanner = memo(function PromoBanner() {
  const { tr } = useLang()
  const STATS = [
    { n: '200+', lKey: 'statProducts'    },
    { n: '1–3',  lKey: 'statDayDelivery' },
    { n: '100%', lKey: 'trustCODTitle'   },
    { n: '4.9★', lKey: 'rating'          },
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

const TrustStrip = memo(function TrustStrip() {
  const { tr } = useLang()
  const items = [
    { icon: '🚚', titleKey: 'trustFreeDeliveryTitle', subKey: 'trustFreeDeliverySub' },
    { icon: '📞', titleKey: 'trustSupportTitle',      subKey: 'trustSupportSub'      },
    { icon: '🔒', titleKey: 'trustMoneyBackTitle',    subKey: 'trustMoneyBackSub'    },
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

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export default function HomeClient({
  products:              initialProducts        = [],
  initialDevice                                 = 'desktop',
  heroPreloadUrl                                = null,
  // NEW: banners now come from server — no client fetch needed
  initialDesktopBanners                         = [],
  initialMobileBanners                          = [],
}) {
  const { tr, lang } = useLang()
  const router = useRouter()
  const [activeCategory,   setActiveCategory]   = useState('catAll')
  const [search,           setSearch]           = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [visibleCount,     setVisibleCount]     = useState(PAGE_SIZE)

  const { h, m, s, expired, loading: timerLoading } = useFlashCountdown()
  const countdown = timerLoading || expired ? null : { h, m, s }

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
    cat => (lang === 'am' && cat?.name_am) ? cat.name_am : cat?.name,
    [lang]
  )

  // ── Below-fold lazy loading ───────────────────────────────────────────────
  const [belowFoldVisible, setBelowFoldVisible] = useState(false)
  const belowFoldRef = useRef(null)

  useEffect(() => {
    const el = belowFoldRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setBelowFoldVisible(true) },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { products: flashProducts, loading: loadingFlash } =
    useSectionProducts('flash_sale', { orderCol: 'discount', ascending: false })

  const { products: bestSellers,  loading: loadingBest  } =
    useSectionProducts(belowFoldVisible ? 'best_sellers' : '__skip__', { orderCol: 'sold', ascending: false })
  const { products: newArrivals,  loading: loadingNew   } =
    useSectionProducts(belowFoldVisible ? 'new_arrivals' : '__skip__', { orderCol: 'created_at', ascending: false })
  const { products: todayDeals,   loading: loadingDeals } =
    useSectionProducts(belowFoldVisible ? 'todays_deals' : '__skip__', { orderCol: 'discount', ascending: false })

  const KEY_TO_EN = {
    catAll: 'All', catKids: 'Kids', catElectronics: 'Electronics',
    catHomeLiving: 'Home & Living', catBeauty: 'Beauty',
    catFashion: 'Fashion', catWatches: 'Watches', catSports: 'Sports',
  }
  const activeLabelEn = KEY_TO_EN[activeCategory] || 'All'

  const filtered = initialProducts.filter(p => {
    const matchCat    = activeLabelEn === 'All' ||
      p.name.toLowerCase().includes(activeLabelEn.toLowerCase())
    const matchSearch = !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isFiltering      = activeCategory !== 'catAll' || search.trim() !== ''
  const visibleProducts  = initialProducts.slice(0, visibleCount)

  return (
    <>
      <div className={styles.page}>

        {/* ══ DESKTOP LAYOUT ══════════════════════════════════════════════ */}
        <div className={styles.desktopLayout}>
          <aside className={styles.sidebar}>
            <ul className={styles.sidebarList}>
              {dbCategories.map(cat => (
                <li key={cat.id}>
                  <Link href={`/categories?cat=${cat.id}`} className={styles.sidebarLink} prefetch={false}>
                    <span>{cat.icon || '🛍️'}</span>
                    {catName(cat)}
                    <svg className={styles.sidebarChevron} width="12" height="12"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles.heroArea}>
            {/*
              Key fix: initialDesktopBanners comes from server — no skeleton,
              no useEffect, banner image is in HTML immediately → LCP drops
            */}
            <HeroBannerCarousel
              banners={initialDesktopBanners}
              heroPreloadUrl={heroPreloadUrl}
            />
          </div>
        </div>

        {/* ══ MOBILE HERO ═════════════════════════════════════════════════ */}
        <div className={styles.mobileHero}>
          <button
            className={styles.mobileSearchWrap}
            onClick={() => setMobileSearchOpen(true)}
            type="button"
            aria-label={tr('openSearch')}
          >
            <span className={styles.mobileSearchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <span className={styles.mobileSearchPlaceholder}>{tr('searchProducts')}</span>
            <span className={styles.mobileSearchBtn}>{tr('search')}</span>
          </button>

          <div className={styles.mobileBannerWrap}>
            <HeroBannerCarousel
              banners={initialMobileBanners}
              isMobile={true}
              heroPreloadUrl={heroPreloadUrl}
            />
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

        {/* ══ MAIN CONTENT ════════════════════════════════════════════════ */}
        <main className={styles.main}>
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
                title={`${filtered.length} ${tr('items')}${
                  activeCategory !== 'catAll' ? ` in ${tr(activeCategory)}` : ''
                }`}
                seeAllHref="/categories"
              />
              {filtered.length === 0 ? (
                <div className={styles.empty}><p>{tr('noProductsFound')}</p></div>
              ) : (
                <div className={styles.productGrid}>
                  {filtered.map((p, i) => (
                    <div key={p.id} style={i < 6 ? { animationDelay: `${i * 0.03}s` } : undefined}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <>
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
                  <ProductRow
                    products={flashProducts}
                    loading={loadingFlash}
                    itemWidth={220}
                    aboveFold={true}
                  />
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
                  label={`${initialProducts.length} ${tr('items')}`}
                />
                <div className={styles.productGrid}>
                  {visibleProducts.map((p, i) => (
                    <div key={p.id} style={i < 6 ? { animationDelay: `${i * 0.02}s` } : undefined}>
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
                {visibleCount < initialProducts.length && (
                  <div className={styles.loadMoreWrap}>
                    <button
                      className={styles.loadMoreBtn}
                      onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                    >
                      {tr('loadMore') || 'Load More'}
                      <span className={styles.loadMoreCount}>
                        ({initialProducts.length - visibleCount} {tr('remaining') || 'remaining'})
                      </span>
                    </button>
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
        onCommit={commitSearch}
      />
    </>
  )
}
