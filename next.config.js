/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ── FIX: Allow your Supabase storage domain ──────────────────────────────
    // Replace with your actual Supabase project ref
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

    // ── FIX: Image format — avif saves ~50% vs jpg, webp ~30% ───────────────
    formats: ['image/avif', 'image/webp'],

    // ── FIX: Cache images for 30 days (reduces repeat requests) ─────────────
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days in seconds

    // ── FIX: Device sizes for srcset (banner images) ─────────────────────────
    deviceSizes: [390, 768, 1024, 1280, 1600],

    // ── FIX: Image sizes for fill/fixed images ───────────────────────────────
    imageSizes: [64, 128, 256, 384],
  },

  // ── FIX: HTTP cache headers — fixes "Use efficient cache lifetimes" ─────────
  async headers() {
    return [
      {
        // Cache static assets (JS, CSS, fonts, images) for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache public folder assets for 30 days
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Cache fonts for 1 year
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // HTML pages — short cache + revalidate
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=59',
          },
          // Security headers (also improve Best Practices score)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  // ── FIX: Remove unused JS — tree-shake lodash etc. ──────────────────────────
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // ── FIX: Enable compression ──────────────────────────────────────────────────
  compress: true,

  // ── FIX: Powered by header (minor security + response size) ─────────────────
  poweredByHeader: false,
}

module.exports = nextConfig
