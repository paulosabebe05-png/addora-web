'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import styles from './categories.module.css'

function getCategoryIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('phone') || n.includes('mobile'))     return '📱'
  if (n.includes('computer') || n.includes('laptop'))  return '💻'
  if (n.includes('fashion') || n.includes('cloth') || n.includes('dress')) return '👗'
  if (n.includes('shoe') || n.includes('footwear'))    return '👟'
  if (n.includes('beauty') || n.includes('cosmetic'))  return '💄'
  if (n.includes('food') || n.includes('grocery'))     return '🛒'
  if (n.includes('sport') || n.includes('fitness'))    return '⚽'
  if (n.includes('home') || n.includes('furniture') || n.includes('appliance')) return '🛋️'
  if (n.includes('book') || n.includes('stationery'))  return '📚'
  if (n.includes('toy') || n.includes('kids'))         return '🧸'
  if (n.includes('watch'))                             return '⌚'
  if (n.includes('jewel') || n.includes('accessory'))  return '💍'
  if (n.includes('health') || n.includes('medical'))   return '💊'
  if (n.includes('automotive') || n.includes('car'))   return '🚗'
  if (n.includes('garden') || n.includes('outdoor'))   return '🌿'
  if (n.includes('pet'))                               return '🐾'
  if (n.includes('music') || n.includes('audio'))      return '🎵'
  if (n.includes('camera') || n.includes('photo'))     return '📷'
  if (n.includes('bag') || n.includes('luggage'))      return '👜'
  if (n.includes('tool') || n.includes('hardware'))    return '🔧'
  if (n.includes('wedding'))                           return '💒'
  if (n.includes('hair'))                              return '💇'
  if (n.includes('electronic'))                        return '⚡'
  return '🛍️'
}

const PASTELS = [
  '#FFF3ED', '#EDF4FF', '#EDFFF5', '#FFF9ED',
  '#F5EDFF', '#EDFFFE', '#FFEDEE', '#F0FFED',
  '#FFF0FB', '#EDFFFA', '#FFFAED', '#F0EEFF',
]

export default function CategoriesPage() {
  const [categories, setCategories]           = useState([])
  const [products, setProducts]               = useState([])
  const [allProducts, setAllProducts]         = useState([])
  const [activeCat, setActiveCat]             = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const rightRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })

      const { data: prods } = await supabase
        .from('products')
        .select('id, name, image_url, price, discount, category_id')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(30)

      setCategories(cats || [])
      setAllProducts(prods || [])
      setLoading(false)
    }
    load()
  }, [])

  async function selectCategory(cat) {
    setActiveCat(cat)
    setProductsLoading(true)
    rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    const { data } = await supabase
      .from('products')
      .select('id, name, image_url, price, discount, category_id')
      .eq('category_id', cat.id)
      .eq('active', true)
      .order('created_at', { ascending: false })
    setProducts(data || [])
    setProductsLoading(false)
  }

  // Group for default "Recommend" view
  const grouped = {}
  if (!activeCat) {
    allProducts.forEach(p => {
      const cat = categories.find(c => c.id === p.category_id)
      const key = cat ? cat.name : 'Other'
      if (!grouped[key]) grouped[key] = []
      if (grouped[key].length < 6) grouped[key].push(p)
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
          <span className={styles.sideLabel}>Recommend</span>
        </button>

        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.sideSkeleton} />
            ))
          : categories.map(cat => (
              <button
                key={cat.id}
                className={`${styles.sideItem} ${activeCat?.id === cat.id ? styles.sideActive : ''}`}
                onClick={() => selectCategory(cat)}
              >
                <span className={styles.sideLabel}>{cat.name}</span>
                {activeCat?.id === cat.id && <span className={styles.sideIndicator} />}
              </button>
            ))
        }
      </aside>

      {/* ── Right panel ── */}
      <main className={styles.main} ref={rightRef}>

        {/* Default grouped view */}
        {!activeCat && !loading && (
          Object.keys(grouped).length === 0
            ? <div className={styles.empty}><span>🛍️</span><p>No products yet</p></div>
            : Object.entries(grouped).map(([catName, prods]) => {
                const cat = categories.find(c => c.name === catName)
                return (
                  <section key={catName} className={styles.section}>
                    <div className={styles.sectionHead}>
                      <h2 className={styles.sectionTitle}>{catName}</h2>
                      {cat && (
                        <button
                          className={styles.sectionAll}
                          onClick={() => selectCategory(cat)}
                        >
                          All &gt;
                        </button>
                      )}
                    </div>
                    <div className={styles.productGrid}>
                      {prods.map((p, i) => (
                        <Link key={p.id} href={`/products/${p.id}`} className={styles.productItem}>
                          <div className={styles.productImgWrap} style={{ background: PASTELS[i % PASTELS.length] }}>
                            {p.image_url
                              ? <img src={p.image_url} alt={p.name} className={styles.productImg} />
                              : <span className={styles.productImgPlaceholder}>{getCategoryIcon(catName)}</span>
                            }
                            {p.discount > 0 && <span className={styles.discountBadge}>-{p.discount}%</span>}
                          </div>
                          <span className={styles.productName}>{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  </section>
                )
              })
        )}

        {/* Selected category view */}
        {activeCat && (
          <>
            <div className={styles.catHeader}>
              <h2 className={styles.catTitle}>{activeCat.name}</h2>
              <span className={styles.catCount}>
                {productsLoading ? '…' : `${products.length} items`}
              </span>
            </div>

            {productsLoading ? (
              <div className={styles.productGrid}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={styles.productSkeleton} />
                ))}
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
                        : <span className={styles.productImgPlaceholder}>{getCategoryIcon(activeCat.name)}</span>
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
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={styles.productSkeleton} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
