import { headers }            from 'next/headers'
import { createServerClient } from '../lib/supabase'
import HomeClient             from './HomeClient'

const PRODUCT_FIELDS =
  'id, name, price, image_url, discount, section, rating, sold, created_at, category_id, stock, active'

export const revalidate = 60

export const metadata = {
  title:       'Addora — Shop Local, Pay on Delivery',
  description: "Ethiopia's trusted eCommerce platform. Browse thousands of products. Pay cash on delivery.",
  openGraph: {
    title:       'Addora — Shop Local, Pay on Delivery',
    description: 'Fast delivery across Ethiopia. No payment required upfront.',
  },
}

function detectDevice(userAgent = '') {
  return /mobile|android|iphone|ipad|ipod/i.test(userAgent) ? 'mobile' : 'desktop'
}

function buildPreloadProps(rawUrl, { isBanner }) {
  const encoded = encodeURIComponent(rawUrl)
  const q       = isBanner ? 75 : 80

  if (isBanner) {
    const widths = [640, 828, 1080, 1200, 1920]
    return {
      href:        `/_next/image?url=${encoded}&w=1920&q=${q}`,
      imageSrcSet: widths.map(w => `/_next/image?url=${encoded}&w=${w}&q=${q} ${w}w`).join(', '),
      imageSizes:  '(max-width: 768px) 100vw, 75vw',
    }
  }
  const widths = [384, 640, 750]
  return {
    href:        `/_next/image?url=${encoded}&w=384&q=${q}`,
    imageSrcSet: widths.map(w => `/_next/image?url=${encoded}&w=${w}&q=${q} ${w}w`).join(', '),
    imageSizes:  '(max-width: 390px) 44vw, (max-width: 768px) 30vw, 220px',
  }
}

export default async function HomePage({ searchParams }) {
  const supabase    = createServerClient()
  const headersList = headers()
  const ua          = headersList.get('user-agent') ?? ''
  const device      = detectDevice(ua)

  const category = searchParams?.cat    ?? null
  const search   = searchParams?.search ?? null

  // Fetch everything in parallel — products + BOTH banner sets at once
  const [productsResult, desktopBannersResult, mobileBannersResult] =
    await Promise.all([
      (() => {
        let q = supabase
          .from('products')
          .select(PRODUCT_FIELDS)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(60)
        if (category && category !== 'All') {
          q = q.or(`category_id.ilike.%${category}%,name.ilike.%${category}%`)
        }
        if (search) {
          q = q.ilike('name', `%${search}%`)
        }
        return q
      })(),

      // Fetch desktop banners server-side — eliminates the useEffect fetch
      supabase
        .from('banners')
        .select('id, image_url, target_url, title, sort_order, device')
        .eq('active', true)
        .in('device', ['desktop', 'all'])
        .order('sort_order', { ascending: true }),

      // Fetch mobile banners server-side — eliminates the second useEffect fetch
      supabase
        .from('banners')
        .select('id, image_url, target_url, title, sort_order, device')
        .eq('active', true)
        .in('device', ['mobile', 'all'])
        .order('sort_order', { ascending: true }),
    ])

  const products       = productsResult.data      ?? []
  const desktopBanners = desktopBannersResult.data ?? []
  const mobileBanners  = mobileBannersResult.data  ?? []

  // Pick LCP image based on detected device
  const lcpBanners   = device === 'mobile' ? mobileBanners : desktopBanners
  const heroImageUrl = lcpBanners[0]?.image_url ?? null
  const preloadProps = heroImageUrl
    ? buildPreloadProps(heroImageUrl, { isBanner: true })
    : null

  return (
    <>
      {preloadProps && (
        <link
          rel="preload"
          as="image"
          href={preloadProps.href}
          fetchpriority="high"
          imageSrcSet={preloadProps.imageSrcSet}
          imageSizes={preloadProps.imageSizes}
        />
      )}

      <HomeClient
        products={products}
        initialDevice={device}
        heroPreloadUrl={heroImageUrl}
        // Pass both banner sets as props — HomeClient no longer needs
        // useBanners() hooks, eliminating 2 useEffect Supabase fetches
        initialDesktopBanners={desktopBanners}
        initialMobileBanners={mobileBanners}
      />
    </>
  )
}
