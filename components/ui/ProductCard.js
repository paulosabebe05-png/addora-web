'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useCart } from '../../lib/cart'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const router = useRouter()
  const [added, setAdded] = useState(false)
  const [pressed, setPressed] = useState(false)

  const discountedPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push('/auth/signin?redirect=/cart')
      return
    }
    setPressed(true)
    setTimeout(() => setPressed(false), 120)
    addItem({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image_url: product.image_url,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link href={`/products/${product.id}`} className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.noImage}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25">
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

        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className={styles.outOfStock}>Sold Out</div>
        )}
      </div>

      {/* Body */}
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>ETB {discountedPrice.toLocaleString()}</span>
          {product.discount > 0 && (
            <span className={styles.originalPrice}>ETB {product.price.toLocaleString()}</span>
          )}
        </div>

        <button
          className={`${styles.addBtn} ${added ? styles.added : ''} ${pressed ? styles.pressed : ''} ${product.stock === 0 ? styles.disabled : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {added ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              Added!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  )
}
