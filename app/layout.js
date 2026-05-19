// app/layout.js
import './globals.css'
import { Playfair_Display } from 'next/font/google'
import Providers from './Providers'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BottomNav from '../components/layout/BottomNav'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-playfair',
  preload: true, // ✅ ensures font is preloaded
})

export const metadata = {
  title: 'Addora — Shop Local, Pay on Delivery',
  description: "Ethiopia's trusted eCommerce platform. Browse thousands of products. Pay cash on delivery.",
  openGraph: {
    title: 'Addora — Shop Local, Pay on Delivery',
    description: 'Fast delivery across Ethiopia. No payment required upfront.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', type: 'image/x-icon' },
      { url: '/icon.png?v=2', type: 'image/png' },
    ],
    apple: '/apple-icon.png?v=2',
    shortcut: '/favicon.ico?v=2',
  },
  verification: {
    google: 'c3a50c68bb229ced',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        {/* ✅ FIX 1: DNS prefetch for Supabase — reduces connection time */}
        <link rel="dns-prefetch" href="https://your-project.supabase.co" />
        <link rel="preconnect" href="https://your-project.supabase.co" crossOrigin="anonymous" />

        {/* ✅ FIX 2: Preload your hero banner image (LCP fix — biggest impact)
            Replace the href below with your actual first banner image URL.
            You can find it in your Supabase 'banners' table, sort_order = 1 */}
        <link
          rel="preload"
          as="image"
          href="https://your-project.supabase.co/storage/v1/object/public/banners/hero-desktop.jpg"
          fetchPriority="high"
        />
      </head>
      <body>
        <Providers>
          <Header />
          <main style={{ width: '100%', minHeight: 'calc(100vh - 64px)', paddingBottom: 'var(--bottom-nav-height, 0px)' }}>
            {children}
          </main>
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
