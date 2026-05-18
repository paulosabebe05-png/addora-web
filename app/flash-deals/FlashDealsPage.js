'use client'
// app/flash-deals/page.js  ← or wherever your Next.js pages live
// ─────────────────────────────────────────────────────────────────────────────
// Full "View All Flash Deals" page.
// • Uses the shared localStorage countdown (same timer as HomeClient).
// • When the timer hits zero all products disappear and an empty state shows.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import ProductCard from '@/components/ui/ProductCard'
import { useFlashCountdown } from '@/hooks/useFlashCountdown'   // ← adjust path
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

// ── Countdown pill (same visual style as HomeClient) ─────────────────────────
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

// ── Empty state shown when timer expires ─────────────────────────────────────
function ExpiredState() {
  return (
    <div className={styles.expiredWrap}>
      <div className={styles.expiredIcon}>⏰</div>
      <h2 className={styles.expiredTitle}>Flash Sale Ended</h2>
      <p className={styles.expiredSub}>
        You just missed it — but new deals drop soon. Check back later!
      </p>
      <Link href="/" className={styles.expiredCta}>Back to Home</Link>
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────
export default function FlashDealsPage() {
  const { h, m, s, expired } = useFlashCountdown()
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (expired) { setProducts([]); setLoading(false); return }
    setLoading(true)
    supabase
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('active', true)
      .eq('section', 'flash_sale')
      .order('discount', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Flash deals fetch error:', error)
        setProducts(data || [])
        setLoading(false)
      })
  }, [expired])

  // When the timer expires mid-session, wipe products reactively
  useEffect(() => {
    if (expired) setProducts([])
  }, [expired])

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
            <p className={styles.sectionLabel}>Today Only</p>
            <h1 className={styles.pageTitle}>⚡ Flash Deals</h1>
          </div>
          {!expired && <CountdownPill h={h} m={m} s={s} />}
        </div>

        {!expired && (
          <p className={styles.subline}>
            {loading ? '…' : `${products.length} products`} · Discounted up to 70%
          </p>
        )}
      </div>

      {/* ── Content ── */}
      <main className={styles.main}>
        {expired ? (
          <ExpiredState />
        ) : loading ? (
          <div className={styles.grid}>
            {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <p>No flash deals right now. Check back soon!</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.025}s` }}
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