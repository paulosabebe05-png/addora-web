'use client'
import { useState } from 'react'
import styles from './SearchSidebar.module.css'

const STARS = [4, 3, 2, 1]

export default function SearchSidebar({
  facets,
  category, setCategory,
  brand, toggleBrand,
  minPrice, maxPrice, setPriceRange,
  rating, setRating,
  inStock, setInStock,
  activeCount, clearAll,
  // mobile
  mobile, onClose,
}) {
  const [localMin, setLocalMin] = useState(minPrice || '')
  const [localMax, setLocalMax] = useState(maxPrice < 100000 ? maxPrice : '')

  const applyPrice = () => {
    const mn = localMin === '' ? 0 : Number(localMin)
    const mx = localMax === '' ? 100000 : Number(localMax)
    setPriceRange(mn, mx)
    if (mobile) onClose?.()
  }

  const content = (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.sidebarHead}>
        <span className={styles.sidebarTitle}>Filters</span>
        <div className={styles.sidebarHeadRight}>
          {activeCount > 0 && (
            <button className={styles.clearAllBtn} onClick={clearAll}>
              Clear all ({activeCount})
            </button>
          )}
          {mobile && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close filters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Category ── */}
      <FilterSection title="Category" defaultOpen>
        <div className={styles.optionList}>
          <button
            className={`${styles.catOption} ${!category ? styles.catActive : ''}`}
            onClick={() => setCategory('')}
          >
            All Categories
          </button>
          {facets.categories.map(cat => (
            <button
              key={cat.id}
              className={`${styles.catOption} ${category === cat.slug ? styles.catActive : ''}`}
              onClick={() => setCategory(category === cat.slug ? '' : cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Brand ── */}
      {facets.brands.length > 0 && (
        <FilterSection title="Brand" defaultOpen={brand.length > 0}>
          <BrandList brands={facets.brands} selected={brand} toggle={toggleBrand} />
        </FilterSection>
      )}

      {/* ── Price range ── */}
      <FilterSection title="Price Range" defaultOpen={minPrice > 0 || maxPrice < 100000}>
        <div className={styles.priceRow}>
          <div className={styles.priceInput}>
            <span className={styles.priceCurrency}>ETB</span>
            <input
              type="number"
              placeholder="Min"
              value={localMin}
              onChange={e => setLocalMin(e.target.value)}
              className={styles.priceField}
              min={0}
            />
          </div>
          <span className={styles.priceDash}>—</span>
          <div className={styles.priceInput}>
            <span className={styles.priceCurrency}>ETB</span>
            <input
              type="number"
              placeholder="Max"
              value={localMax}
              onChange={e => setLocalMax(e.target.value)}
              className={styles.priceField}
              min={0}
            />
          </div>
        </div>
        {/* Quick presets */}
        <div className={styles.pricePresets}>
          {[
            { label: 'Under 500',    min: 0,    max: 500 },
            { label: '500 – 2,000',  min: 500,  max: 2000 },
            { label: '2,000 – 5,000',min: 2000, max: 5000 },
            { label: 'Over 5,000',   min: 5000, max: 100000 },
          ].map(p => (
            <button
              key={p.label}
              className={`${styles.pricePreset} ${minPrice === p.min && maxPrice === p.max ? styles.presetActive : ''}`}
              onClick={() => { setLocalMin(p.min || ''); setLocalMax(p.max >= 100000 ? '' : p.max); setPriceRange(p.min, p.max) }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button className={styles.applyPriceBtn} onClick={applyPrice}>Apply</button>
      </FilterSection>

      {/* ── Rating ── */}
      <FilterSection title="Min Rating" defaultOpen={rating > 0}>
        <div className={styles.ratingList}>
          {STARS.map(s => (
            <button
              key={s}
              className={`${styles.ratingRow} ${rating === s ? styles.ratingActive : ''}`}
              onClick={() => setRating(rating === s ? 0 : s)}
            >
              <Stars n={s} />
              <span className={styles.ratingLabel}>{s}+ Stars</span>
              {rating === s && (
                <svg className={styles.ratingCheck} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── In stock ── */}
      <FilterSection title="Availability" defaultOpen={inStock}>
        <label className={styles.toggleRow}>
          <span className={styles.toggleLabel}>In Stock Only</span>
          <div
            className={`${styles.toggle} ${inStock ? styles.toggleOn : ''}`}
            onClick={() => setInStock(!inStock)}
            role="switch"
            aria-checked={inStock}
          >
            <div className={styles.toggleKnob} />
          </div>
        </label>
      </FilterSection>

      {/* Mobile apply */}
      {mobile && (
        <div className={styles.mobileApply}>
          <button className={styles.mobileApplyBtn} onClick={onClose}>
            Show Results
          </button>
        </div>
      )}
    </div>
  )

  if (mobile) {
    return (
      <div className={styles.mobileOverlay} onClick={onClose}>
        <div className={styles.mobileSheet} onClick={e => e.stopPropagation()}>
          <div className={styles.mobileHandle} />
          {content}
        </div>
      </div>
    )
  }

  return content
}

/* ── Collapsible filter section ── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={() => setOpen(o => !o)}>
        <span className={styles.sectionTitle}>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  )
}

/* ── Brand list with show more ── */
function BrandList({ brands, selected, toggle }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? brands : brands.slice(0, 7)
  return (
    <div>
      <div className={styles.checkList}>
        {visible.map(b => (
          <label key={b.id} className={styles.checkRow}>
            <div
              className={`${styles.checkbox} ${selected.includes(b.slug) ? styles.checkboxOn : ''}`}
              onClick={() => toggle(b.slug)}
              role="checkbox"
              aria-checked={selected.includes(b.slug)}
            >
              {selected.includes(b.slug) && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span className={styles.checkLabel} onClick={() => toggle(b.slug)}>{b.name}</span>
          </label>
        ))}
      </div>
      {brands.length > 7 && (
        <button className={styles.showMoreBtn} onClick={() => setShowAll(s => !s)}>
          {showAll ? 'Show less' : `+${brands.length - 7} more`}
        </button>
      )}
    </div>
  )
}

/* ── Star display ── */
function Stars({ n }) {
  return (
    <span className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i <= n ? '#F59E0B' : 'none'}
          stroke={i <= n ? '#F59E0B' : '#D1D5DB'}
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}