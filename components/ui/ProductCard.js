'use client'

import { memo, useState }        from 'react'
import Link                      from 'next/link'
import Image                     from 'next/image'
import { useAuth }               from '../../lib/auth'
import { useCart }               from '../../lib/cart'
import { useWishlist }           from '@/context/WishlistContext'
import { useRouter }             from 'next/navigation'
import { useLang }               from '../../lib/lang'
import styles                    from './ProductCard.module.css'

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

const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// FIX (crop): default anchor point for object-fit: cover.
// Most product photos here are portrait shots of kids (more headroom
// below the face than above it). Centering at 50% clips heads at the
// top and/or feet at the bottom once the image is forced into the
// square/near-square card. Anchoring closer to the top keeps faces
// and headline garment details in frame. Tune the Y value against a
// sample of real product photos — 12–20% works well for portrait
// kid photography; go higher (30–40%) if your catalog is mostly
// flat-lay or centered product shots instead.
const DEFAULT_IMAGE_POSITION = 'center 15%'

const StarRating = memo(function StarRating({ rating = 0, reviews = 0 }) {
  const fmt     = n => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n)
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

const ProductCard = memo(function ProductCard({ product, priority = false }) {
  const { user }                         = useAuth()
  const { addItem }                      = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { tr }                           = useLang()
  const router                           = useRouter()
  const [added, setAdded]                = useState(false)
  const [imgError, setImgError]          = useState(false)

  const wishlisted      = isWishlisted(product.id)
  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price
  const pastelBg = getPastelBg(product.id)
  const lowStock = product.stock > 0 && product.stock <= 5

  // FIX (crop): allow a per-product override (e.g. product.image_position
  // = "center 30%") for sellers whose photos are framed differently —
  // flat-lays, close-ups, landscape shots, etc. Falls back to the
  // catalog-wide default above when the product doesn't specify one.
  // This is optional — safe to delete this line and just use
  // DEFAULT_IMAGE_POSITION directly if you don't want a per-product field.
  const imagePosition = product.image_position || DEFAULT_IMAGE_POSITION

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

      <div className={styles.imageWrap} style={{ background: pastelBg }}>
        {showImage ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            /*
              FIX: was (max-width: 480px) → Next.js picked w=640 on mobile
              Now  (max-width: 390px)  → Next.js picks w=384 on mobile

              Math: 390px × 44vw = 171px × 2x DPR = 342px → rounds up to w=384 ✓
              Before: 480px breakpoint never triggered on 390px phone → fell
                      through to 768px rule → picked w=640 (256px wasted)
            */
            sizes="(max-width: 390px) 44vw, (max-width: 768px) 30vw, (max-width: 1280px) 22vw, 220px"
            className={styles.image}
            // FIX (crop): objectPosition added. object-fit: cover alone
            // defaults to centering the crop at 50/50, which clips heads
            // and feet on portrait product photos. See DEFAULT_IMAGE_POSITION
            // comment above for tuning notes.
            style={{ objectFit: 'cover', objectPosition: imagePosition }}
            priority={priority}
            quality={80}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            // fetchPriority: high on LCP cards, low on below-fold cards
            fetchPriority={priority ? 'high' : 'low'}
            // loading: undefined on priority (Next.js handles it), lazy on rest
            loading={priority ? undefined : 'lazy'}
            /*
              decoding:
                "sync"  on LCP cards  → browser paints immediately, no queue wait
                "async" on rest       → decode off main thread, avoids jank
            */
            decoding={priority ? 'sync' : 'async'}
            onError={() => setImgError(true)}
          />
        ) : (
          <NoImagePlaceholder bg={pastelBg} />
        )}

        {product.discount > 0 && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}

        {product.badge && product.badge !== '' && !product.discount && (
          <span className={styles.hotBadge}>{product.badge}</span>
        )}

        {product.stock === 0 && (
          <div className={styles.outOfStock}>{tr('soldOut')}</div>
        )}

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

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        {product.rating > 0 && (
          <StarRating rating={product.rating} reviews={product.reviews} />
        )}

        {product.sold > 0 && (
          <div className={styles.soldRow}>
            <span className={styles.soldBadge}>
              🔥 {fmtSold(product.sold)} {tr('sold')}
            </span>
          </div>
        )}

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
