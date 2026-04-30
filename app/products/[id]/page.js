import { supabase } from '../../../lib/supabase'
import ProductDetailClient from './ProductDetailClient'
import { notFound } from 'next/navigation'

// CRITICAL: always fetch fresh — no stale cache
// so stock updates and new variants are always visible
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }) {
  const [{ data: product, error: pErr }, { data: variants, error: vErr }] =
    await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single(),
      supabase
        .from('product_variants')
        .select('id, product_id, color, size, stock, price, sku')
        .eq('product_id', params.id)
        .order('color', { ascending: true })
        .order('size',  { ascending: true }),
    ])

  if (pErr || !product) notFound()

  // Log in dev so you can see what comes back
  if (process.env.NODE_ENV === 'development') {
    console.log('[product]', product.id, '| stock:', product.stock)
    console.log('[variants]', variants?.length ?? 0, variants)
    if (vErr) console.error('[variants error]', vErr)
  }

  return (
    <ProductDetailClient
      product={product}
      variants={variants ?? []}
    />
  )
}