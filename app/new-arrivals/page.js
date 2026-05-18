'use client'
// app/new-arrivals/page.js
// ─────────────────────────────────────────────────────────────────────────────
// Full "View All New Arrivals" page.
// No countdown needed — just fetches section = 'new_arrivals', ordered newest first.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '@/components/ui/ProductCard'
import styles from './NewArrivals.module.css'

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

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sortBy,   setSortBy]   = useState('newest') // 'newest' | 'rating' | 'price_asc' | 'price_desc'

  useEffect(() => {
    setLoading(true)

    let query = supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', 'new_arrivals')

    switch (sortBy) {
      case 'rating':     query = query.order('rating',     { ascending: false }); break
      case 'price_asc':  query = query.order('price',      { ascending: true  }); break
      case 'price_desc': query = query.order('price',      { ascending: false }); break
      default:           query = query.order('created_at', { ascending: false }); break
    }

    query.then(({ data, error }) => {
      if (error) console.error('New arrivals fetch error:', error)
      setProducts(data || [])
      setLoading(false)
    })
  }, [sortBy])

  return (
    <div className={styles.page}>

      {/* ── Title Bar ── */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarInner}>

          {/* Breadcrumb */}
          <ol className={styles.breadcrumb}>
            <li><Link href="/" className={styles.breadcrumbLink}>Home</Link></li>
            <li className={styles.breadcrumbSep}>›</li>
            <li className={styles.breadcrumbCurrent}>New Arrivals</li>
          </ol>

          {/* Title row */}
          <div className={styles.titleRow}>
            <span className={styles.accentBar} />
            <div className={styles.titleText}>
              <p className={styles.sectionLabel}>Fresh Picks</p>
              <h1 className={styles.pageTitle}>✨ New Arrivals</h1>
            </div>
          </div>

          {/* Sort bar */}
          <div className={styles.sortBar}>
            <span className={styles.productCount}>
              {loading ? '…' : `${products.length} products`}
            </span>
            <div className={styles.sortBtns}>
              {[
                { key: 'newest',     label: 'Newest'    },
                { key: 'rating',     label: 'Top Rated' },
                { key: 'price_asc',  label: 'Price ↑'   },
                { key: 'price_desc', label: 'Price ↓'   },
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
      </div>

      {/* ── Content ── */}
      <main className={styles.main}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>✨</p>
            <p className={styles.emptyTitle}>Nothing here yet</p>
            <p className={styles.emptySub}>No new arrivals yet — check back soon!</p>
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
