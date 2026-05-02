'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './ProductCard.module.css'

// Pastel backgrounds matching the mockup's colored card backgrounds
const PASTEL_COLORS = [
  '#EEF2FF', // soft blue-purple (watch card)
  '#FDF2F8', // soft pink (dress card)
  '#F0FDF4', // soft green (gel card)
  '#FFFBEB', // soft yellow (outfit card)
  '#FFF5F5', // soft red
  '#F0F9FF', // soft sky
  '#F5F3FF', // soft violet
  '#FAFAF0', // soft lime
]

// Pick a consistent color per product based on its id
function getPastelBg(id) {
  const index = (parseInt(String(id).replace(/\D/g, '').slice(-4) || '0', 10)) % PASTEL_COLORS.length
  return PASTEL_COLORS[index]
}

function StarRating({ rating = 0, reviews = 0 }) {
  const fmt = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="11" height="11" viewBox="0 0 12 12"
          fill={s <= Math.round(rating) ? '#f59e0b' : '#e5e7eb'}>
          <path d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.2L6 8.5l-3 1.5.6-3.2L1.2 4.5l3.3-.5z" />
        </svg>
      ))}
      {reviews > 0 && (
        <span className={styles.reviewCount}>{rating} ({fmt(reviews)})</span>
      )}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const pastelBg = getPastelBg(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (!user) {
      router.push('/auth/signin?redirect=/cart')
      return
    }
    addItem({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted((w) => !w)
  }

  const fmtSold = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : n

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      {/* Image wrap — pastel bg injected inline for mobile */}
      <div className={styles.imageWrap} style={{ background: pastelBg }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.noImage} style={{ background: pastelBg }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className={styles.discountBadge}>-{product.discount}%</span>
        )}

        {/* Hot / flash badge */}
        {product.badge && product.badge !== '' && (
          <span className={styles.hotBadge}>{product.badge}</span>
        )}

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className={styles.outOfStock}>Sold Out</div>
        )}

        {/* Wishlist heart */}
        <button
          className={`${styles.wishBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label="Add to wishlist"
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={wishlisted ? '#ef4444' : 'none'}
            stroke={wishlisted ? '#ef4444' : 'currentColor'}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Stars */}
        {(product.rating > 0 || product.reviews > 0) && (
          <StarRating rating={product.rating} reviews={product.reviews} />
        )}

        {/* Sold count */}
        {product.sold > 0 && (
          <p className={styles.soldCount}>{fmtSold(product.sold)} sold</p>
        )}

        <div className={styles.footer}>
          <div className={styles.pricing}>
            <span className={styles.price}>ETB {Math.round(discountedPrice).toLocaleString()}</span>
            {product.discount > 0 && (
              <span className={styles.originalPrice}>ETB {product.price.toLocaleString()}</span>
            )}
          </div>

          <button
            className={`${styles.addBtn} ${added ? styles.added : ''} ${product.stock === 0 ? styles.disabled : ''}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            {added ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span className={styles.addBtnText}>Added</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                <span className={styles.addBtnText}>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Link>
  )
}
