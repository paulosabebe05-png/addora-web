'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 24

export function useSearchResults({ q, category, brand, minPrice, maxPrice, rating, inStock, sort, page }) {
  const [products, setProducts]   = useState([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [facets, setFacets]       = useState({ categories: [], brands: [], priceRange: [0, 100000] })

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const run = async () => {
      try {
        // ── Main products query ──
        let qb = supabase
          .from('products')
          .select(`
            id, name, price, original_price, image_url,
            rating, rating_count, in_stock, created_at,
            category:categories(id, name, slug),
            brand:brands(id, name, slug)
          `, { count: 'exact' })

        if (q)        qb = qb.ilike('name', `%${q}%`)
        if (category) qb = qb.eq('categories.slug', category)
        if (brand.length > 0) qb = qb.in('brands.slug', brand)
        if (minPrice > 0)     qb = qb.gte('price', minPrice)
        if (maxPrice < 100000) qb = qb.lte('price', maxPrice)
        if (rating > 0)       qb = qb.gte('rating', rating)
        if (inStock)          qb = qb.eq('in_stock', true)

        // Sort
        switch (sort) {
          case 'price_asc':   qb = qb.order('price', { ascending: true });  break
          case 'price_desc':  qb = qb.order('price', { ascending: false }); break
          case 'rating':      qb = qb.order('rating', { ascending: false }); break
          case 'newest':      qb = qb.order('created_at', { ascending: false }); break
          default:            qb = qb.order('rating_count', { ascending: false }); break
        }

        qb = qb.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

        // ── Facets (categories + brands) — run in parallel ──
        let facetBase = supabase.from('products').select('category_id, brand_id, price')
        if (q) facetBase = facetBase.ilike('name', `%${q}%`)

        const [
          { data: products, count, error },
          { data: cats },
          { data: brands: brandRows },
        ] = await Promise.all([
          qb,
          supabase.from('categories').select('id, name, slug').order('name'),
          supabase.from('brands').select('id, name, slug').order('name'),
        ])

        if (cancelled) return
        if (error) throw error

        setProducts(products || [])
        setTotal(count || 0)
        setFacets({
          categories: cats || [],
          brands: brandRows || [],
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
  }, [q, category, JSON.stringify(brand), minPrice, maxPrice, rating, inStock, sort, page])

  return { products, total, loading, facets, pageSize: PAGE_SIZE }
}