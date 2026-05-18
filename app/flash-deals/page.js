'use client'
// app/flash-deals/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Full "View All Flash Deals" page.
// • Uses the shared localStorage countdown (same timer as HomeClient).
// • When the timer hits zero all products disappear and an empty state shows.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '@/components/ui/ProductCard'
import { useFlashCountdown } from '@/hooks/useFlashCountdown'
import styles from './FlashDeals.module.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

// ── tiny helpers ─────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '55%' }} />
        <div className={styles.skeletonLine} style={{ width: '40%' }} />
      </div>
    </div>
  )
}

// ── Countdown pill ────────────────────────────────────────────────────────────
function CountdownPill({ h, m, s }) {
  return (
    <div className={styles.timerPill}>
      <span className={styles.timerLabel}>Ends in</span>
      {[pad(h), pad(m), pad(s)].map((seg, i) => (
        <span key={i} className={styles.timerGroup}>
          <span className={styles.timerBox}>{seg}</span>
          {i < 2 && <span className={styles.timerColon}>:</span>}
        </span>
      ))}
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────
export default function FlashDealsPage() {
  const { h, m, s, expired } = useFlashCountdown()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sortBy,   setSortBy]   = useState('discount')

  useEffect(() => {
    if (expired) { setProducts([]); setLoading(false); return }
    setLoading(true)
    let query = supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', 'flash_sale')

    switch (sortBy) {
      case 'rating':     query = query.order('rating',   { ascending: false }); break
      case 'price_asc':  query = query.order('price',    { ascending: true  }); break
      case 'price_desc': query = query.order('price',    { ascending: false }); break
      default:           query = query.order('discount', { ascending: false }); break
    }

    query.then(({ data, error }) => {
      if (error) console.error('Flash deals fetch error:', error)
      setProducts(data || [])
      setLoading(false)
    })
  }, [expired, sortBy])

  // When the timer expires mid-session, wipe products reactively
  useEffect(() => {
    if (expired) setProducts([])
  }, [expired])

  return (
    <div className={styles.page}>

      {/* ── Title Bar ── */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarInner}>

          {/* Breadcrumb */}
          <ol className={styles.breadcrumb}>
            <li><Link href="/" className={styles.breadcrumbLink}>Home</Link></li>
            <li className={styles.breadcrumbSep}>›</li>
            <li className={styles.breadcrumbCurrent}>Flash Deals</li>
          </ol>

          {/* Title row */}
          <div className={styles.titleRow}>
            <span className={styles.accentBar} />
            <div className={styles.titleText}>
              <p className={styles.sectionLabel}>Today Only</p>
              <h1 className={styles.pageTitle}>⚡ Flash Deals</h1>
            </div>
            {!expired && <CountdownPill h={h} m={m} s={s} />}
          </div>

          {/* Sort bar — only shown when not expired */}
          {!expired && (
            <div className={styles.sortBar}>
              <span className={styles.productCount}>
                {loading ? '…' : `${products.length} products`}
              </span>
              <div className={styles.sortBtns}>
                {[
                  { key: 'discount',   label: 'Best Discount' },
                  { key: 'rating',     label: 'Top Rated'     },
                  { key: 'price_asc',  label: 'Price ↑'       },
                  { key: 'price_desc', label: 'Price ↓'       },
                ].map(o => (
                  <button
                    key={o.key}
                    className={`${styles.sortBtn} ${sortBy === o.key ? styles.sortActive : ''}`}
                    onClick={() => setSortBy(o.key)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Content ── */}
      <main className={styles.main}>
        {expired ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>⏰</p>
            <p className={styles.emptyTitle}>Flash Sale Ended</p>
            <p className={styles.emptySub}>
              You just missed it — but new deals drop soon. Check back later!
            </p>
            <Link href="/" className={styles.emptyCta}>Back to Home</Link>
          </div>
        ) : loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>⚡</p>
            <p className={styles.emptyTitle}>No Flash Deals</p>
            <p className={styles.emptySub}>No flash deals right now. Check back soon!</p>
            <Link href="/" className={styles.emptyCta}>Back to Home</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p, i) => (
              <div
                key={p.id}
                style={{ animationDelay: `${i * 0.025}s` }}
                className={styles.gridItem}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </main>

    </div>
  )
}
