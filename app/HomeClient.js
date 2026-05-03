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

// Real banners table schema:
//   id          uuid primary key
//   image_url   text not null
//   target_url  text nullable  ← where clicking goes, e.g. /products/abc-123
//   title       text nullable
//   active      boolean        ← NOT is_active
//   sort_order  integer
//   created_at  timestamptz

const CATEGORIES = [
  { label: 'All',          icon: '🛍️' },
  { label: 'Kids',         icon: '👶' },
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
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(time.h)}:${pad(time.m)}:${pad(time.s)}`
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

// ── Section header ──
function SectionHeader({ icon, title, subtitle, countdown, seeAllHref }) {
  return (
    <div className={styles.sectionHeader}>
      <div className={styles.sectionHeaderLeft}>
        {icon && <span className={styles.sectionIcon}>{icon}</span>}
        <div>
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

// ── useBanners — uses real column names: active, target_url ──
function useBanners() {
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)

  useEffect(() => {
    async function fetchBanners() {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('id, image_url, target_url, title, sort_order')
          .eq('active', true)                      // ← correct column: active
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
  }, [])

  return { banners, loadingBanners }
}

// ── Banner dots indicator ──
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

// ── Desktop Hero ──
function DesktopHero({ banners, loadingBanners }) {
  const router = useRouter()
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setActiveIdx(i => (i + 1) % banners.length), 4500)
    return () => clearInterval(id)
  }, [banners.length])

  // Loading skeleton
  if (loadingBanners) {
    return (
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <div className={styles.heroBannerSkeleton} style={{ height: 18, width: 160, borderRadius: 100, marginBottom: 8 }} />
            <div className={styles.heroBannerSkeleton} style={{ height: 32, width: 320, borderRadius: 8, marginBottom: 10 }} />
            <div className={styles.heroBannerSkeleton} style={{ height: 14, width: 260, borderRadius: 6 }} />
          </div>
        </div>
      </section>
    )
  }

  // Static fallback when no banners
  if (banners.length === 0) {
    return (
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Ethiopia&apos;s Newest Online Marketplace
            </span>
            <h1 className={styles.heroTitle}>
              Shop Smart, <span>Pay on Delivery</span>
            </h1>
            <div className={styles.heroCod}>
              {['Cash on Delivery','1–3 Day Delivery','Free in Addis','200+ Sellers'].map(f => (
                <div key={f} className={styles.heroFeature}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatNum}>5,000+</span>
              <span className={styles.heroStatLabel}>Products</span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatNum}>200+</span>
              <span className={styles.heroStatLabel}>Sellers</span>
            </div>
            <div className={`${styles.heroStatCard} ${styles.heroStatAccent}`}>
              <span className={styles.heroCardLabel}>⚡ Flash Deal</span>
              <span className={styles.heroCardTitle}>Up to 64% Off</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const banner = banners[activeIdx]
  const handleClick = () => { if (banner.target_url) router.push(banner.target_url) }

  return (
    <section
      className={styles.hero}
      style={{ cursor: banner.target_url ? 'pointer' : 'default' }}
      onClick={handleClick}
    >
      {/* Full-bleed banner image — no overlay, no text on top */}
      <img
        key={activeIdx}
        src={banner.image_url}
        alt={banner.title || 'Promotion'}
        className={styles.heroBannerImg}
      />

      {/* Dots indicator at bottom-left */}
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

  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setActiveIdx(i => (i + 1) % banners.length), 4500)
    return () => clearInterval(id)
  }, [banners.length])

  const banner = banners[activeIdx]

  return (
    <section className={styles.mobileHero}>

      {/* Banner */}
      {loadingBanners ? (
        <div className={`${styles.mobileBanner} ${styles.mobileBannerLoading}`}>
          <div className={styles.mobileBannerLeft}>
            <div className={styles.mobileSkeleton} style={{ width: 80, height: 12 }} />
            <div className={styles.mobileSkeleton} style={{ width: 160, height: 26, marginTop: 4 }} />
            <div className={styles.mobileSkeleton} style={{ width: 100, height: 28, borderRadius: 100, marginTop: 8 }} />
          </div>
        </div>
      ) : banners.length === 0 ? (
        /* Static fallback */
        <div className={styles.mobileBanner}>
          <div className={styles.mobileBannerLeft}>
            <span className={styles.mobileBannerTag}>🔥 Launch Sale</span>
            <h2 className={styles.mobileBannerTitle}>Up to 64% Off</h2>
            <p className={styles.mobileBannerSub}>Cash on delivery · Free in Addis</p>
            <Link href="#all-products" className={styles.mobileBannerCta}>Shop Now</Link>
          </div>
          <div className={styles.mobileBannerRight}>
            <div className={styles.bannerOrb} />
            <div className={styles.bannerPercent}>64%<br/><span>OFF</span></div>
          </div>
        </div>
      ) : (
        /* Dynamic — image_url fills banner, target_url is destination */
        <div
          className={styles.mobileBanner}
          key={activeIdx}
          style={{ cursor: banner.target_url ? 'pointer' : 'default' }}
          onClick={() => banner.target_url && router.push(banner.target_url)}
        >
          {/* Full-bleed image */}
          <img
            src={banner.image_url}
            alt={banner.title || 'Promotion'}
            className={styles.mobileBannerBgImg}
          />
          {/* Overlay so text stays legible */}
          <div className={styles.mobileBannerOverlay} />

          <div className={styles.mobileBannerLeft}>
            {banner.title && (
              <h2 className={styles.mobileBannerTitle}>{banner.title}</h2>
            )}
            {banner.target_url && (
              <Link
                href={banner.target_url}
                className={styles.mobileBannerCta}
                onClick={e => e.stopPropagation()}
              >
                Shop Now
              </Link>
            )}
          </div>

          <BannerDots count={banners.length} active={activeIdx} onSelect={setActiveIdx} />
        </div>
      )}

      {/* Trust strip */}
      <div className={styles.trustStrip}>
        {[
          { icon: '✓', label: 'Cash on Delivery' },
          { icon: '🚚', label: '1–3 Days' },
          { icon: '🔒', label: 'Verified Sellers' },
          { icon: '🆓', label: 'Free in Addis' },
        ].map((t, i) => (
          <div key={i} className={styles.trustItem}>
            <span className={styles.trustIcon}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {/* Category pills */}
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
export default function HomeClient({ products }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const countdown = useCountdown(6)
  const { banners, loadingBanners } = useBanners()

  const flashProducts = products.filter(p => p.discount >= 20).slice(0, 10)
  const todayDeals    = products.filter(p => p.discount >= 10).slice(0, 10)
  const forYou        = [...products].sort(() => Math.random() - 0.5).slice(0, 10)
  const topRated      = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10)
  const newArrivals   = [...products].slice(0, 10)
  const bestSellers   = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 10)

  const filtered = products.filter(p => {
    const matchCat =
      activeCategory === 'All' ||
      (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase())
    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const isFiltering = activeCategory !== 'All' || search.trim() !== ''

  return (
    <>
      <DesktopHero banners={banners} loadingBanners={loadingBanners} />
      <MobileHero
        banners={banners}
        loadingBanners={loadingBanners}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      <main className={styles.main}>

        {/* Desktop filter bar */}
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
          <section className={styles.section} id="all-products">
            <SectionHeader
              title={`${filtered.length} products${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}`}
              seeAllHref="/categories"
            />
            {filtered.length === 0 ? (
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
          <>
            {flashProducts.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="⚡" title="Flash Sale" subtitle="Limited time deals" countdown={countdown} seeAllHref="/?cat=sale" />
                <ProductRow products={flashProducts} />
              </section>
            )}
            {todayDeals.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="🎯" title="Today's Deals" subtitle="Hand-picked savings" seeAllHref="/?cat=deals" />
                <ProductRow products={todayDeals} />
              </section>
            )}
            {forYou.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="✨" title="For You" subtitle="Recommended picks" seeAllHref="/?cat=foryou" />
                <ProductRow products={forYou} />
              </section>
            )}
            {bestSellers.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="🏆" title="Best Sellers" subtitle="Most ordered products" seeAllHref="/?cat=bestsellers" />
                <ProductRow products={bestSellers} />
              </section>
            )}
            {topRated.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="⭐" title="Top Rated" subtitle="Highest customer ratings" seeAllHref="/?cat=toprated" />
                <ProductRow products={topRated} />
              </section>
            )}
            {newArrivals.length > 0 && (
              <section className={styles.section}>
                <SectionHeader icon="🆕" title="New Arrivals" subtitle="Just added to the store" seeAllHref="/?cat=new" />
                <ProductRow products={newArrivals} />
              </section>
            )}
            <section className={styles.section} id="all-products">
              <SectionHeader title="All Products" subtitle={`${products.length} items`} />
              <div className={styles.productGrid}>
                {products.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 0.02}s` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}
