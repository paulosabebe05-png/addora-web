// app/sitemap.ts
// Place this file at: app/sitemap.ts
// Next.js will automatically serve it at https://addora.com.et/sitemap.xml

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap() {
  const baseUrl = 'https://addora.com.et'

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/flash-deals`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/best-sellers`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/todays-deals`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // ── Category pages ────────────────────────────────────────────────────────
  const categories = [
    'electronics', 'computers', 'watches', 'camera',
    'headphones', 'gaming', 'fashion', 'beauty',
    'home', 'sports', 'kids', 'medicine',
  ]

  const categoryPages = categories.map((cat) => ({
    url: `${baseUrl}/?cat=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ── Product pages (fetched from Supabase) ─────────────────────────────────
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('is_active', true)   // only show active/published products

  const productPages = (products ?? []).map((p: { id: string; updated_at?: string }) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}