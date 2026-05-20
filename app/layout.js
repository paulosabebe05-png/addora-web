// app/layout.js
// ─────────────────────────────────────────────────────────────────────────────
// RENDER-BLOCKING FIX:
//
// The original globals.css had:
//   @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans...')
//
// That @import is the #1 cause of the blank screen / slow FCP:
//   Browser hits your page
//   → starts parsing CSS
//   → finds @import → STOPS rendering
//   → opens new connection to fonts.googleapis.com (~100–300 ms DNS+TCP+TLS)
//   → downloads the CSS file
//   → that CSS file triggers MORE requests to fonts.gstatic.com
//   → only THEN does rendering resume
//   Total extra cost on slow 4G: ~1,500–2,000 ms of blank screen
//
// next/font/google fix:
//   → Downloads font files at BUILD TIME
//   → Self-hosts them on your own domain (no Google Fonts requests at runtime)
//   → Inlines the @font-face CSS directly into <head> (no extra HTTP request)
//   → Adds font-display: swap automatically
//   → Zero render-blocking font requests at runtime
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Font definitions ──────────────────────────────────────────────────────────
// Each font is downloaded once at build time and served from your own domain.
// CSS variables are injected into <html> so any component can use them.

// Primary UI font (body text, buttons, labels)
const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
  variable: '--font-plus-jakarta',
  preload:  true,   // preloaded because it's the body font — used everywhere
})

// Secondary / heading accent
const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  display:  'swap',
  variable: '--font-space-grotesk',
  preload:  false,  // only used in specific headings — don't block initial load
})

// Editorial / luxury accent (product page, promo banners)
const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  style:    ['normal', 'italic'],
  display:  'swap',
  variable: '--font-cormorant',
  preload:  false,
})

// Clean sans for secondary UI text
const dmSans = DM_Sans({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  display:  'swap',
  variable: '--font-dm-sans',
  preload:  false,
})

// Display font for the logo / hero headlines
const playfair = Playfair_Display({
  subsets:  ['latin'],
  weight:   ['700'],
  display:  'swap',
  variable: '--font-playfair',
  preload:  true,   // used in the logo — visible above fold
})

// ── Metadata ──────────────────────────────────────────────────────────────────
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

// ── Viewport ──────────────────────────────────────────────────────────────────
export const viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#ffffff',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }) {
  // Derive real Supabase host from env var for preconnect hints
  const supabaseHost = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')

  // Combine all font class names + CSS variables into one string
  const fontClasses = [
    plusJakarta.variable,
    spaceGrotesk.variable,
    cormorant.variable,
    dmSans.variable,
    playfair.variable,
    plusJakarta.className,  // applies Plus Jakarta as the active body font
  ].join(' ')

  return (
    <html lang="en" className={fontClasses}>
      <head>
        {/*
          Preconnect to Supabase — saves DNS+TCP+TLS cost on first DB/storage
          request. Derived from your actual env var, not hardcoded.
        */}
        {supabaseHost && (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
            <link
              rel="preconnect"
              href={`https://${supabaseHost}`}
              crossOrigin="anonymous"
            />
          </>
        )}
        {/*
          Hero banner preload is NOT here — app/page.js injects the correct
          dynamic URL server-side after fetching the real first banner.
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
