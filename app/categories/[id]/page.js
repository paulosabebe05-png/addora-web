'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import ProductCard from '../../../components/ui/ProductCard'
import styles from './CategoryProducts.module.css'
import { useLang } from '../../../lib/lang'

export default function CategoryProductsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { tr, lang } = useLang()   // ← lang added so we can pick name_am

  const [category, setCategory]   = useState(null)
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [sort, setSort]           = useState('newest')
  const [search, setSearch]       = useState('')

  // Returns Amharic name when lang === 'am' and name_am exists, else English name
  const catName = (cat) =>
    (lang === 'am' && cat?.name_am) ? cat.name_am : cat?.name

  // Sort options inside component so tr() works
  const SORT_OPTIONS = [
    { value: 'newest',     label: tr('sortMostRecent') },
    { value: 'price_asc',  label: tr('sortPriceAsc')  || 'Price: Low to High' },
    { value: 'price_desc', label: tr('sortPriceDesc') || 'Price: High to Low' },
    { value: 'discount',   label: tr('sortDiscount')  || 'Best Discount' },
  ]

  useEffect(() => {
    if (!id) return
    async function load() {
      setLoading(true)

      // Fetch category — name_am added for Amharic support
      const { data: cat } = await supabase
        .from('categories')
        .select('id, name, name_am')   // ← name_am added
        .eq('id', id)
        .single()

      setCategory(cat)

      // Fetch active products in this category
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', id)
        .eq('active', true)

      setProducts(prods || [])
      setLoading(false)
    }
    load()
  }, [id])

  // Filter by search
  const filtered = products.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price_asc')  return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'discount')   return (b.discount || 0) - (a.discount || 0)
    // newest — created_at desc
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/" className={styles.breadLink}>{tr('breadcrumbHome')}</Link>
          <span className={styles.breadSep}>›</span>
          <Link href="/categories" className={styles.breadLink}>{tr('categories')}</Link>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadCurrent}>
            {loading ? '…' : catName(category) ?? tr('categories')}
          </span>
        </div>
      </div>

      {/* ── Hero banner ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            {loading ? tr('loading') : catName(category) ?? tr('breadcrumbProducts')}
          </h1>
          {!loading && (
            <span className={styles.heroCount}>
              {sorted.length} {tr('items')}
            </span>
          )}
        </div>
      </div>

      {/* ── Filter / Sort bar ── */}
      <div className={styles.filterBar}>
        {/* Search */}
        <div className={styles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder={tr('searchProducts')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className={styles.sortSelect}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Product grid ── */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛍️</span>
            <p className={styles.emptyTitle}>
              {search ? tr('noProductsFound') : tr('noProductsInCategory')}
            </p>
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch('')}>
                {tr('clear')}
              </button>
            )}
            <Link href="/categories" className={styles.backBtn}>
              ← {tr('categories')}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {sorted.map((p, i) => (
              <div key={p.id} style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
