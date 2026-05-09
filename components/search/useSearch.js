'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const RECENT_KEY = 'addora_recent_searches'
const MAX_RECENT = 8

function loadRecent() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
  } catch {
    return []
  }
}

function persistRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {}
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ products: [], categories: [], brands: [] })
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const debounceRef = useRef(null)

  // Load recent searches on mount
  useEffect(() => {
    setRecent(loadRecent())
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!query.trim()) {
      setResults({ products: [], categories: [], brands: [] })
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const q = query.trim()

        const [
          { data: products },
          { data: categories },
          { data: brands },
        ] = await Promise.all([
          supabase
            .from('products')
            .select('id, name, slug, price, image_url, brand:brands(name)')
            .ilike('name', `%${q}%`)
            .eq('is_active', true)
            .limit(6),
          supabase
            .from('categories')
            .select('id, name, slug')
            .ilike('name', `%${q}%`)
            .limit(4),
          supabase
            .from('brands')
            .select('id, name, slug')
            .ilike('name', `%${q}%`)
            .limit(4),
        ])

        setResults({
          products: products || [],
          categories: categories || [],
          brands: brands || [],
        })
      } catch (err) {
        console.error('Search error:', err)
        setResults({ products: [], categories: [], brands: [] })
      } finally {
        setLoading(false)
      }
    }, 280)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const saveRecent = useCallback((term) => {
    if (!term?.trim()) return
    setRecent(prev => {
      const filtered = prev.filter(r => r.toLowerCase() !== term.toLowerCase())
      const updated = [term, ...filtered].slice(0, MAX_RECENT)
      persistRecent(updated)
      return updated
    })
  }, [])

  const removeRecent = useCallback((term) => {
    setRecent(prev => {
      const updated = prev.filter(r => r !== term)
      persistRecent(updated)
      return updated
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecent([])
    persistRecent([])
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    recent,
    saveRecent,
    removeRecent,
    clearRecent,
  }
}