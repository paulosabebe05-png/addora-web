'use client'
// app/todays-deals/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Full "View All Today's Deals" page.
// Fetches section = 'todays_deals', ordered by highest discount.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '@/components/ui/ProductCard'
import styles from './TodaysDeals.module.css'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

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

export default function TodaysDealsPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sortBy,   setSortBy]   = useState('discount')

  useEffect(() => {
    setLoading(true)

    let query = supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', 'todays_deals')

    switch (sortBy) {
      case 'rating':     query = query.order('rating',     { ascending: false }); break
      case 'price_asc':  query = query.order('price',      { ascending: true  }); break
      case 'price_desc': query = query.order('price',      { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('discount',   { ascending: false }); break // 'discount'
    }

    query.then(({ data, error }) => {
      if (error) console.error("Today's deals fetch error:", error)
      setProducts(data || [])
      setLoading(false)
    })
  }, [sortBy])

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Home
        </Link>

        <div className={styles.titleRow}>
          <div className={styles.accentBar} />
          <div>
            <p className={styles.sectionLabel}>Only Today</p>
            <h1 className={styles.pageTitle}>🔥 Today's Deals</h1>
          </div>
        </div>

        {/* Sort bar */}
        <div className={styles.sortBar}>
          <span className={styles.sortLabel}>
            {loading ? '…' : `${products.length} products`}
          </span>
          <div className={styles.sortBtns}>
            {[
              { key: 'discount',   label: 'Best Discount' },
              { key: 'rating',     label: 'Top Rated' },
              { key: 'newest',     label: 'Newest' },
              { key: 'price_asc',  label: 'Price ↑' },
              { key: 'price_desc', label: 'Price ↓' },
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
      </div>

      {/* ── Content ── */}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>No deals today — check back tomorrow!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p, i) => (
              <div key={p.id}
                   style={{ animationDelay: `${i * 0.025}s` }}
                   className={styles.gridItem}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}