'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

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

// Countdown timer hook
function useCountdown(targetHours = 8) {
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

export default function HomeClient({ products }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const countdown = useCountdown(6)

  const flashProducts = products.filter(p => p.discount >= 20).slice(0, 6)

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

  return (
    <>
      {/* ══════════════════════════════
          DESKTOP HERO
      ══════════════════════════════ */}
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
              {['Cash on Delivery','1–3 Day Delivery','Quality Guaranteed','Free in Addis'].map(f => (
                <div key={f} className={styles.heroFeature}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroOrb} />
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
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          MOBILE HERO
      ══════════════════════════════ */}
      <section className={styles.mobileHero}>
        {/* Hero banner card */}
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
            <h2 className={styles.mobileHeroTitle}>🔥 Launch Sale<br/>Up to 64% Off</h2>
            <p className={styles.mobileHeroSub}>Cash on delivery · Free in Addis Ababa</p>
            <Link href="#products" className={styles.mobileHeroCta}>
              Shop Now →
            </Link>
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

        {/* Trust strip */}
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>✓</span>
            <span>Cash on Delivery</span>
          </div>
          <div className={styles.trustDivider}/>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🚚</span>
            <span>1–3 Day Delivery</span>
          </div>
          <div className={styles.trustDivider}/>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🔒</span>
            <span>Verified Sellers</span>
          </div>
        </div>

        {/* ── Flash Sale ── */}
        {flashProducts.length > 0 && (
          <div className={styles.flashSection}>
            <div className={styles.flashHead}>
              <div className={styles.flashTitleRow}>
                <span className={styles.flashFire}>⚡</span>
                <span className={styles.flashTitle}>Flash Sale</span>
                <span className={styles.flashBadgePill}>-{Math.max(...flashProducts.map(p=>p.discount))}%</span>
              </div>
              <div className={styles.flashTimer}>
                {countdown.split(':').map((seg, i) => (
                  <span key={i} className={styles.flashTimerGroup}>
                    <span className={styles.flashTimerNum}>{seg}</span>
                    {i < 2 && <span className={styles.flashTimerColon}>:</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.flashGrid}>
              {flashProducts.map(p => {
                const price = Math.round(p.price * (1 - p.discount / 100))
                return (
                  <Link key={p.id} href={`/products/${p.id}`} className={styles.flashItem}>
                    <div className={styles.flashImg}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className={styles.flashImgEl}/>
                        : <span>🛍️</span>
                      }
                      <span className={styles.flashItemBadge}>-{p.discount}%</span>
                    </div>
                    <span className={styles.flashItemPrice}>ETB {price.toLocaleString()}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Category pills with icons ── */}
        <div className={styles.mobileCategoryRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              className={`${styles.mobileCatBtn} ${activeCategory === cat.label ? styles.mobileCatActive : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
              <span className={styles.catIcon}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Desktop flash banner ── */}
      <div className={styles.flashBanner}>
        <div className={styles.flashInner}>
          <div className={styles.flashLeft}>
            <span className={styles.flashIconDesktop}>⚡</span>
            <div>
              <div className={styles.flashTitleDesktop}>Flash Sale</div>
              <div className={styles.flashSub}>Limited time — up to 64% off</div>
            </div>
          </div>
          <div className={styles.flashDeals}>
            {products.filter(p => p.discount >= 30).slice(0, 3).map(p => (
              <a key={p.id} href={`/products/${p.id}`} className={styles.flashDealItem}>
                <span className={styles.flashBadge}>-{p.discount}%</span>
                <span className={styles.flashName}>{p.name}</span>
                <span className={styles.flashPrice}>ETB {Math.round(p.price * (1 - p.discount / 100)).toLocaleString()}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════
          PRODUCTS
      ══════════════════════════════ */}
      <section className={styles.products} id="products">
        <div className={styles.sectionInner}>

          {/* Desktop filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.categories}>
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
                className={styles.search}
              />
            </div>
          </div>

          {/* Mobile section header */}
          <div className={styles.mobileSectionHeader}>
            <span className={styles.mobileSectionTitle}>Featured products</span>
            <Link href="/categories" className={styles.mobileSeeAll}>See all</Link>
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
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
