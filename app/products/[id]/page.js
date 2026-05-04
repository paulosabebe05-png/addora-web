import { supabase } from '../../../lib/supabase'
import ProductDetailClient from './ProductDetailClient'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const [{ data: product, error: pErr }, { data: variants, error: vErr }] =
    await Promise.all([
      supabase.from('products').select('*').eq('id', params.id).single(),
      supabase.from('product_variants')
        .select('id, product_id, color, size, stock, price, sku')
        .eq('product_id', params.id)
        .order('color', { ascending: true })
        .order('size',  { ascending: true }),
    ])

  if (pErr || !product) notFound()

  // Fetch the store if product has a store_id
  let store = null
  if (product.store_id) {
    const { data: storeData } = await supabase
      .from('stores')
      .select('id, name, logo_url, verified, rating')
      .eq('id', product.store_id)
      .single()
    store = storeData ?? null
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[product]', product.id, '| stock:', product.stock)
    console.log('[variants]', variants?.length ?? 0, variants)
    console.log('[store]', store)
    if (vErr) console.error('[variants error]', vErr)
  }

  return (
    <ProductDetailClient
      product={product}
      variants={variants ?? []}
      store={store}
    />
  )
}
