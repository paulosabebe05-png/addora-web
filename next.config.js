// next.config.js
// ─────────────────────────────────────────────────────────────────────────────
// All performance + security settings for addora.com.et
// ─────────────────────────────────────────────────────────────────────────────

/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── Image optimisation ─────────────────────────────────────────────────────
  images: {
    // Allow images from Supabase storage
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
    // avif saves ~50 % vs jpg; webp ~30 % — browser picks best supported format
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 30 days (reduces Vercel image-optimization cost)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Breakpoints used to generate srcset for banner / hero images
    // 390 = iPhone SE, 640 = small tablet, 768 = tablet, 1024+ = desktop
    deviceSizes: [390, 640, 768, 1024, 1280, 1600],
    // FIX: Sizes tuned to actual rendered widths of product cards:
    //   • 176px  = desktop card (~220px slot × 0.8 for contain padding)
    //   • 220px  = desktop card full slot
    //   • 300px  = tablet 3-col card (~30vw of 1024px)
    //   • 384px  = mobile 2-col card (~45vw of 768px, retina × 2)
    // Without these, Next.js would skip straight from 128px → 256px → 384px
    // and pick a size that's too small (blurry) or too large (wasteful).
    imageSizes: [64, 128, 176, 220, 300, 384],
  },

  // ── HTTP response headers ──────────────────────────────────────────────────
  // Fixes PageSpeed "Use efficient cache lifetimes" + security headers audit
  async headers() {
    return [
      {
        // Next.js static assets (JS chunks, CSS, fonts) — immutable, 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Public folder images — 30 days + stale-while-revalidate
        source: '/images/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Public folder fonts — 1 year immutable
        source: '/fonts/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // HTML pages — short browser cache, 1 h CDN cache, stale-while-revalidate
        // This means pages feel instant on repeat visits without serving stale data
        source: '/:path*',
        headers: [
          {
            key:   'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=59',
          },
          // Security headers (improves PageSpeed Best Practices score)
          { key: 'X-Content-Type-Options',    value: 'nosniff'                         },
          { key: 'X-Frame-Options',           value: 'SAMEORIGIN'                      },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // ── Tree-shaking for large icon / animation packages ──────────────────────
  // Reduces unused JS (PageSpeed "Reduce unused JavaScript" audit)
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
  },

  // ── Misc ───────────────────────────────────────────────────────────────────
  compress:        true,   // gzip/brotli at the edge
  poweredByHeader: false,  // don't expose "X-Powered-By: Next.js"

  // ── Bundle analyser (run: ANALYZE=true npm run build) ─────────────────────
  // Uncomment if you install @next/bundle-analyzer
  // ...(process.env.ANALYZE === 'true'
  //   ? require('@next/bundle-analyzer')({ enabled: true })({})
  //   : {}),
}

module.exports = nextConfig
