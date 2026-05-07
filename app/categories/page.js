'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import styles from './categories.module.css'

const PASTELS = [
  '#FFF3ED', '#EDF4FF', '#EDFFF5', '#FFF9ED',
  '#F5EDFF', '#EDFFFE', '#FFEDEE', '#F0FFED',
  '#FFF0FB', '#EDFFFA', '#FFFAED', '#F0EEFF',
]

const FLAT_CATEGORIES = [
  { name: "Women's Fashion", icon: '👗' },
  { name: "Men's Fashion",   icon: '👔' },
  { name: 'Electronics',     icon: '📱' },
  { name: 'Home & Lifestyle',icon: '🏠' },
  { name: 'Medicine',        icon: '💊' },
  { name: 'Sports & Outdoor',icon: '⚽' },
  { name: "Baby's & Toys",   icon: '🧸' },
  { name: 'Groceries & Pets',icon: '🛒' },
  { name: 'Health & Beauty', icon: '💄' },
]

function CategoriesContent() {
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')

  const [categories, setCategories] = useState([])
  const [products, setProducts]     = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [activeCat, setActiveCat]   = useState(null)
  const [loading, setLoading]       = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const rightRef = useRef(null)

  // Load categories + initial products
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, icon, sort_order')
          .order('sort_order', { ascending: true }),
        supabase
          .from('products')
          .select('id, name, image_url, price, discount, category_id')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(40),
      ])

      // Filter to only the 9 flat categories we want, in correct order
      const ordered = FLAT_CATEGORIES
        .map(fc => (cats || []).find(c => c.name === fc.name))
        .filter(Boolean)

      setCategories(ordered)
      setAllProducts(prods || [])
      setLoading(false)

      // Auto-select from URL ?cat=id
      if (catParam && ordered.length) {
        const found = ordered.find(c => c.id === catParam)
        if (found) selectCategory(found)
      }
    }
    load()
  }, [])

  async function selectCategory(cat) {
    setActiveCat(cat)
    setProductsLoading(true)
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

    const { data: prods } = await supabase
      .from('products')
      .select('id, name, image_url, price, discount, category_id')
      .eq('category_id', cat.id)
      .eq('active', true)
      .order('created_at', { ascending: false })

    setProducts(prods || [])
    setProductsLoading(false)
  }

  // Group products by category for default "Recommend" view
  const grouped = {}
  if (!activeCat) {
    allProducts.forEach(p => {
      const cat = categories.find(c => c.id === p.category_id)
      if (!cat) return
      if (!grouped[cat.name]) grouped[cat.name] = { cat, items: [] }
      if (grouped[cat.name].items.length < 5) grouped[cat.name].items.push(p)
    })
  }

  return (
    <div className={styles.page}>

      {/* ── Left sidebar ── */}
      <aside className={styles.sidebar}>
        <button
          className={`${styles.sideItem} ${!activeCat ? styles.sideActive : ''}`}
          onClick={() => { setActiveCat(null); setProducts([]) }}
        >
          <span className={styles.sideIcon}>🏠</span>
          <span className={styles.sideLabel}>Recommend</span>
        </button>

        {loading
          ? Array.from({ length: 9 }).map((_, i) => <div key={i} className={styles.sideSkeleton} />)
          : categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.sideItem} ${activeCat?.id === cat.id ? styles.sideActive : ''}`}
                onClick={() => selectCategory(cat)}
              >
                <span className={styles.sideIcon}>{cat.icon || '🛍️'}</span>
                <span className={styles.sideLabel}>{cat.name}</span>
              </button>
            ))
        }
      </aside>

      {/* ── Right panel ── */}
      <main className={styles.main} ref={rightRef}>

        {/* ── Recommend view ── */}
        {!activeCat && !loading && (
          Object.keys(grouped).length === 0
            ? <div className={styles.empty}><span>🛍️</span><p>No products yet</p></div>
            : Object.entries(grouped).map(([catName, { cat, items }]) => (
                <section key={catName} className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>
                      {cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>}
                      {catName}
                    </h2>
                    <button className={styles.sectionAll} onClick={() => selectCategory(cat)}>
                      All &gt;
                    </button>
                  </div>
                  <div className={styles.productGrid}>
                    {items.map((p, i) => (
                      <Link key={p.id} href={`/products/${p.id}`} className={styles.productItem}>
                        <div className={styles.productImgWrap} style={{ background: PASTELS[i % PASTELS.length] }}>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.name} className={styles.productImg} />
                            : <span className={styles.productImgPlaceholder}>{cat.icon || '🛍️'}</span>
                          }
                          {p.discount > 0 && <span className={styles.discountBadge}>-{p.discount}%</span>}
                        </div>
                        <span className={styles.productName}>{p.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
        )}

        {/* ── Selected category view ── */}
        {activeCat && (
          <>
            <div className={styles.catHeader}>
              <h2 className={styles.catTitle}>
                {activeCat.icon && <span style={{ marginRight: 6 }}>{activeCat.icon}</span>}
                {activeCat.name}
              </h2>
              <span className={styles.catCount}>
                {productsLoading ? '…' : `${products.length} items`}
              </span>
            </div>

            {productsLoading ? (
              <div className={styles.productGrid}>
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className={styles.productSkeleton} />)}
              </div>
            ) : products.length === 0 ? (
              <div className={styles.empty}>
                <span>📦</span>
                <p>No products in this category yet</p>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {products.map((p, i) => (
                  <Link key={p.id} href={`/products/${p.id}`} className={styles.productItem}>
                    <div className={styles.productImgWrap} style={{ background: PASTELS[i % PASTELS.length] }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className={styles.productImg} />
                        : <span className={styles.productImgPlaceholder}>{activeCat.icon || '🛍️'}</span>
                      }
                      {p.discount > 0 && <span className={styles.discountBadge}>-{p.discount}%</span>}
                    </div>
                    <span className={styles.productName}>{p.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {loading && (
          <div className={styles.productGrid}>
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className={styles.productSkeleton} />)}
          </div>
        )}
      </main>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>}>
      <CategoriesContent />
    </Suspense>
  )
}
