import { supabase } from '../lib/supabase'
import HomeClient from './HomeClient'

export const revalidate = 60

export default async function HomePage({ searchParams }) {
  const category = searchParams?.cat || null
  const search   = searchParams?.search || null

  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  // If a category filter is passed via URL, filter by `category` column first,
  // then fall back to name-based match (HomeClient handles client-side filtering too)
  if (category && category !== 'All') {
    query = query.or(`category.ilike.%${category}%,name.ilike.%${category}%`)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products } = await query

  return <HomeClient products={products || []} />
}
