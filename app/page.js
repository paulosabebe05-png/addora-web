import { createClient } from '@supabase/supabase-js'
import HomeClient from './HomeClient'
import SplashOverlay from '../components/SplashOverlay'

export const revalidate = 60

export default async function HomePage({ searchParams }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const category = searchParams?.cat || null
  const search = searchParams?.search || null

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
