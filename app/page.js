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

  if (category && category !== 'All') {
    query = query.or(`category.ilike.%${category}%,name.ilike.%${category}%`)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data: products } = await query

  return (
    <>
      <SplashOverlay />
      <HomeClient products={products || []} />
    </>
  )
}
