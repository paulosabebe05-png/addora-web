'use client'
import { useState } from 'react'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

const CATEGORIES = ['All', 'Kids', 'Electronics', 'Home & Living', 'Beauty', 'Fashion', 'Watches', 'Sports']

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

  return (
    <>
      {/* ── Hero ── */}
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

          {/* Right: stats visual */}
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

      {/* ── Flash Sale Banner ── */}
      <div className={styles.flashBanner}>
        <div className={styles.flashInner}>
          <div className={styles.flashLeft}>
            <span className={styles.flashIcon}>⚡</span>
            <span className={styles.flashTitle}>Flash Sale</span>
            <span className={styles.flashSub}>Limited time deals — up to 64% off</span>
          </div>
          <div className={styles.flashDeals}>
            {products.filter(p => p.discount >= 30).slice(0, 3).map(p => (
              <a key={p.id} href={`/products/${p.id}`} className={styles.flashItem}>
                <span className={styles.flashBadge}>-{p.discount}%</span>
                <span className={styles.flashName}>{p.name}</span>
                <span className={styles.flashPrice}>ETB {Math.round(p.price * (1 - p.discount / 100)).toLocaleString()}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Products ── */}
      <section className={styles.products} id="products">
        <div className={styles.sectionInner}>
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
                <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
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
