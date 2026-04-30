'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth'
import { useCart } from '../../../lib/cart'
import styles from './product.module.css'

export default function ProductDetailClient({ product, variants = [] }) {
  const { user }    = useAuth()
  const { addItem } = useCart()
  const router      = useRouter()

  /* ─────────────────────────────────────────────────
     IMAGES
  ───────────────────────────────────────────────── */
  const images = [product.image_url, ...(product.extra_images ?? [])].filter(Boolean)
  const [activeImg, setActiveImg] = useState(0)
  const [zoomed,    setZoomed]    = useState(false)
  const [zoomPos,   setZoomPos]   = useState({ x: 50, y: 50 })
  const imgRef = useRef(null)

  const onMouseMove = (e) => {
    if (!imgRef.current) return
    const r = imgRef.current.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    })
  }

  /* ─────────────────────────────────────────────────
     VARIANT LOGIC
     FIX 1: hasVariants = variants array is non-empty
     FIX 2: show ALL sizes (not only in-stock) so user
             can see which are OOS (greyed out / struck)
     FIX 3: auto-select first IN-STOCK variant on load
  ───────────────────────────────────────────────── */
  const hasVariants = variants.length > 0

  // All unique colors that exist in the variant table
  const allColors = hasVariants
    ? [...new Set(variants.map(v => v.color).filter(Boolean))]
    : []

  // All unique sizes that exist
  const allSizes = hasVariants
    ? [...new Set(variants.map(v => v.size).filter(Boolean))]
    : []

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize,  setSelectedSize]  = useState(null)

  // Sizes available for the chosen color (ALL — OOS shown greyed)
  const sizesForColor = selectedColor
    ? [...new Set(variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean))]
    : allSizes

  // The exact variant row for the current selection
  const selectedVariant = hasVariants && selectedColor && selectedSize
    ? variants.find(v => v.color === selectedColor && v.size === selectedSize) ?? null
    : null

  // FIX 3: auto-select on mount — pick first variant that has stock > 0
  useEffect(() => {
    if (!hasVariants) return
    const first = variants.find(v => v.stock > 0)
    if (first) {
      setSelectedColor(first.color)
      setSelectedSize(first.size)
    } else {
      // all OOS — still show the first one selected so UI isn't blank
      setSelectedColor(variants[0]?.color ?? null)
      setSelectedSize(variants[0]?.size  ?? null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  // Reset size when color changes
  const handleColorChange = (color) => {
    setSelectedColor(color)
    setSelectedSize(null)
  }

  /* ─────────────────────────────────────────────────
     PRICING
     FIX: variant price overrides base only when > 0
  ───────────────────────────────────────────────── */
  const basePrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : Number(product.price)

  const finalPrice = (selectedVariant && Number(selectedVariant.price) > 0)
    ? Number(selectedVariant.price)
    : basePrice

  /* ─────────────────────────────────────────────────
     STOCK
     FIX: if no variants in table → use products.stock
          if variants exist → use selectedVariant.stock
          if variants exist but nothing selected → 0
  ───────────────────────────────────────────────── */
  const stockAvailable = hasVariants
    ? (selectedVariant ? Number(selectedVariant.stock) : 0)
    : Number(product.stock ?? 0)

  const isOutOfStock = stockAvailable <= 0

  // Can only add when: in stock AND (no variants OR variant selected)
  const canAdd = !isOutOfStock && (!hasVariants || !!selectedVariant)

  /* ─────────────────────────────────────────────────
     QUANTITY
  ───────────────────────────────────────────────── */
  const [qty, setQty] = useState(1)
  // Reset qty when variant changes
  useEffect(() => { setQty(1) }, [selectedVariant])

  /* ─────────────────────────────────────────────────
     CART
  ───────────────────────────────────────────────── */
  const [added,    setAdded]    = useState(false)
  const [addError, setAddError] = useState('')

  const doAdd = () => {
    if (!user) {
      router.push(`/auth/signin?redirect=/products/${product.id}`)
      return false
    }
    setAddError('')

    // FIX: block only when variants EXIST but nothing selected
    if (hasVariants && !selectedVariant) {
      setAddError(
        !selectedColor ? 'Please select a color' :
        !selectedSize  ? 'Please select a size'  :
        'Selected combination is out of stock'
      )
      return false
    }

    if (isOutOfStock) {
      setAddError('This item is out of stock')
      return false
    }

    const cartItem = {
      id:        product.id,
      name:      product.name,
      price:     finalPrice,
      image_url: product.image_url,
      qty:       1,
      ...(selectedVariant ? {
        variant_id: selectedVariant.id,
        size:        selectedVariant.size,
        color:       selectedVariant.color,
      } : {}),
    }

    for (let i = 0; i < qty; i++) addItem({ ...cartItem })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
    return true
  }

  const handleAddToCart = () => doAdd()
  const handleBuyNow    = () => { if (doAdd()) setTimeout(() => router.push('/checkout'), 120) }

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      <div className={styles.inner}>

        {/* Breadcrumb */}
        <nav className={styles.bc}>
          <Link href="/">Home</Link>
          <span>›</span>
          <Link href="/#products">Products</Link>
          <span>›</span>
          <span className={styles.bcCurrent}>{product.name}</span>
        </nav>

        <div className={styles.layout}>

          {/* ══════════════════════════════
              LEFT — GALLERY
          ══════════════════════════════ */}
          <div className={styles.galleryWrap}>

            {/* Vertical thumbnail strip — only when >1 image */}
            {images.length > 1 && (
              <div className={styles.thumbCol}>
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbOn : ''}`}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div
              className={`${styles.mainBox} ${zoomed ? styles.mainBoxZoom : ''}`}
              ref={imgRef}
              onMouseMove={onMouseMove}
              onMouseEnter={() => images.length > 0 && setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className={styles.mainImg}
                  style={zoomed ? {
                    transform: 'scale(2.2)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  } : undefined}
                />
              ) : (
                <div className={styles.noImg}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.18">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>No image</span>
                </div>
              )}

              {/* Discount badge */}
              {product.discount > 0 && (
                <span className={styles.discBadge}>-{product.discount}%</span>
              )}

              {/* OOS overlay */}
              {isOutOfStock && !hasVariants && (
                <div className={styles.oosOverlay}>Out of Stock</div>
              )}

              {/* Counter */}
              {images.length > 1 && (
                <span className={styles.imgCount}>{activeImg + 1}/{images.length}</span>
              )}

              {/* Arrows */}
              {images.length > 1 && <>
                <button className={`${styles.arrow} ${styles.arrowL}`}
                  onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}>‹</button>
                <button className={`${styles.arrow} ${styles.arrowR}`}
                  onClick={() => setActiveImg(i => (i + 1) % images.length)}>›</button>
              </>}

              {/* Zoom hint */}
              {images.length > 0 && !zoomed && (
                <span className={styles.zoomHint}>🔍 Hover to zoom</span>
              )}
            </div>
          </div>

          {/* ══════════════════════════════
              RIGHT — INFO PANEL
          ══════════════════════════════ */}
          <div className={styles.infoPanel}>

            {/* Title */}
            <h1 className={styles.title}>{product.name}</h1>

            {/* Rating (cosmetic) */}
            <div className={styles.metaRow}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingVal}>4.8</span>
              <span className={styles.dot}>·</span>
              <span className={styles.sold}>120+ sold</span>
            </div>

            {/* Price */}
            <div className={styles.priceBox}>
              {product.discount > 0 && (
                <span className={styles.offerTag}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                  Special offer
                </span>
              )}
              <div className={styles.priceRow}>
                <span className={styles.priceFinal}>ETB {Number(finalPrice).toLocaleString()}</span>
                {product.discount > 0 && <>
                  <span className={styles.priceOrig}>ETB {Number(product.price).toLocaleString()}</span>
                  <span className={styles.savePill}>
                    Save ETB {(Number(product.price) - Number(finalPrice)).toLocaleString()}
                  </span>
                </>}
              </div>
              {product.discount > 0 && (
                <p className={styles.priceHint}>
                  30-day lowest price before discount.&nbsp;
                  <s>ETB {Number(product.price).toLocaleString()}</s>
                </p>
              )}
            </div>

            <div className={styles.hr} />

            {/* ── COLOR selector (only if variants exist with colors) ── */}
            {hasVariants && allColors.length > 0 && (
              <div className={styles.varSection}>
                <p className={styles.varLabel}>
                  Color:&nbsp;
                  <strong>{selectedColor ?? <em className={styles.pick}>Select a color</em>}</strong>
                </p>
                <div className={styles.colorRow}>
                  {allColors.map(color => {
                    // Is any variant of this color in stock?
                    const colorHasStock = variants.some(v => v.color === color && v.stock > 0)
                    // Get an image for this color from variants if available
                    const colorImg = variants.find(v => v.color === color && v.image_url)?.image_url
                      ?? product.image_url

                    return (
                      <button
                        key={color}
                        title={color}
                        onClick={() => handleColorChange(color)}
                        className={`${styles.colorCard}
                          ${selectedColor === color ? styles.colorOn : ''}
                          ${!colorHasStock ? styles.colorOos : ''}`}
                      >
                        {colorImg
                          ? <img src={colorImg} alt={color} className={styles.colorImg} />
                          : <span className={styles.colorSwatch}
                              style={{ background: color.toLowerCase().replace(/\s/g,'') }} />
                        }
                        <span className={styles.colorLabel}>{color}</span>
                        {selectedColor === color && (
                          <span className={styles.colorTick}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── SIZE selector (only if variants exist with sizes) ── */}
            {hasVariants && allSizes.length > 0 && (
              <div className={styles.varSection}>
                <p className={styles.varLabel}>
                  Size:&nbsp;
                  <strong>{selectedSize ?? <em className={styles.pick}>Select a size</em>}</strong>
                </p>
                <div className={styles.sizeRow}>
                  {sizesForColor.map(size => {
                    // Is THIS specific color+size in stock?
                    const sizeVariant = variants.find(
                      v => v.size === size &&
                           (selectedColor ? v.color === selectedColor : true)
                    )
                    const inStock = sizeVariant && sizeVariant.stock > 0

                    return (
                      <button
                        key={size}
                        onClick={() => inStock && setSelectedSize(size)}
                        className={`${styles.sizeBtn}
                          ${selectedSize === size ? styles.sizeOn  : ''}
                          ${!inStock             ? styles.sizeOos : ''}`}
                      >
                        {size}
                        {!inStock && <span className={styles.oosDash} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Stock status ── */}
            <div className={styles.stockRow}>
              {/* Case 1: has variants, nothing fully selected yet */}
              {hasVariants && !(selectedColor && selectedSize) && (
                <span className={styles.stockNeutral}>Select options to see availability</span>
              )}
              {/* Case 2: has variants, combination selected */}
              {hasVariants && selectedColor && selectedSize && (
                selectedVariant
                  ? selectedVariant.stock > 0
                    ? <span className={styles.stockYes}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        In Stock <em>({selectedVariant.stock} available)</em>
                      </span>
                    : <span className={styles.stockNo}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Out of Stock
                      </span>
                  : <span className={styles.stockNo}>Combination not available</span>
              )}
              {/* Case 3: no variants — use products.stock directly */}
              {!hasVariants && (
                stockAvailable > 0
                  ? <span className={styles.stockYes}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      In Stock <em>({stockAvailable} available)</em>
                    </span>
                  : <span className={styles.stockNo}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      Out of Stock
                    </span>
              )}
            </div>

            <div className={styles.hr} />

            {/* ── Quantity ── */}
            {canAdd && (
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className={styles.qtyBox}>
                  <button className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    disabled={qty <= 1}>−</button>
                  <input
                    type="number"
                    className={styles.qtyInput}
                    value={qty}
                    min={1}
                    max={stockAvailable}
                    onChange={e =>
                      setQty(Math.min(stockAvailable, Math.max(1, parseInt(e.target.value) || 1)))
                    }
                  />
                  <button className={styles.qtyBtn}
                    onClick={() => setQty(q => Math.min(stockAvailable, q + 1))}
                    disabled={qty >= stockAvailable}>+</button>
                </div>
                <span className={styles.maxLabel}>Max {stockAvailable}</span>
              </div>
            )}

            {/* Error message */}
            {addError && (
              <div className={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {addError}
              </div>
            )}

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button
                className={`${styles.btnBuy} ${!canAdd ? styles.btnOff : ''}`}
                onClick={handleBuyNow}
                disabled={!canAdd}
              >
                Buy Now
              </button>
              <button
                className={`${styles.btnCart} ${added ? styles.btnAdded : ''} ${!canAdd ? styles.btnOff : ''}`}
                onClick={handleAddToCart}
                disabled={!canAdd}
              >
                {added ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <p className={styles.loginHint}>
                <Link href={`/auth/signin?redirect=/products/${product.id}`}>Sign in</Link> to add items to your cart
              </p>
            )}

            {/* Trust badges */}
            <div className={styles.trustGrid}>
              {[
                { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Return & Refund',     sub: 'Free returns on defects' },
                { path: 'M1 3h15v13H1zM16 8h5v8h-5M3 16v4M7 16v4',      title: 'Fast Delivery',        sub: '1–3 days in Addis Ababa' },
                { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Cash on Delivery',    sub: 'Pay only when received' },
                { path: 'M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.8 19.8 0 01-3.07-8.68A2 2 0 012 .82h3a2 2 0 012 1.72 12.8 12.8 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91A16 16 0 0015.1 17.9l1.27-1.27a2 2 0 012.11-.45 12.8 12.8 0 002.81.7A2 2 0 0122 18.92z',
                  title: '24hr Support', sub: 'Call or WhatsApp' },
              ].map((t, i) => (
                <div key={i} className={styles.trustItem}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="1.7">
                    <path d={t.path}/>
                  </svg>
                  <div>
                    <p className={styles.trustTitle}>{t.title}</p>
                    <p className={styles.trustSub}>{t.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <>
                <div className={styles.hr} />
                <div className={styles.descBox}>
                  <h3 className={styles.descTitle}>Product Details</h3>
                  <p className={styles.descText}>{product.description}</p>
                </div>
              </>
            )}

          </div>{/* /infoPanel */}
        </div>{/* /layout */}
      </div>{/* /inner */}
    </div>
  )
}