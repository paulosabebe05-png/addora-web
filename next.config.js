// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    // Netlify doesn't support Next.js image optimization without extra setup
    // unoptimized: true loads images directly from Supabase — fixes "too small" issue
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control',          value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=59' },
          { key: 'X-Content-Type-Options', value: 'nosniff'                         },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN'                      },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },

  compress:        true,
  poweredByHeader: false,
}

module.exports = nextConfig
