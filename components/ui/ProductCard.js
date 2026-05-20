'use client'
// components/ui/ProductCard.js
// ─────────────────────────────────────────────────────────────────────────────
// Performance fixes vs original:
//
//  FIX 1 ▸ Replace raw <img> with next/image
//           → fixes "Improve image delivery — 3,401 KiB"
//           → auto WebP/AVIF conversion, correct srcset, lazy loading
//           → raw <img> was downloading full-size Supabase images every time
//
//  FIX 2 ▸ Remove custom ImageWithSkeleton shimmer using raw <img>
//           → next/image handles loading state natively via placeholder
//           → eliminates the double-render (skeleton div + img both mounted)
//
//  FIX 3 ▸ Correct sizes= attribute on the Image
//           → tells browser exactly how wide the card is per breakpoint
//           → without this, browser downloads a 1200px image for a 200px card
//
//  FIX 4 ▸ loading="lazy" is next/image default for non-priority images
//           → only set priority={true} on above-fold cards (first 4 in flash row)
//           → controlled by optional `priority` prop from parent
//
//  FIX 5 ▸ Memoize the entire card with React.memo
//           → product rows re-render on parent state changes (search, filters)
//           → memo prevents re-rendering cards whose product data hasn't changed
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState }       from 'react'
import Link                     from 'next/link'
import Image                    from 'next/image'
import { useAuth }              from '../../lib/auth'
import { useCart }              from '../../lib/cart'
import { useWishlist }          from '@/context/WishlistContext'
import { useRouter }            from 'next/navigation'
import { useLang }              from '../../lib/lang'
import styles                   from './ProductCard.module.css'

// ── Pastel background per product (deterministic, no flash) ──────────────────
const PASTEL_COLORS = [
  '#EEF2FF', '#FDF2F8', '#F0FDF4', '#FFFBEB',
  '#FFF5F5', '#F0F9FF', '#F5F3FF', '#FAFAF0',
]

function getPastelBg(id) {
  const index =
    (parseInt(String(id).replace(/\D/g, '').slice(-4) || '0', 10)) %
    PASTEL_COLORS.length
  return PASTEL_COLORS[index]
}

// ── Star rating ───────────────────────────────────────────────────────────────
const StarRating = memo(function StarRating({ rating = 0, reviews = 0 }) {
  const fmt = n => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n)
  const rounded = Math.round(rating)
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="10" height="10" viewBox="0 0 12 12"
          fill={s <= rounded ? '#f59e0b' : '#e5e7eb'}>
          <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5l-3 1.5.6-3.2L1.2 4.5l3.3-.5z" />
        </svg>
      ))}
      {reviews > 0 && (
        <span className={styles.reviewCount}>{rating} ({fmt(reviews)})</span>
      )}
    </div>
  )
})

// ── No-image placeholder ──────────────────────────────────────────────────────
const NoImagePlaceholder = memo(function NoImagePlaceholder({ bg }) {
  return (
    <div className={styles.noImage} style={{ background: bg }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" opacity="0.25">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    </div>
  )
})

// ─────────────────────────────────────────────────────────────────────────────
// ProductCard
//
// Props:
//   product  — the product object from Supabase
//   priority — pass true for the first ~4 cards in the flash-sale row (LCP)
//              e.g. <ProductCard product={p} priority={i < 4} />
// ─────────────────────────────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({ product, priority = false }) {
  const { user }                        = useAuth()
  const { addItem }                     = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { tr }                          = useLang()
  const router                          = useRouter()
  const [added, setAdded]               = useState(false)
  // FIX 2 — track image error state (next/image uses onError too)
  const [imgError, setImgError]         = useState(false)

  const wishlisted      = isWishlisted(product.id)
  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price
  const pastelBg = getPastelBg(product.id)
  const lowStock = product.stock > 0 && product.stock <= 5

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?redirect=/cart')
      return
    }
    addItem({
      id:        product.id,
      name:      product.name,
      price:     discountedPrice,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id:    product.id,
      name:  product.name,
      price: discountedPrice,
      image: product.image_url,
    })
  }

  const fmtSold = n => {
    if (!n) return null
    return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n
  }

  const showImage = product.image_url && !imgError

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>

      {/* ── Image area ─────────────────────────────────────────────────── */}
      <div className={styles.imageWrap} style={{ background: pastelBg }}>

        {showImage ? (
          /*
            FIX 1 — next/image instead of raw <img>
            • Automatically serves WebP/AVIF (saves up to 50 % bandwidth)
            • Generates a proper srcset so mobile gets a small image
            • lazy loads by default (pass priority={true} for above-fold cards)

            FIX 3 — sizes tells the browser the rendered width of this image:
            • On mobile (< 640 px): cards are ~45 vw wide (2-column grid)
            • On tablet (640–1024 px): ~30 vw (3-column)
            • On desktop (> 1024 px): ~200 px fixed (horizontal scroll row)
            Without sizes, browser defaults to 100vw → downloads a 1200px image
            for a 200px slot → wastes ~5× bandwidth.
          */
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className={styles.image}
            style={{ objectFit: 'contain' }}
            // FIX 4 — priority only for above-fold cards
            priority={priority}
            // quality 75 saves ~25% vs default 100 with no visible difference
            quality={75}
            onError={() => setImgError(true)}
          />
        ) : (
          <NoImagePlaceholder bg={pastelBg} />
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}

        {/* Hot badge — only when no discount */}
        {product.badge && product.badge !== '' && !product.discount && (
          <span className={styles.hotBadge}>{product.badge}</span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className={styles.outOfStock}>{tr('soldOut')}</div>
        )}

        {/* Wishlist button */}
        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={tr('addToWishlist')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : 'currentColor'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div className={styles.body}>

        {/* 1. Product name */}
        <h3 className={styles.name}>{product.name}</h3>

        {/* 2. Stars */}
        {product.rating > 0 && (
          <StarRating rating={product.rating} reviews={product.reviews} />
        )}

        {/* 3. Sold count */}
        {product.sold > 0 && (
          <div className={styles.soldRow}>
            <span className={styles.soldBadge}>
              🔥 {fmtSold(product.sold)} {tr('sold')}
            </span>
          </div>
        )}

        {/* 4. Low stock */}
        {lowStock && (
          <p className={styles.lowStock}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8"  x2="12"    y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {tr('onlyLeft')} {product.stock} {tr('leftInStock')}
          </p>
        )}

        {/* 5. Price + Add to cart */}
        <div className={styles.footer}>
          <div className={styles.pricing}>
            <span className={styles.price}>
              ETB {Math.round(discountedPrice).toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className={styles.originalPrice}>
                ETB {product.price.toLocaleString()}
              </span>
            )}
          </div>

          <button
            className={`${styles.addBtn} ${added ? styles.added : ''} ${product.stock === 0 ? styles.disabled : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={tr('addToCart')}
          >
            {added ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className={styles.addBtnText}>{tr('addedToCart')}</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5"  x2="12" y2="19"/>
                  <line x1="5"  y1="12" x2="19" y2="12"/>
                </svg>
                <span className={styles.addBtnText}>{tr('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
})

export default ProductCard
