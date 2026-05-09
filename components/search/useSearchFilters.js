'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function useSearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const q        = params.get('q') || ''
  const category = params.get('category') || ''
  const brand    = params.getAll('brand')       // multi
  const minPrice = Number(params.get('min')) || 0
  const maxPrice = Number(params.get('max')) || 100000
  const rating   = Number(params.get('rating')) || 0
  const inStock  = params.get('instock') === 'true'
  const sort     = params.get('sort') || 'relevance'
  const page     = Number(params.get('page')) || 1

  const push = useCallback((updates) => {
    const next = new URLSearchParams(params.toString())
    Object.entries(updates).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        next.delete(k)
        v.forEach(val => next.append(k, val))
      } else if (v === null || v === '' || v === 0 || v === false) {
        next.delete(k)
      } else {
        next.set(k, String(v))
      }
    })
    // reset page on filter change (unless page is explicitly set)
    if (!('page' in updates)) next.set('page', '1')
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }, [params, router, pathname])

  const setQ        = (v) => push({ q: v })
  const setCategory = (v) => push({ category: v })
  const toggleBrand = (v) => {
    const next = brand.includes(v) ? brand.filter(b => b !== v) : [...brand, v]
    push({ brand: next })
  }
  const setPriceRange = (min, max) => push({ min: min || null, max: max >= 100000 ? null : max })
  const setRating   = (v) => push({ rating: v || null })
  const setInStock  = (v) => push({ instock: v || null })
  const setSort     = (v) => push({ sort: v === 'relevance' ? null : v })
  const setPage     = (v) => push({ page: v })
  const clearAll    = () => router.push(`${pathname}${q ? `?q=${encodeURIComponent(q)}` : ''}`, { scroll: false })

  const activeCount = [
    category, brand.length > 0, minPrice > 0, maxPrice < 100000, rating > 0, inStock
  ].filter(Boolean).length

  return {
    q, category, brand, minPrice, maxPrice, rating, inStock, sort, page,
    setQ, setCategory, toggleBrand, setPriceRange, setRating, setInStock, setSort, setPage, clearAll,
    activeCount,
  }
}