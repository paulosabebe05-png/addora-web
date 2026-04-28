import { supabase } from '../lib/supabase'
import HomeClient from './HomeClient'

export const revalidate = 60

export default async function HomePage({ searchParams }) {
  const category = searchParams?.cat || null

  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (category) query = query.ilike('name', `%${category}%`)

  const { data: products } = await query

  return <HomeClient products={products || []} />
}