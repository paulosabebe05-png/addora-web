'use client'
import { useState } from 'react'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

const CATEGORIES = ['All', 'Kids', 'Electronics', 'Home & Living', 'Beauty', 'Fashion', 'Watches', 'Sports']

// ─────────────────────────────────────────────
// AD CONFIG — swap these out per campaign
// ─────────────────────────────────────────────

/** ① Hero right column — replaces the stats cards on desktop */
const HERO_AD = {
  label: 'Sponsored',
  brand: 'Safaricom Ethiopia',
  headline: 'Telebirr Super App',
  sub: 'Send money, pay bills & shop — all in one place',
  cta: 'Download Now',
  href: 'https://telebirr.et',
  accent: '#00A651',   // Safaricom green
  logo: '📱',
}

/** ② Flash sale strip — last slot in the strip */
const FLASH_AD = {
  label: 'Ad',
  name: 'Telebirr — Pay Instantly',
  badge: '🔥',
  href: 'https://telebirr.et',
}

/** ③ Sponsored product card — injected at grid position (AD_GRID_POSITION) */
const GRID_AD = {
  label: 'Sponsored',
  brand: 'Samsung Ethiopia',
  name: 'Galaxy A15 — 4G',
  price: 'ETB 12,900',
  image: null,          // set to an image URL to show a product image
  href: '/products/sponsored-galaxy-a15',
  badge: 'New',
}
const AD_GRID_POSITION = 3   // 0-indexed; 3 = 4th slot (end of first row)

/** ④ Mid-grid leaderboard — shown every N organic products */
const MID_GRID_AD = {
  label: 'Ad',
  headline: 'Grow your business with Addora Ads',
  sub: 'Reach thousands of shoppers across Ethiopia',
  cta: 'Advertise with us',
  href: '/advertise',
}
const MID_GRID_INTERVAL = 8  // inject banner after every 8 products

/** ⑤ Pre-footer strip */
const PREFOOTER_AD = {
  label: 'Ad',
  headline: 'Open an account with Awash Bank in minutes',
  sub: 'No paperwork. Fully digital. Start saving today.',
  cta: 'Open Account',
  href: 'https://awashbank.com',
  logo: '🏦',
}

// ─────────────────────────────────────────────
// Helper — build grid items interleaved with ads
// ─────────────────────────────────────────────
function buildGridItems(filtered) {
  const items = []
  let organicCount = 0

  filtered.forEach((p, i) => {
    // ③ Sponsored card — at configured position
    if (i === AD_GRID_POSITION) {
      items.push({ type: 'sponsored-card', key: 'ad-grid' })
    }

    items.push({ type: 'product', product: p, key: p.id, delay: i })
    organicCount++

    // ④ Mid-grid leaderboard — every MID_GRID_INTERVAL products
    if (organicCount > 0 && organicCount % MID_GRID_INTERVAL === 0) {
      items.push({ type: 'mid-banner', key: `mid-banner-${organicCount}` })
    }
  })

  return items
}

// ─────────────────────────────────────────────
// Ad components
// ─────────────────────────────────────────────

function AdLabel({ text = 'Ad' }) {
  return (
    <span className={styles.adLabel}>{text}</span>
  )
}

/** ① Hero sponsored card — renders in the heroVisual slot on desktop */
function HeroAdCard() {
  return (
    <div className={styles.heroAdCard} style={{ '--ad-accent': HERO_AD.accent }}>
      <AdLabel text={HERO_AD.label} />
      <div className={styles.heroAdLogo}>{HERO_AD.logo}</div>
      <div className={styles.heroAdBrand}>{HERO_AD.brand}</div>
      <div className={styles.heroAdHeadline}>{HERO_AD.headline}</div>
      <div className={styles.heroAdSub}>{HERO_AD.sub}</div>
      <a href={HERO_AD.href} target="_blank" rel="noopener noreferrer" className={styles.heroAdCta}>
        {HERO_AD.cta}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </div>
  )
}

/** ② Flash strip ad slot */
function FlashAdItem() {
  return (
    <a href={FLASH_AD.href} target="_blank" rel="noopener noreferrer" className={`${styles.flashItem} ${styles.flashAdItem}`}>
      <span className={styles.flashBadge}>{FLASH_AD.badge}</span>
      <span className={styles.flashName}>{FLASH_AD.name}</span>
      <AdLabel text={FLASH_AD.label} />
    </a>
  )
}

/** ③ Sponsored product card — native ad in the grid */
function SponsoredProductCard() {
  return (
    <div className={styles.sponsoredCard}>
      <AdLabel text={GRID_AD.label} />
      {GRID_AD.image ? (
        <img src={GRID_AD.image} alt={GRID_AD.name} className={styles.sponsoredImg} />
      ) : (
        <div className={styles.sponsoredImgPlaceholder}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      )}
      <div className={styles.sponsoredBody}>
        <div className={styles.sponsoredBrand}>{GRID_AD.brand}</div>
        <div className={styles.sponsoredName}>{GRID_AD.name}</div>
        <div className={styles.sponsoredFooter}>
          <span className={styles.sponsoredPrice}>{GRID_AD.price}</span>
          {GRID_AD.badge && <span className={styles.sponsoredBadge}>{GRID_AD.badge}</span>}
        </div>
        <a href={GRID_AD.href} className={styles.sponsoredBtn}>Shop now</a>
      </div>
    </div>
  )
}

/** ④ Mid-grid leaderboard banner */
function MidGridBanner() {
  return (
    <div className={styles.midGridBanner}>
      <AdLabel text={MID_GRID_AD.label} />
      <div className={styles.midGridContent}>
        <div>
          <div className={styles.midGridHeadline}>{MID_GRID_AD.headline}</div>
          <div className={styles.midGridSub}>{MID_GRID_AD.sub}</div>
        </div>
        <a href={MID_GRID_AD.href} className={styles.midGridCta}>{MID_GRID_AD.cta}</a>
      </div>
    </div>
  )
}

/** ⑤ Pre-footer strip */
function PreFooterAd() {
  return (
    <div className={styles.preFooterAd}>
      <AdLabel text={PREFOOTER_AD.label} />
      <span className={styles.preFooterLogo}>{PREFOOTER_AD.logo}</span>
      <div className={styles.preFooterText}>
        <span className={styles.preFooterHeadline}>{PREFOOTER_AD.headline}</span>
        <span className={styles.preFooterSub}>{PREFOOTER_AD.sub}</span>
      </div>
      <a href={PREFOOTER_AD.href} target="_blank" rel="noopener noreferrer" className={styles.preFooterCta}>
        {PREFOOTER_AD.cta}
      </a>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function HomeClient({ products }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

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

  const gridItems = buildGridItems(filtered)

  return (
    <>
      {/* ── DESKTOP Hero ── */}
      <section className={styles.hero}>
        <div className={styles.sectionInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Ethiopia&apos;s Newest Online Marketplace
            </span>
            <h1 className={styles.heroTitle}>
              Shop Smart,{' '}
              <span>Pay on Delivery</span>
            </h1>
            <p className={styles.heroSub}>
              Thousands of products from trusted sellers — cash on delivery, 1–3 day shipping across Ethiopia.
            </p>
            <div className={styles.heroCod}>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Cash on Delivery
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                1–3 Day Delivery
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Quality Guaranteed
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Free Delivery in Addis
              </div>
            </div>
          </div>

          {/* ① Right: Hero Ad (desktop) — replaces stats cards */}
          <div className={styles.heroVisual}>
            <div className={styles.heroOrb} />
            {/* Toggle: show HeroAdCard OR organic stats */}
            {HERO_AD ? (
              <HeroAdCard />
            ) : (
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
                  <span className={styles.heroCardSub}>New deals every day</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MOBILE Hero Card ── */}
      <section className={styles.mobileHero}>
        <div className={styles.mobileHeroCard}>
          <div className={styles.mobileHeroLeft}>
            <div className={styles.mobileHeroBrand}>
              <div className={styles.mobileHeroBrandMark}>
                <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                  <path d="M8 24 Q16 8 24 24" stroke="#E75525" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <circle cx="8"  cy="24" r="2.8" fill="#E75525"/>
                  <circle cx="16" cy="13" r="2.8" fill="#E75525"/>
                  <circle cx="24" cy="24" r="2.8" fill="#E75525"/>
                </svg>
              </div>
              <span className={styles.mobileHeroBrandName}>addora</span>
            </div>
            <h2 className={styles.mobileHeroTitle}>Launching in Ethiopia</h2>
            <p className={styles.mobileHeroSub}>Thousands of products · Trusted sellers</p>
            <div className={styles.mobileHeroPills}>
              <span className={styles.mobileHeroPill}>Telebirr</span>
              <span className={styles.mobileHeroPill}>Chapa</span>
              <span className={styles.mobileHeroPill}>Cash on delivery</span>
            </div>
          </div>
          <div className={styles.mobileHeroRight}>
            <div className={styles.mobileHeroDecorBox}>
              <span className={styles.mobileHeroDot} style={{ top: '20%', left: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ top: '20%', right: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ bottom: '20%', left: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ bottom: '20%', right: '20%' }} />
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className={styles.mobileCategoryRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.mobileCatBtn} ${activeCategory === cat ? styles.mobileCatActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Banner (desktop) with ② ad slot ── */}
      <div className={styles.flashBanner}>
        <div className={styles.flashInner}>
          <div className={styles.flashLeft}>
            <span className={styles.flashIcon}>⚡</span>
            <span className={styles.flashTitle}>Flash Sale</span>
            <span className={styles.flashSub}>Limited time deals — up to 64% off</span>
          </div>
          <div className={styles.flashDeals}>
            {products.filter(p => p.discount >= 30).slice(0, 2).map(p => (
              <a key={p.id} href={`/products/${p.id}`} className={styles.flashItem}>
                <span className={styles.flashBadge}>-{p.discount}%</span>
                <span className={styles.flashName}>{p.name}</span>
                <span className={styles.flashPrice}>ETB {Math.round(p.price * (1 - p.discount / 100)).toLocaleString()}</span>
              </a>
            ))}
            {/* ② Promoted slot */}
            <FlashAdItem />
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <section className={styles.products} id="products">
        <div className={styles.sectionInner}>

          {/* Desktop filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.categories}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
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
                className={styles.search}
              />
            </div>
          </div>

          {/* Mobile section header */}
          <div className={styles.mobileSectionHeader}>
            <span className={styles.mobileSectionTitle}>Featured products</span>
            <a href="#" className={styles.mobileSeeAll}>See all</a>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No products found</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {gridItems.map(item => {
                if (item.type === 'product') {
                  return (
                    <div key={item.key} style={{ animationDelay: `${item.delay * 0.05}s` }}>
                      <ProductCard product={item.product} />
                    </div>
                  )
                }
                if (item.type === 'sponsored-card') {
                  // ③ Sponsored product card
                  return <SponsoredProductCard key={item.key} />
                }
                if (item.type === 'mid-banner') {
                  // ④ Mid-grid leaderboard — spans full grid width
                  return (
                    <div key={item.key} className={styles.midBannerWrapper}>
                      <MidGridBanner />
                    </div>
                  )
                }
                return null
              })}
            </div>
          )}
        </div>
      </section>

      {/* ⑤ Pre-footer ad strip */}
      <PreFooterAd />
    </>
  )
}
