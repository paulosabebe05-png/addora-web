import { supabase } from '../../../lib/supabase'
import ProductDetailClient from './ProductDetailClient'
import { notFound } from 'next/navigation'

export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', params.id)
    .single()
  return { title: product ? product.name : 'Product' }
}

export default async function ProductPage({ params }) {
  const { data: product, error: pErr } = await supabase
    .from('products')
    .select('id, name, price, discount, image_url, stock, description, created_at, store_id, category_id, rating, sold_count, extra_images')
    .eq('id', params.id)
    .single()

  if (pErr || !product) notFound()

  // Fetch store info if product has a store_id
  let store = null
  if (product.store_id) {
    const { data: storeData } = await supabase
      .from('stores')
      .select('id, name, logo_url, verified, rating')
      .eq('id', product.store_id)
      .single()
    store = storeData ?? null
  }

  // Fetch variants
  const { data: variants } = await supabase
    .from('product_variants')
    .select('id, color, color_hex, size, size_type, price, stock, image_url')
    .eq('product_id', params.id)
    .order('created_at', { ascending: true })

  if (process.env.NODE_ENV === 'development') {
    console.log('[product]', product.id, product.name)
    console.log('[store]', store?.id, store?.name)
    console.log('[variants]', variants?.length ?? 0)
  }

  return (
    <ProductDetailClient
      product={product}
      store={store}
      variants={variants ?? []}
    />
  )
}
