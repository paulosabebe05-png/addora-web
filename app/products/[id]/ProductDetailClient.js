'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth'
import { useCart } from '../../../lib/cart'
import styles from './product.module.css'

export default function ProductDetailClient({ product, variants = [] }) {
  const { user } = useAuth()
  const { addItem } = useCart()
  const router = useRouter()

  // ── Image gallery ──────────────────────────────────────
  const images = [product.image_url, ...(product.extra_images || [])].filter(Boolean)
  const [activeImg, setActiveImg] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const imgRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }

  // ── Variants ───────────────────────────────────────────
  const availableVariants = variants.filter(v => v.stock > 0)
  const hasVariants = availableVariants.length > 0

  // Build unique color list preserving order
  const colors = [...new Map(availableVariants.map(v => [v.color, v])).keys()].filter(Boolean)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize]   = useState(null)

  const sizes = selectedColor
    ? [...new Set(availableVariants.filter(v => v.color === selectedColor).map(v => v.size))].filter(Boolean)
    : [...new Set(availableVariants.map(v => v.size))].filter(Boolean)

  const selectedVariant = availableVariants.find(
    v => v.color === selectedColor && v.size === selectedSize
  ) || null

  // Auto-select first available variant
  useEffect(() => {
    if (hasVariants && availableVariants.length > 0 && !selectedColor) {
      setSelectedColor(availableVariants[0].color)
      setSelectedSize(availableVariants[0].size)
    }
  }, [hasVariants])

  // ── Pricing ────────────────────────────────────────────
  const basePrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const finalPrice = selectedVariant?.price > 0 ? selectedVariant.price : basePrice

  // ── Stock ──────────────────────────────────────────────
  const stockAvailable = hasVariants
    ? (selectedVariant ? selectedVariant.stock : 0)
    : product.stock

  // ── Quantity ───────────────────────────────────────────
  const [qty, setQty] = useState(1)
  useEffect(() => setQty(1), [selectedVariant])

  // ── Cart ───────────────────────────────────────────────
  const [added, setAdded] = useState(false)
  const [addError, setAddError] = useState('')

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/auth/signin?redirect=/products/${product.id}`)
      return
    }
    setAddError('')

    if (hasVariants && !selectedVariant) {
      setAddError('Please select color and size')
      return
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: product.image_url,
      qty,
    }

    if (selectedVariant) {
      cartItem.variant_id = selectedVariant.id
      cartItem.size  = selectedVariant.size
      cartItem.color = selectedVariant.color
    }

    for (let i = 0; i < qty; i++) addItem({ ...cartItem, qty: 1 })

    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    if (!user) return
    setTimeout(() => router.push('/checkout'), 100)
  }

  const isOutOfStock = stockAvailable === 0
  const canAdd = !isOutOfStock && (!hasVariants || !!selectedVariant)

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>

        {/* ── Breadcrumb ── */}
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <Link href="/">Products</Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          <span>{product.name}</span>
        </nav>

        <div className={styles.layout}>

          {/* ════════ LEFT — Gallery ════════ */}
          <div className={styles.galleryCol}>

            {/* Vertical thumbnail strip */}
            {images.length > 1 && (
              <div className={styles.thumbStrip}>
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image with zoom */}
            <div
              className={`${styles.mainImg} ${zoomed ? styles.zooming : ''}`}
              ref={imgRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              {images[activeImg] ? (
                <>
                  <img
                    src={images[activeImg]}
                    alt={product.name}
                    className={styles.mainImgEl}
                    style={zoomed ? {
                      transform: 'scale(2)',
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    } : {}}
                  />
                  {/* Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        className={`${styles.imgArrow} ${styles.imgArrowLeft}`}
                        onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <button
                        className={`${styles.imgArrow} ${styles.imgArrowRight}`}
                        onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className={styles.noImg}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              )}

              {isOutOfStock && <div className={styles.outOfStockOverlay}>Out of Stock</div>}

              {/* Badges */}
              <div className={styles.imgBadges}>
                {product.discount > 0 && (
                  <span className={styles.discBadge}>-{product.discount}%</span>
                )}
                {images.length > 1 && (
                  <span className={styles.imgCount}>{activeImg + 1} / {images.length}</span>
                )}
              </div>
            </div>

            {/* Horizontal dots on mobile */}
            {images.length > 1 && (
              <div className={styles.dots}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`${styles.dot} ${activeImg === i ? styles.dotActive : ''}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ════════ RIGHT — Info ════════ */}
          <div className={styles.infoCol}>

            {/* Title */}
            <h1 className={styles.productName}>{product.name}</h1>

            {/* Rating row (cosmetic) */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
              </div>
              <span className={styles.ratingNum}>4.8</span>
              <span className={styles.ratingDot}>·</span>
              <span className={styles.soldCount}>120+ sold</span>
              {product.store_id && <span className={styles.ratingDot}>·</span>}
            </div>

            {/* Price block */}
            <div className={styles.priceBlock}>
              {product.discount > 0 && (
                <div className={styles.specialOffer}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Special offer
                </div>
              )}
              <div className={styles.priceRow}>
                <span className={styles.price}>ETB {finalPrice.toLocaleString()}</span>
                {product.discount > 0 && (
                  <span className={styles.originalPrice}>ETB {product.price.toLocaleString()}</span>
                )}
                {product.discount > 0 && (
                  <span className={styles.saveBadge}>
                    Save ETB {(product.price - finalPrice).toLocaleString()}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <p className={styles.priceNote}>
                  30-day lowest price before the discount. <s>ETB {product.price.toLocaleString()}</s>
                </p>
              )}
            </div>

            <div className={styles.divider} />

            {/* ── Color selector ── */}
            {colors.length > 0 && (
              <div className={styles.variantSection}>
                <div className={styles.variantLabel}>
                  Color: <strong>{selectedColor || 'Select color'}</strong>
                </div>
                <div className={styles.colorGrid}>
                  {colors.map(color => {
                    // Find first variant image for this color (use product image as fallback)
                    const variantImg = availableVariants.find(v => v.color === color)?.image_url
                      || product.image_url
                    return (
                      <button
                        key={color}
                        className={`${styles.colorCard} ${selectedColor === color ? styles.colorCardActive : ''}`}
                        onClick={() => {
                          setSelectedColor(color)
                          setSelectedSize(null)
                        }}
                        title={color}
                      >
                        {variantImg ? (
                          <img src={variantImg} alt={color} className={styles.colorCardImg} />
                        ) : (
                          <span
                            className={styles.colorSwatch}
                            style={{ background: color.toLowerCase() }}
                          />
                        )}
                        <span className={styles.colorCardLabel}>{color}</span>
                        {selectedColor === color && (
                          <span className={styles.colorTick}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Size selector ── */}
            {sizes.length > 0 && (
              <div className={styles.variantSection}>
                <div className={styles.variantLabel}>
                  Size: <strong>{selectedSize || 'Select size'}</strong>
                </div>
                <div className={styles.sizeGrid}>
                  {sizes.map(size => {
                    const inStock = availableVariants.some(
                      v => v.size === size && (selectedColor ? v.color === selectedColor : true)
                    )
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        className={`${styles.sizeBtn}
                          ${selectedSize === size ? styles.sizeBtnActive : ''}
                          ${!inStock ? styles.sizeBtnOos : ''}`}
                        onClick={() => inStock && setSelectedSize(size)}
                      >
                        {size}
                        {!inStock && <span className={styles.oosLine} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Stock status ── */}
            <div className={styles.stockRow}>
              {hasVariants && !selectedVariant ? (
                <span className={styles.stockSelect}>Select options to see availability</span>
              ) : isOutOfStock ? (
                <span className={styles.stockOut}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                  Out of Stock
                </span>
              ) : (
                <span className={styles.stockIn}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                  In Stock
                  <span className={styles.stockQty}>({stockAvailable} available)</span>
                </span>
              )}
            </div>

            <div className={styles.divider} />

            {/* ── Quantity ── */}
            {canAdd && (
              <div className={styles.qtySection}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className={styles.qtyControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >−</button>
                  <input
                    type="number"
                    className={styles.qtyInput}
                    value={qty}
                    min={1}
                    max={stockAvailable}
                    onChange={e => setQty(Math.min(stockAvailable, Math.max(1, +e.target.value || 1)))}
                  />
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.min(stockAvailable, q + 1))}
                    disabled={qty >= stockAvailable}
                  >+</button>
                </div>
                <span className={styles.maxQty}>Max {stockAvailable}</span>
              </div>
            )}

            {/* ── Error ── */}
            {addError && (
              <div className={styles.addError}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {addError}
              </div>
            )}

            {/* ── CTA buttons ── */}
            <div className={styles.ctaRow}>
              <button
                className={`${styles.buyNowBtn} ${!canAdd ? styles.btnDisabled : ''}`}
                onClick={handleBuyNow}
                disabled={!canAdd}
              >
                Buy Now
              </button>
              <button
                className={`${styles.addCartBtn} ${added ? styles.addCartAdded : ''} ${!canAdd ? styles.btnDisabled : ''}`}
                onClick={handleAddToCart}
                disabled={!canAdd}
              >
                {added ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {!user && (
              <p className={styles.loginNote}>
                <Link href={`/auth/signin?redirect=/products/${product.id}`}>Sign in</Link> to add items to your cart
              </p>
            )}

            {/* ── Trust badges ── */}
            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <div>
                  <div className={styles.trustTitle}>Return & Refund</div>
                  <div className={styles.trustSub}>Free returns on defects</div>
                </div>
              </div>
              <div className={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <div>
                  <div className={styles.trustTitle}>Fast Delivery</div>
                  <div className={styles.trustSub}>1–3 days in Addis Ababa</div>
                </div>
              </div>
              <div className={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <div>
                  <div className={styles.trustTitle}>Secure. Cash on Delivery</div>
                  <div className={styles.trustSub}>Pay only when received</div>
                </div>
              </div>
              <div className={styles.trustItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z"/></svg>
                <div>
                  <div className={styles.trustTitle}>24hr Support</div>
                  <div className={styles.trustSub}>Call or WhatsApp</div>
                </div>
              </div>
            </div>

            {/* ── Description ── */}
            {product.description && (
              <div className={styles.descSection}>
                <h3 className={styles.descTitle}>Product Details</h3>
                <p className={styles.descText}>{product.description}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}