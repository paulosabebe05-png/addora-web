/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Removed unoptimized: true — this was causing 21.9s LCP
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
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
          // Immutable: hashed filenames never change
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/image',
        headers: [
          // Cache optimized images aggressively
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=3600' },
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
        // Pages: was max-age=0 before — now browsers cache for 60s
        // CDN/Netlify edge caches for 1hr, revalidates in background
        source: '/:path*',
        headers: [
          { key: 'Cache-Control',          value: 'public, max-age=60, s-maxage=3600, stale-while-revalidate=59' },
          { key: 'X-Content-Type-Options', value: 'nosniff'                                                      },
          { key: 'X-Frame-Options',        value: 'SAMEORIGIN'                                                   },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin'                              },
          { key: 'Permissions-Policy',     value: 'camera=(), microphone=(), geolocation=()'                     },
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
