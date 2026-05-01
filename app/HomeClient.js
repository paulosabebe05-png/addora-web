'use client'
import { useState } from 'react'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

const CATEGORIES = ['All', 'Kids', 'Boys', 'Girls', 'Newborn', 'School']

export default function HomeClient({ products }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p => {
    const matchCat =
      activeCategory === 'All' ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase())

    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase())

    return matchCat && matchSearch
  })

  return (
    <>
      {/* Slim Hero Banner */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          {/* Left: text */}
          <div className={styles.heroLeft}>
            <h1 className={styles.heroTitle}>
              Shop Smart, <span>Pay on Delivery</span>
            </h1>
            <p className={styles.heroSub}>
              Ethiopia's trusted store — cash on delivery, 1–3 day shipping.
            </p>
          </div>

          {/* Right: feature pills */}
          <div className={styles.heroRight}>
            <div className={styles.heroPill}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Cash on Delivery
            </div>
            <div className={styles.heroPill}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              1–3 Day Delivery
            </div>
            <div className={styles.heroPill}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Quality Guaranteed
            </div>
            <div className={styles.heroPill}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Free Delivery in Addis
            </div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className={styles.products}>
        <div className={styles.productsInner}>
          {/* Filter bar */}
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

          {/* Grid */}
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
