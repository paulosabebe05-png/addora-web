'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 24

export function useSearchResults({ q, category, minPrice, maxPrice, rating, inStock, sort, page }) {
  const [products, setProducts] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [facets, setFacets]     = useState({ categories: [], priceRange: [0, 100000] })

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        // ── Main products query ──
        let qb = supabase
          .from('products')
          .select(
            'id, name, price, discount, image_url, stock, rating, sold, created_at, category_id, category:categories(id, name)',
            { count: 'exact' }
          )
          .eq('active', true)

        if (q)             qb = qb.ilike('name', `%${q}%`)
        if (category)      qb = qb.eq('category_id', category)
        if (minPrice > 0)  qb = qb.gte('price', minPrice)
        if (maxPrice < 100000) qb = qb.lte('price', maxPrice)
        if (rating > 0)    qb = qb.gte('rating', rating)
        if (inStock)       qb = qb.gt('stock', 0)

        // Sort
        switch (sort) {
          case 'price_asc':   qb = qb.order('price', { ascending: true });  break
          case 'price_desc':  qb = qb.order('price', { ascending: false }); break
          case 'rating':      qb = qb.order('rating', { ascending: false }); break
          case 'newest':      qb = qb.order('created_at', { ascending: false }); break
          default:            qb = qb.order('sold', { ascending: false }); break
        }

        qb = qb.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

        const [
          { data: products, count, error },
          { data: cats },
        ] = await Promise.all([
          qb,
          supabase.from('categories').select('id, name').order('name'),
        ])

        if (cancelled) return
        if (error) throw error

        setProducts(products || [])
        setTotal(count || 0)
        setFacets({
          categories: cats || [],
          priceRange: [0, 100000],
        })
      } catch (err) {
        console.error('Search results error:', err)
        if (!cancelled) { setProducts([]); setTotal(0) }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => { cancelled = true }
  }, [q, category, minPrice, maxPrice, rating, inStock, sort, page])

  return { products, total, loading, facets, pageSize: PAGE_SIZE }
}
