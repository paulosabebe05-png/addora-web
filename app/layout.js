// app/layout.js  ─  Root Layout (Server Component)
// ─────────────────────────────────────────────────────────────────────────────
// Performance fixes vs original:
//
//  FIX 1 ▸ Real Supabase hostname in dns-prefetch / preconnect
//           → saves ~200–400 ms on first DB/storage request
//
//  FIX 2 ▸ Removed hardcoded <link rel="preload"> for banner
//           → page.js now injects the correct dynamic URL instead
//
//  FIX 3 ▸ next/font with display:'swap' + preload:true
//           → font never blocks render, swap shows fallback instantly
//
//  FIX 4 ▸ Security headers moved to next.config.js (handled there)
//           → layout stays clean; headers() in layout don't set HTTP headers
//
//  FIX 5 ▸ viewport export (Next.js 14+ best practice)
//           → removes "viewport" from metadata warning in build output
// ─────────────────────────────────────────────────────────────────────────────

import './globals.css'
import { Playfair_Display } from 'next/font/google'
import Providers  from './Providers'
import Header     from '../components/layout/Header'
import Footer     from '../components/layout/Footer'
import BottomNav  from '../components/layout/BottomNav'

// ── Font ──────────────────────────────────────────────────────────────────────
// Only load the weights we actually use — keeps font payload small.
const playfair = Playfair_Display({
  subsets:  ['latin'],
  weight:   ['700'],
  display:  'swap',       // FIX 3: never blocks render
  variable: '--font-playfair',
  preload:  true,
})

// ── Static metadata ───────────────────────────────────────────────────────────
// Page-level metadata (title, description, OG) lives in app/page.js so it can
// be dynamic. Layout only carries site-wide defaults.
export const metadata = {
  metadataBase: new URL('https://addora.com.et'),
  title: {
    default:  'Addora — Shop Local, Pay on Delivery',
    template: '%s | Addora',
  },
  description:
    "Ethiopia's trusted eCommerce platform. Browse thousands of products. Pay cash on delivery.",
  openGraph: {
    siteName: 'Addora',
    locale:   'en_ET',
    type:     'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', type: 'image/x-icon' },
      { url: '/icon.png?v=2',    type: 'image/png'    },
    ],
    apple:   '/apple-icon.png?v=2',
    shortcut:'/favicon.ico?v=2',
  },
  verification: {
    google: 'c3a50c68bb229ced',
  },
}

// ── Viewport (Next.js 14 + best practice — keeps it out of metadata) ─────────
export const viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#ffffff',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  // ── Read your real Supabase project ref from the env var ──────────────────
  // e.g. https://abcdefghijklmnop.supabase.co  →  abcdefghijklmnop.supabase.co
  const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .replace(/^https?:\/\//, '')   // strip protocol
    .replace(/\/$/, '')            // strip trailing slash

  return (
    <html lang="en" className={playfair.variable}>
      <head>
        {/*
          FIX 1 — real Supabase hostname, derived from your env var.
          dns-prefetch  → resolves DNS before any fetch fires
          preconnect    → opens TCP + TLS handshake early (bigger win)
          Without this the first Supabase call pays ~200–400 ms extra.
        */}
        {supabaseHost && (
          <>
            <link rel="dns-prefetch"  href={`https://${supabaseHost}`} />
            <link
              rel="preconnect"
              href={`https://${supabaseHost}`}
              crossOrigin="anonymous"
            />
          </>
        )}

        {/*
          NOTE — hero banner <link rel="preload"> is intentionally NOT here.
          app/page.js fetches the real first-banner URL server-side and
          injects the correct preload tag dynamically. A hardcoded URL here
          would either be wrong or stale after a banner change.
        */}
      </head>

      <body>
        <Providers>
          <Header />

          {/*
            min-height accounts for the fixed header (64 px) and the mobile
            bottom nav (--bottom-nav-height CSS var, 0 on desktop).
          */}
          <main
            style={{
              width:      '100%',
              minHeight:  'calc(100vh - 64px)',
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
