'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import styles from './categories.module.css'

const PASTELS = [
  '#FFF3ED', '#EDF4FF', '#EDFFF5', '#FFF9ED',
  '#F5EDFF', '#EDFFFE', '#FFEDEE', '#F0FFED',
  '#FFF0FB', '#EDFFFA', '#FFFAED', '#F0EEFF',
]

// Renders a category's icon: prefers image_url, falls back to emoji icon
function CatImage({ cat, className, placeholderClassName }) {
  if (cat?.image_url) {
    return <img src={cat.image_url} alt={cat.name} className={className} />
  }
  return <span className={placeholderClassName}>{cat?.icon || '🛍️'}</span>
}

function CategoriesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const catParam = searchParams.get('cat')

  const [categories, setCategories]           = useState([])
  const [subcategories, setSubcategories]     = useState([])
  const [products, setProducts]               = useState([])
  const [allProducts, setAllProducts]         = useState([])
  const [activeCat, setActiveCat]             = useState(null)
  const [activeSubcat, setActiveSubcat]       = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const rightRef = useRef(null)

  // Load parent categories + initial products
  useEffect(() => {
    async function load() {
      const [{ data: cats }, { data: prods }] = await Promise.all([
        supabase
          .from('categories')
          .select('id, name, icon, image_url, sort_order')   // ← added image_url
          .is('parent_id', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('products')
          .select('id, name, image_url, price, discount, category_id')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(40),
      ])
      setCategories(cats || [])
      setAllProducts(prods || [])
      setLoading(false)

      // If URL has ?cat=id, auto-select that category
      if (catParam && cats) {
        const found = cats.find(c => c.id === catParam)
        if (found) selectCategory(found, prods || [])
      }
    }
    load()
  }, [])

  // Load subcategories when a parent category is selected
  async function selectCategory(cat, currentAllProducts = allProducts) {
    setActiveCat(cat)
    setActiveSubcat(null)
    setProductsLoading(true)
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

    // Fetch subcategories for this parent (include image_url)
    const { data: subs } = await supabase
      .from('categories')
      .select('id, name, icon, image_url')                   // ← added image_url
      .eq('parent_id', cat.id)
      .order('sort_order', { ascending: true })

    setSubcategories(subs || [])

    // Fetch products for this category
    const { data: prods } = await supabase
      .from('products')
      .select('id, name, image_url, price, discount, category_id')
      .eq('category_id', cat.id)
      .eq('active', true)
      .order('created_at', { ascending: false })

    setProducts(prods || [])
    setProductsLoading(false)
  }

  // Load products for subcategory
  async function selectSubcategory(sub) {
    setActiveSubcat(sub)
    setProductsLoading(true)
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

    const { data: prods } = await supabase
      .from('products')
      .select('id, name, image_url, price, discount, category_id')
      .eq('category_id', sub.id)
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
      const key = cat ? cat.name : null
      if (!key) return
      if (!grouped[key]) grouped[key] = { cat, items: [] }
      if (grouped[key].items.length < 5) grouped[key].items.push(p)
    })
  }

  const displayProducts = products

  return (
    <div className={styles.page}>

      {/* ── Left sidebar — parent categories ── */}
      <aside className={styles.sidebar}>
        <button
          className={`${styles.sideItem} ${!activeCat ? styles.sideActive : ''}`}
          onClick={() => { setActiveCat(null); setActiveSubcat(null); setProducts([]); setSubcategories([]) }}
        >
          <span className={styles.sideIcon}>🏠</span>
          <span className={styles.sideLabel}>Recommend</span>
        </button>

        {loading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className={styles.sideSkeleton} />)
          : categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.sideItem} ${activeCat?.id === cat.id ? styles.sideActive : ''}`}
                onClick={() => selectCategory(cat)}
              >
                {/* Show category image_url in sidebar if available, else emoji */}
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} className={styles.sideIcon} style={{ borderRadius: 6, objectFit: 'cover', width: 28, height: 28 }} />
                  : <span className={styles.sideIcon}>{cat.icon || '🛍️'}</span>
                }
                <span className={styles.sideLabel}>{cat.name}</span>
              </button>
            ))
        }
      </aside>

      {/* ── Right panel ── */}
      <main className={styles.main} ref={rightRef}>

        {/* ── Recommend / default grouped view ── */}
        {!activeCat && !loading && (
          Object.keys(grouped).length === 0
            ? <div className={styles.empty}><span>🛍️</span><p>No products yet</p></div>
            : Object.entries(grouped).map(([catName, { cat, items }]) => (
                <section key={catName} className={styles.section}>
                  <div className={styles.sectionHead}>
                    <h2 className={styles.sectionTitle}>
                      {/* Prefer image_url for section heading, else emoji icon */}
                      {cat.image_url
                        ? <img src={cat.image_url} alt={cat.name} style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover', marginRight: 6, verticalAlign: 'middle' }} />
                        : cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>
                      }
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
                            : <CatImage cat={cat} className={styles.productImg} placeholderClassName={styles.productImgPlaceholder} />
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
            {/* Category header — show image_url banner if available */}
            <div className={styles.catHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {activeCat.image_url && (
                  <img
                    src={activeCat.image_url}
                    alt={activeCat.name}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div>
                  <h2 className={styles.catTitle}>
                    {!activeCat.image_url && activeCat.icon && (
                      <span style={{ marginRight: 6 }}>{activeCat.icon}</span>
                    )}
                    {activeCat.name}
                  </h2>
                  {activeSubcat && (
                    <span className={styles.subcatBreadcrumb}>
                      → {activeSubcat.name}
                    </span>
                  )}
                </div>
              </div>
              <span className={styles.catCount}>
                {productsLoading ? '…' : `${displayProducts.length} items`}
              </span>
            </div>

            {/* Subcategory pills — only rendered when activeCat is set and subs exist */}
            {subcategories.length > 0 && (
              <div className={styles.subcatRow}>
                <button
                  className={`${styles.subcatPill} ${!activeSubcat ? styles.subcatPillActive : ''}`}
                  onClick={() => { setActiveSubcat(null); selectCategory(activeCat) }}
                >
                  All
                </button>
                {subcategories.map(sub => (
                  <button
                    key={sub.id}
                    className={`${styles.subcatPill} ${activeSubcat?.id === sub.id ? styles.subcatPillActive : ''}`}
                    onClick={() => selectSubcategory(sub)}
                  >
                    {/* Show subcategory image in pill if available */}
                    {sub.image_url
                      ? <img src={sub.image_url} alt={sub.name} style={{ width: 18, height: 18, borderRadius: 3, objectFit: 'cover', marginRight: 4, verticalAlign: 'middle' }} />
                      : sub.icon && <span>{sub.icon} </span>
                    }
                    {sub.name}
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {productsLoading ? (
              <div className={styles.productGrid}>
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className={styles.productSkeleton} />)}
              </div>
            ) : displayProducts.length === 0 ? (
              <div className={styles.empty}>
                <span>📦</span>
                <p>No products in this category yet</p>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {displayProducts.map((p, i) => (
                  <Link key={p.id} href={`/products/${p.id}`} className={styles.productItem}>
                    <div className={styles.productImgWrap} style={{ background: PASTELS[i % PASTELS.length] }}>
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className={styles.productImg} />
                        : <CatImage cat={activeSubcat || activeCat} className={styles.productImg} placeholderClassName={styles.productImgPlaceholder} />
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
