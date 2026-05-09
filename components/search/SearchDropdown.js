'use client'
import Link from 'next/link'
import styles from './SearchDropdown.module.css'

export default function SearchDropdown({
  query,
  results,
  loading,
  recent,
  onSelect,
  onRemoveRecent,
  onClearRecent,
  activeIndex,
  setActiveIndex,
}) {
  const { products = [], categories = [] } = results
  const hasResults = products.length > 0 || categories.length > 0
  const showRecent = !query.trim() && recent?.length > 0

  // ── No query: show recent searches ──
  if (showRecent) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.sectionHeader}>
          <span>Recent searches</span>
          <button className={styles.clearAll} onClick={onClearRecent}>Clear all</button>
        </div>
        {recent.map((term, i) => (
          <div
            key={term}
            className={`${styles.recentItem} ${activeIndex === i ? styles.active : ''}`}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(-1)}
          >
            <button className={styles.recentBtn} onClick={() => onSelect(term)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="12 8 12 12 14 14"/>
                <path d="M3.05 11a9 9 0 1 0 .5-4.5"/>
                <polyline points="3 3 3 9 9 9"/>
              </svg>
              <span>{term}</span>
            </button>
            <button
              className={styles.removeRecent}
              onClick={() => onRemoveRecent(term)}
              aria-label={`Remove ${term}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.loadingRow}>
          <div className={styles.spinner} />
          <span>Searching…</span>
        </div>
      </div>
    )
  }

  // ── Query with no results ──
  if (query.trim() && !hasResults) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.empty}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>No results for <strong>"{query}"</strong></p>
          <span>Try a different keyword</span>
        </div>
      </div>
    )
  }

  if (!hasResults) return null

  let itemIndex = 0

  return (
    <div className={styles.dropdown}>

      {/* Categories */}
      {categories.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Categories</span>
          </div>
          {categories.map(cat => {
            const idx = itemIndex++
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className={`${styles.resultItem} ${activeIndex === idx ? styles.active : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => onSelect(cat.name)}
              >
                <span className={styles.catIcon}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </span>
                <span className={styles.resultName}>{cat.name}</span>
                <span className={styles.inCategory}>in Categories</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Products</span>
          </div>
          {products.map(product => {
            const idx = itemIndex++
            // Calculate actual price after discount
            const discountedPrice = product.discount > 0
              ? product.price * (1 - product.discount / 100)
              : product.price

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className={`${styles.productItem} ${activeIndex === idx ? styles.active : ''}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(-1)}
                onClick={() => onSelect(product.name)}
              >
                <div className={styles.productThumb}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className={styles.productImg} />
                  ) : (
                    <div className={styles.productImgPlaceholder}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{product.name}</span>
                  {product.discount > 0 && (
                    <span className={styles.productDiscount}>{product.discount}% off</span>
                  )}
                </div>
                <span className={styles.productPrice}>
                  ETB {Math.round(discountedPrice).toLocaleString()}
                </span>
              </Link>
            )
          })}
        </div>
      )}

      {/* View all */}
      {query.trim() && (
        <button className={styles.viewAll} onClick={() => onSelect(query)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          See all results for <strong>"{query}"</strong>
        </button>
      )}
    </div>
  )
}
