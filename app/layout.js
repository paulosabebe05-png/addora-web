// app/layout.js
import './globals.css'
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Cormorant_Garamond,
  DM_Sans,
  Playfair_Display,
} from 'next/font/google'
import Providers from './Providers'
import Header    from '../components/layout/Header'
import Footer    from '../components/layout/Footer'
import BottomNav from '../components/layout/BottomNav'

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
  variable: '--font-plus-jakarta',
  preload:  true,
})

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  display:  'swap',
  variable: '--font-space-grotesk',
  preload:  false,
})

const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  display:  'swap',
  variable: '--font-cormorant',
  preload:  false,
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  display:  'swap',
  variable: '--font-dm-sans',
  preload:  false,
})

const playfair = Playfair_Display({
  subsets:  ['latin'],
  weight:   ['700'],
  display:  'swap',
  variable: '--font-playfair',
  preload:  true,
})

export const metadata = {
  metadataBase: new URL('https://addora.com.et'),
  title: {
    default:  'Addora — Shop Local, Pay on Delivery',
    template: '%s | Addora',
  },
  description:
    "Ethiopia's trusted eCommerce platform. Browse thousands of products. Pay cash on delivery.",
  openGraph: {
    siteName:    'Addora',
    locale:      'en_ET',
    type:        'website',
    title:       'Addora — Shop Local, Pay on Delivery',
    description: 'Fast delivery across Ethiopia. No payment required upfront.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', type: 'image/x-icon' },
      { url: '/icon.png?v=2',    type: 'image/png'    },
    ],
    apple:    '/apple-icon.png?v=2',
    shortcut: '/favicon.ico?v=2',
  },
  verification: {
    google: 'c3a50c68bb229ced',
  },
}

export const viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#ffffff',
}

export default function RootLayout({ children }) {
  // API host — e.g. xyzxyz.supabase.co
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseHost = supabaseUrl
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  // Storage images are served from a separate CDN subdomain:
  // projectref.supabase.co  →  images go through  projectref.supabase.co/storage/v1/...
  // BUT on some plans they go through  cdn.supabase.co — preconnect both
  const supabaseRef     = supabaseHost.split('.')[0]           // e.g. "xyzxyz"
  const supabaseStorage = `${supabaseRef}.supabase.co`         // same host, storage path

  const fontClasses = [
    plusJakarta.variable,
    spaceGrotesk.variable,
    cormorant.variable,
    dmSans.variable,
    playfair.variable,
    plusJakarta.className,
  ].join(' ')

  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/* ── Supabase API (auth, database) ─────────────────────────── */}
        {supabaseHost && (
          <>
            <link rel="dns-prefetch"  href={`https://${supabaseHost}`} />
            <link rel="preconnect"    href={`https://${supabaseHost}`} crossOrigin="anonymous" />
          </>
        )}

        {/* ── Supabase Storage (product images — the LCP element) ───── */}
        {supabaseStorage && supabaseStorage !== supabaseHost && (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseStorage}`} />
            <link rel="preconnect"   href={`https://${supabaseStorage}`} crossOrigin="anonymous" />
          </>
        )}

        {/*
          ── LCP image preload hint ──────────────────────────────────────
          We can't preload a dynamic product image URL here because we
          don't know it at layout level. Instead we rely on:
            1. priority={true} on the first 2 ProductCards  → Next.js injects
               <link rel="preload"> for those images automatically
            2. fetchPriority="high" on the Image component
          Both are set in ProductCard.js below.
        */}
      </head>

      <body>
        <Providers>
          <Header />
          <main
            style={{
              width:         '100%',
              minHeight:     'calc(100vh - 64px)',
              paddingBottom: 'var(--bottom-nav-height, 0px)',
            }}
          >
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
