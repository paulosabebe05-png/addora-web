'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import styles from './categories.module.css'

// Icon map — fallback icons per category name keyword
function getCategoryIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('phone') || n.includes('mobile'))    return '📱'
  if (n.includes('computer') || n.includes('laptop')) return '💻'
  if (n.includes('fashion') || n.includes('cloth') || n.includes('dress')) return '👗'
  if (n.includes('shoe') || n.includes('footwear'))   return '👟'
  if (n.includes('beauty') || n.includes('cosmetic')) return '💄'
  if (n.includes('food') || n.includes('grocery'))    return '🛒'
  if (n.includes('sport') || n.includes('fitness'))   return '⚽'
  if (n.includes('home') || n.includes('furniture'))  return '🛋️'
  if (n.includes('book') || n.includes('stationery')) return '📚'
  if (n.includes('toy') || n.includes('kids'))        return '🧸'
  if (n.includes('watch'))                            return '⌚'
  if (n.includes('jewel') || n.includes('accessory')) return '💍'
  if (n.includes('health') || n.includes('medical'))  return '💊'
  if (n.includes('automotive') || n.includes('car'))  return '🚗'
  if (n.includes('garden') || n.includes('outdoor'))  return '🌿'
  if (n.includes('pet'))                              return '🐾'
  if (n.includes('music') || n.includes('audio'))     return '🎵'
  if (n.includes('camera') || n.includes('photo'))    return '📷'
  if (n.includes('bag') || n.includes('luggage'))     return '👜'
  if (n.includes('tool') || n.includes('hardware'))   return '🔧'
  return '🛍️'
}

// Gradient palette — cycles through for visual variety
const GRADIENTS = [
  ['#FFF3ED', '#FFE0D0'],
  ['#EDF4FF', '#D0E4FF'],
  ['#EDFFF5', '#C8F5DC'],
  ['#FFF9ED', '#FFE9B8'],
  ['#F5EDFF', '#E0C8FF'],
  ['#EDFFFE', '#C0F0EE'],
  ['#FFEDEE', '#FFD0D4'],
  ['#F0FFED', '#D0F5C8'],
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data) setCategories(data)
      setLoading(false)
    }
    fetchCategories()
  }, [])

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      {/* ── Hero header ── */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Shop by Category</h1>
        <p className={styles.heroSub}>Find exactly what you're looking for</p>

        {/* Search */}
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
          )}
        </div>
      </div>

      {/* ── Count ── */}
      {!loading && (
        <div className={styles.countRow}>
          <span className={styles.countText}>
            {filtered.length} {filtered.length === 1 ? 'category' : 'categories'}
            {search && ` for "${search}"`}
          </span>
        </div>
      )}

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className={styles.skeleton} />
          ))
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No categories found</p>
          </div>
        ) : (
          filtered.map((cat, i) => {
            const [bg, accent] = GRADIENTS[i % GRADIENTS.length]
            return (
              <button
                key={cat.id}
                className={styles.card}
                style={{ background: `linear-gradient(135deg, ${bg}, ${accent})` }}
                onClick={() => router.push(`/?category=${encodeURIComponent(cat.name)}`)}
              >
                <span className={styles.cardIcon}>{getCategoryIcon(cat.name)}</span>
                <span className={styles.cardName}>{cat.name}</span>
                <svg className={styles.cardArrow} width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="#E75525" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}