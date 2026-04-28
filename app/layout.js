import './globals.css'
import { AuthProvider } from '../lib/auth'
import { CartProvider } from '../lib/cart'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'

export const metadata = {
  title: 'Addora — Shop Local, Pay on Delivery',
  description: 'Ethiopia\'s trusted eCommerce platform. Browse kids clothing and more. Pay cash on delivery.',
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
            <main style={{ width: '100%', minHeight: 'calc(100vh - 64px)' }}>{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}