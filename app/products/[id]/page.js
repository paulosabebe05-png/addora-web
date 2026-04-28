import { supabase } from '../../../lib/supabase'
import ProductDetailClient from './ProductDetailClient'
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }) {
  // Fetch product + its variants in parallel
  const [{ data: product }, { data: variants }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', params.id)
      .order('color')
      .order('size'),
  ])

  if (!product) notFound()

  return <ProductDetailClient product={product} variants={variants || []} />
}