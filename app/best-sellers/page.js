'use client'
// app/best-sellers/page.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '../../components/ui/ProductCard'
import styles from './BestSellers.module.css'

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

export default function BestSellersPage() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [sortBy,   setSortBy]   = useState('sold')

  useEffect(() => {
    setLoading(true)
    let query = supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', 'best_sellers')

    switch (sortBy) {
      case 'rating':     query = query.order('rating',     { ascending: false }); break
      case 'price_asc':  query = query.order('price',      { ascending: true  }); break
      case 'price_desc': query = query.order('price',      { ascending: false }); break
      case 'newest':     query = query.order('created_at', { ascending: false }); break
      default:           query = query.order('sold',       { ascending: false }); break // most sold first
    }

    query.then(({ data, error }) => {
      if (error) console.error('Best sellers fetch error:', error)
      setProducts(data || [])
      setLoading(false)
    })
  }, [sortBy])

  return (
    <div className={styles.page}>

      {/* ── Title bar — sits below site navbar ── */}
      <div className={styles.titleBar}>
        <div className={styles.titleBarInner}>

          <div className={styles.breadcrumb}>
            <Link href="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Best Sellers</span>
          </div>

          <div className={styles.titleRow}>
            <div className={styles.accentBar} />
            <div>
              <p className={styles.sectionLabel}>This Month</p>
              <h1 className={styles.pageTitle}>🏆 Best Sellers</h1>
            </div>
          </div>

          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>
              {loading ? '…' : `${products.length} products`}
            </span>
            <div className={styles.sortBtns}>
              {[
                { key: 'sold',       label: 'Most Sold' },
                { key: 'rating',     label: 'Top Rated' },
                { key: 'newest',     label: 'Newest' },
                { key: 'price_asc',  label: 'Price ↑' },
                { key: 'price_desc', label: 'Price ↓' },
              ].map(o => (
                <button key={o.key}
                  className={`${styles.sortBtn} ${sortBy === o.key ? styles.sortActive : ''}`}
                  onClick={() => setSortBy(o.key)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🏆</span>
            <p className={styles.emptyTitle}>No best sellers yet</p>
            <p className={styles.emptySub}>Products will appear here as they get sold!</p>
            <Link href="/" className={styles.emptyCta}>Back to Home</Link>
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