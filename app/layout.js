import './globals.css'
import { AuthProvider } from '../lib/auth'
import { CartProvider } from '../lib/cart'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import BottomNav from '../components/layout/BottomNav'

export const metadata = {
  title: 'Addora — Shop Local, Pay on Delivery',
  description: 'Ethiopia\'s trusted eCommerce platform. Browse thousands of products. Pay cash on delivery.',
  openGraph: {
    title: 'Addora — Shop Local, Pay on Delivery',
    description: 'Fast delivery across Ethiopia. No payment required upfront.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <Header />
            <main style={{ width: '100%', minHeight: 'calc(100vh - 64px)', paddingBottom: 'var(--bottom-nav-height, 0px)' }}>
              {children}
            </main>
            <Footer />
            {/* Bottom nav — renders only on mobile via CSS */}
            <BottomNav />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
