'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchFilters } from './useSearchFilters'
import { useSearchResults } from './useSearchResults'
import SearchSidebar from './SearchSidebar'
import styles from './SearchPage.module.css'

const SORT_OPTIONS = [
  { value: 'relevance',  label: 'Most Relevant' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest First' },
]

export default function SearchPage() {
  const filters = useSearchFilters()
  const { products, total, loading, facets, pageSize } = useSearchResults(filters)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const totalPages = Math.ceil(total / pageSize)
  const hasActiveFilters = filters.activeCount > 0

  return (
    <div className={styles.page}>
      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          {/* Query summary */}
          <div className={styles.queryInfo}>
            {filters.q ? (
              <>
                <span className={styles.queryLabel}>Results for</span>
                <span className={styles.queryTerm}>"{filters.q}"</span>
              </>
            ) : (
              <span className={styles.queryLabel}>All Products</span>
            )}
            {!loading && (
              <span className={styles.queryCount}>
                {total.toLocaleString()} {total === 1 ? 'product' : 'products'}
              </span>
            )}
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className={styles.activeChips}>
              {filters.category && (
                <Chip
                  label={facets.categories.find(c => c.id === filters.category)?.name || filters.category}
                  onRemove={() => filters.setCategory('')}
                />
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 100000) && (
                <Chip
                  label={`ETB ${filters.minPrice.toLocaleString()} – ${filters.maxPrice >= 100000 ? '∞' : filters.maxPrice.toLocaleString()}`}
                  onRemove={() => filters.setPriceRange(0, 100000)}
                />
              )}
              {filters.rating > 0 && (
                <Chip label={`${filters.rating}+ Stars`} onRemove={() => filters.setRating(0)} />
              )}
              {filters.inStock && (
                <Chip label="In Stock" onRemove={() => filters.setInStock(false)} />
              )}
              <button className={styles.clearChip} onClick={filters.clearAll}>Clear all</button>
            </div>
          )}

          {/* Sort + mobile filter button */}
          <div className={styles.topBarRight}>
            <button
              className={`${styles.mobileFilterBtn} ${hasActiveFilters ? styles.mobileFilterActive : ''}`}
              onClick={() => setFiltersOpen(true)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="4" y1="6" x2="20" y2="6"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
                <line x1="11" y1="18" x2="13" y2="18"/>
              </svg>
              Filters
              {hasActiveFilters && <span className={styles.filterBadge}>{filters.activeCount}</span>}
            </button>

            <div className={styles.sortWrap}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.sortIcon}>
                <path d="M3 6h18M6 12h12M9 18h6"/>
              </svg>
              <select
                value={filters.sort}
                onChange={e => filters.setSort(e.target.value)}
                className={styles.sortSelect}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.layout}>
        <aside className={styles.sidebarWrap}>
          <SearchSidebar
            facets={facets}
            category={filters.category} setCategory={filters.setCategory}
            minPrice={filters.minPrice} maxPrice={filters.maxPrice} setPriceRange={filters.setPriceRange}
            rating={filters.rating} setRating={filters.setRating}
            inStock={filters.inStock} setInStock={filters.setInStock}
            activeCount={filters.activeCount} clearAll={filters.clearAll}
          />
        </aside>

        <div className={styles.main}>
          {loading ? (
            <SkeletonGrid />
          ) : products.length === 0 ? (
            <EmptyState q={filters.q} onClear={filters.clearAll} hasFilters={hasActiveFilters} />
          ) : (
            <>
              <div className={styles.grid}>
                {products.map((p, i) => (
                  <ProductCard key={p.id} product={p} style={{ animationDelay: `${i * 0.03}s` }} />
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination page={filters.page} total={totalPages} onPage={filters.setPage} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile sidebar sheet */}
      {filtersOpen && (
        <SearchSidebar
          mobile
          onClose={() => setFiltersOpen(false)}
          facets={facets}
          category={filters.category} setCategory={filters.setCategory}
          minPrice={filters.minPrice} maxPrice={filters.maxPrice} setPriceRange={filters.setPriceRange}
          rating={filters.rating} setRating={filters.setRating}
          inStock={filters.inStock} setInStock={filters.setInStock}
          activeCount={filters.activeCount} clearAll={filters.clearAll}
        />
      )}
    </div>
  )
}

/* ── Product card ── */
function ProductCard({ product: p, style }) {
  const discountedPrice = p.discount > 0
    ? Math.round(p.price * (1 - p.discount / 100))
    : p.price
  const isInStock = p.stock > 0

  return (
    <Link href={`/products/${p.id}`} className={styles.card} style={style}>
      <div className={styles.cardThumb}>
        {p.image_url
          ? <img src={p.image_url} alt={p.name} className={styles.cardImg} />
          : <span className={styles.cardImgPlaceholder}>🛍</span>
        }
        {p.discount > 0 && (
          <span className={styles.discountBadge}>-{p.discount}%</span>
        )}
        {!isInStock && <div className={styles.outOfStockOverlay}>Out of Stock</div>}
      </div>
      <div className={styles.cardBody}>
        {p.category?.name && (
          <span className={styles.cardMeta}>{p.category.name}</span>
        )}
        <span className={styles.cardName}>{p.name}</span>
        <div className={styles.cardFooter}>
          <div className={styles.cardPrices}>
            <span className={styles.cardPrice}>ETB {discountedPrice.toLocaleString()}</span>
            {p.discount > 0 && (
              <span className={styles.cardOriginal}>ETB {Number(p.price).toLocaleString()}</span>
            )}
          </div>
          {p.rating > 0 && (
            <div className={styles.cardRating}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{Number(p.rating).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function Chip({ label, onRemove }) {
  return (
    <span className={styles.chip}>
      {label}
      <button className={styles.chipRemove} onClick={onRemove} aria-label={`Remove ${label}`}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>
  )
}

function Pagination({ page, total, onPage }) {
  const pages = []
  const delta = 2
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - delta && i <= page + delta)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className={styles.pageEllipsis}>…</span>
          : <button key={p} className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`} onClick={() => onPage(p)}>{p}</button>
      )}
      <button className={styles.pageBtn} disabled={page >= total} onClick={() => onPage(page + 1)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  )
}

function SkeletonGrid() {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonThumb} />
          <div className={styles.skeletonBody}>
            <div className={styles.skeletonLine} style={{ width: '40%', height: 10 }} />
            <div className={styles.skeletonLine} style={{ width: '85%', height: 13 }} />
            <div className={styles.skeletonLine} style={{ width: '50%', height: 14, marginTop: 4 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ q, onClear, hasFilters }) {
  return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <p className={styles.emptyTitle}>{q ? `No results for "${q}"` : 'No products found'}</p>
      <p className={styles.emptySubtitle}>{hasFilters ? 'Try removing some filters.' : 'Try a different search term.'}</p>
      {hasFilters && <button className={styles.emptyBtn} onClick={onClear}>Clear Filters</button>}
    </div>
  )
}
