import { Suspense } from 'react'
import SearchPage from '../../components/search/SearchPage'

export const metadata = {
  title: 'Search – Addora',
  description: 'Search products on Addora',
}

export default function Page() {
  return (
    // Suspense required because SearchPage uses useSearchParams()
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F7F7F8' }} />}>
      <SearchPage />
    </Suspense>
  )
}