// app/layout.js — Server Component (no 'use client')
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
    { url: '/favicon.ico', type: 'image/x-icon' },
    { url: '/icon.png', type: 'image/png', sizes: '32x32' },
  ],
  apple: '/apple-icon.png',
  shortcut: '/favicon.ico',
},
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={playfair.variable}>
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
