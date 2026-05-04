import { supabase } from '../../../lib/supabase'
import StorePageClient from './StorePageClient'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { data: store } = await supabase
    .from('stores')
    .select('name')
    .eq('id', params.id)
    .single()
  return { title: store ? `${store.name} — Store` : 'Store' }
}

export default async function StorePage({ params }) {
  const [{ data: store, error: sErr }, { data: products, error: pErr }] =
    await Promise.all([
      supabase
        .from('stores')
        .select('id, name, logo_url, verified, rating')
        .eq('id', params.id)
        .single(),
      supabase
        .from('products')
        .select('id, name, price, discount, image_url, stock, description, created_at')
        .eq('store_id', params.id)
        .eq('active', true)
        .order('created_at', { ascending: false }),
    ])

  if (sErr || !store) notFound()

  if (process.env.NODE_ENV === 'development') {
    console.log('[store]', store.id, store.name)
    console.log('[store products]', products?.length ?? 0)
    if (pErr) console.error('[store products error]', pErr)
  }

  return (
    <StorePageClient
      store={store}
      products={products ?? []}
    />
  )
}