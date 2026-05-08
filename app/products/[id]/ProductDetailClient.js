'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../lib/auth'
import { useCart } from '../../../lib/cart'
import { supabase } from '../../../lib/supabase'
import styles from './product.module.css'

/* ─────────────────────────────────────────────────
   COLOR SWATCH  –  rectangular chip using the
   existing .colorSwatch CSS class (66×44px)
   Only shown when variant has no image_url
───────────────────────────────────────────────── */
function ColorSwatch({ colorHex, colorName }) {
  const background = colorHex
    || CSS_COLOR_MAP[colorName?.toLowerCase?.() ?? '']
    || '#cccccc'

  return (
    <span
      className={styles.colorSwatch}
      style={{ background }}
      title={colorName}
      aria-label={colorName}
    />
  )
}

// Fallback map for common color names → hex (when color_hex not set in DB)
const CSS_COLOR_MAP = {
  black: '#1a1a1a',
  white: '#f5f0e8',
  red: '#c0392b',
  blue: '#2563eb',
  navy: '#1e2a4a',
  'navy blue': '#1B2A5E',
  green: '#16a34a',
  yellow: '#f59e0b',
  orange: '#ea580c',
  pink: '#ec4899',
  purple: '#7c3aed',
  brown: '#92400e',
  gray: '#6b7280',
  grey: '#6b7280',
  beige: '#e8dcc8',
  cream: '#faf7f2',
  gold: '#c9a84c',
  silver: '#9ca3af',
  'light blue': '#93c5fd',
  'dark blue': '#1e3a5f',
  'rose gold': 'linear-gradient(135deg,#f4a0b0,#c9a84c)',
  'space gray': '#4a4a4a',
  'midnight black': '#0d0d0d',
  clear: 'linear-gradient(135deg,rgba(255,255,255,.4),rgba(200,210,255,.15))',
  transparent: 'linear-gradient(135deg,rgba(255,255,255,.4),rgba(200,210,255,.15))',
}

/* ─────────────────────────────────────────────────
   SIZE TYPE LABELS
   Maps size_type → human-readable label for UI
───────────────────────────────────────────────── */
const SIZE_TYPE_LABEL = {
  clothing:  'Size',
  footwear:  'EU Size',
  age:       'Age / Size',
  phone:     'Device Model',
  universal: 'Size',
}

export default function ProductDetailClient({ product, variants = [], store = null }) {
  const { user }    = useAuth()
  const { addItem } = useCart()
  const router      = useRouter()

  /* ─────────────────────────────────────────────────
     IMAGES
     When a color is selected its variant image_url
     is injected at index 0 so the main photo
     switches instantly — like AliExpress.
  ───────────────────────────────────────────────── */
  const baseImages = [product.image_url, ...(product.extra_images ?? [])].filter(Boolean)
  const [activeImg,    setActiveImg]    = useState(0)
  const [zoomed,       setZoomed]       = useState(false)
  const [zoomPos,      setZoomPos]      = useState({ x: 50, y: 50 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImg,  setLightboxImg]  = useState(0)
  const imgRef = useRef(null)

  // Build color → image_url map from variants
  const colorImgMap = {}
  variants.forEach(v => {
    if (v.color && v.image_url && !colorImgMap[v.color]) {
      colorImgMap[v.color] = v.image_url
    }
  })

  const onMouseMove = (e) => {
    if (!imgRef.current) return
    const r = imgRef.current.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    })
  }

  const handleImgClick = () => {
    if (images.length === 0) return
    setLightboxImg(activeImg)
    setLightboxOpen(true)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const fn = (e) => { if (e.key === 'Escape') setLightboxOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [lightboxOpen])

  /* ─────────────────────────────────────────────────
     VARIANT LOGIC
  ───────────────────────────────────────────────── */
  const hasVariants = variants.length > 0
  const allColors   = hasVariants ? [...new Set(variants.map(v => v.color).filter(Boolean))] : []
  const allSizes    = hasVariants ? [...new Set(variants.map(v => v.size).filter(Boolean))]  : []

  // Detect size type from variants (use first variant that has one)
  const detectedSizeType = variants.find(v => v.size_type)?.size_type ?? null
  const sizeLabel = SIZE_TYPE_LABEL[detectedSizeType] ?? 'Size'

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize,  setSelectedSize]  = useState(null)

  const sizesForColor = selectedColor
    ? [...new Set(variants.filter(v => v.color === selectedColor).map(v => v.size).filter(Boolean))]
    : allSizes

  const selectedVariant = hasVariants && selectedColor && selectedSize
    ? variants.find(v => v.color === selectedColor && v.size === selectedSize) ?? null
    : null

  // If product has no color variants, allow size-only selection
  const colorless = hasVariants && allColors.length === 0 && allSizes.length > 0
  const selectedVariantColorless = colorless && selectedSize
    ? variants.find(v => v.size === selectedSize) ?? null
    : null
  const activeVariant = selectedVariant ?? selectedVariantColorless ?? null

  useEffect(() => {
    if (!hasVariants) return
    const first = variants.find(v => v.stock > 0)
    if (first) { setSelectedColor(first.color ?? null); setSelectedSize(first.size ?? null) }
    else { setSelectedColor(variants[0]?.color ?? null); setSelectedSize(variants[0]?.size ?? null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleColorChange = (color) => { setSelectedColor(color); setSelectedSize(null) }

  // Build color → hex lookup from variant data
  const colorHexMap = {}
  variants.forEach(v => {
    if (v.color && !colorHexMap[v.color]) {
      colorHexMap[v.color] = v.color_hex ?? null
    }
  })

  // Dynamic image list: selected color's image goes first, then base images (deduped)
  const variantImg = selectedColor ? (colorImgMap[selectedColor] ?? null) : null
  const images = variantImg
    ? [variantImg, ...baseImages.filter(u => u !== variantImg)]
    : baseImages

  // Reset to first image when color changes
  useEffect(() => { setActiveImg(0) }, [selectedColor])

  /* ─────────────────────────────────────────────────
     PRICING
  ───────────────────────────────────────────────── */
  const basePrice  = product.discount > 0 ? product.price * (1 - product.discount / 100) : Number(product.price)
  const finalPrice = (activeVariant && Number(activeVariant.price) > 0) ? Number(activeVariant.price) : basePrice

  /* ─────────────────────────────────────────────────
     STOCK
  ───────────────────────────────────────────────── */
  const stockAvailable = hasVariants ? (activeVariant ? Number(activeVariant.stock) : 0) : Number(product.stock ?? 0)
  const isOutOfStock   = stockAvailable <= 0
  const needsColor     = hasVariants && allColors.length > 0 && !selectedColor
  const needsSize      = hasVariants && allSizes.length > 0 && !selectedSize
  const canAdd         = !isOutOfStock && (!hasVariants || !!activeVariant)

  /* ─────────────────────────────────────────────────
     QUANTITY
  ───────────────────────────────────────────────── */
  const [qty, setQty] = useState(1)
  useEffect(() => { setQty(1) }, [activeVariant])

  /* ─────────────────────────────────────────────────
     CART  +  STOCK DECREMENT
  ───────────────────────────────────────────────── */
  const [added,    setAdded]    = useState(false)
  const [addError, setAddError] = useState('')

  const doAdd = async () => {
    if (!user) { router.push(`/auth/signin?redirect=/products/${product.id}`); return false }
    setAddError('')

    if (hasVariants && !activeVariant) {
      setAddError(
        needsColor ? 'Please select a color' :
        needsSize  ? `Please select a ${sizeLabel.toLowerCase()}` :
                     'Selected combination is out of stock'
      )
      return false
    }
    if (isOutOfStock) { setAddError('This item is out of stock'); return false }

    // ── Optimistic stock decrement via Supabase RPC ──
    try {
      if (activeVariant) {
        const { data, error } = await supabase.rpc('decrement_variant_stock', {
          p_variant_id: activeVariant.id,
          p_quantity:   qty,
        })
        if (error || !data?.ok) {
          setAddError(data?.error === 'insufficient_stock'
            ? `Only ${data?.available ?? 0} left in stock`
            : 'Could not reserve stock. Please try again.')
          return false
        }
      } else {
        // No-variant product
        const { data, error } = await supabase.rpc('decrement_product_stock', {
          p_product_id: product.id,
          p_quantity:   qty,
        })
        if (error || !data?.ok) {
          setAddError(data?.error === 'insufficient_stock'
            ? `Only ${data?.available ?? 0} left in stock`
            : 'Could not reserve stock. Please try again.')
          return false
        }
      }
    } catch {
      // If RPC not yet deployed, fall through gracefully
      if (process.env.NODE_ENV === 'development') {
        console.warn('[stock] RPC not available, skipping decrement')
      }
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: product.image_url,
      qty: 1,
      ...(activeVariant ? {
        variant_id: activeVariant.id,
        size:  activeVariant.size,
        color: activeVariant.color,
        color_hex: activeVariant.color_hex ?? colorHexMap[activeVariant.color] ?? null,
      } : {}),
    }
    for (let i = 0; i < qty; i++) addItem({ ...cartItem })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
    return true
  }

  const handleAddToCart = () => doAdd()
  const handleBuyNow    = () => { doAdd().then(ok => { if (ok) setTimeout(() => router.push('/checkout'), 120) }) }

  /* ─────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────── */
  return (
    <div className={styles.page}>

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && images.length > 0 && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close">✕</button>

          {images.length > 1 && (
            <button className={`${styles.lightboxArrow} ${styles.lightboxArrowL}`}
              onClick={e => { e.stopPropagation(); setLightboxImg(i => (i - 1 + images.length) % images.length) }}>‹</button>
          )}

          <img
            src={images[lightboxImg]}
            alt={product.name}
            className={styles.lightboxImg}
            onClick={e => e.stopPropagation()}
          />

          {images.length > 1 && (
            <button className={`${styles.lightboxArrow} ${styles.lightboxArrowR}`}
              onClick={e => { e.stopPropagation(); setLightboxImg(i => (i + 1) % images.length) }}>›</button>
          )}

          {images.length > 1 && (
            <div className={styles.lightboxDots} onClick={e => e.stopPropagation()}>
              {images.map((_, i) => (
                <button key={i} onClick={() => setLightboxImg(i)}
                  className={`${styles.lightboxDot} ${lightboxImg === i ? styles.lightboxDotOn : ''}`} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.inner}>

        {/* Breadcrumb */}
        <nav className={styles.bc}>
          <Link href="/">Home</Link>
          <span className={styles.bcSep}>—</span>
          <Link href="/#products">Products</Link>
          <span className={styles.bcSep}>—</span>
          <span className={styles.bcCurrent}>{product.name}</span>
        </nav>

        <div className={styles.layout}>

          {/* ══════════════════════════════
              LEFT — GALLERY
          ══════════════════════════════ */}
          <div className={styles.galleryWrap}>

            {images.length > 1 && (
              <div className={styles.thumbCol}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`${styles.thumb} ${activeImg === i ? styles.thumbOn : ''}`}>
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
              onClick={handleImgClick}
            >
              {images[activeImg] ? (
                <img
                  src={images[activeImg]}
                  alt={product.name}
                  className={styles.mainImg}
                  style={zoomed ? { transform: 'scale(2.2)', transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
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

              {product.discount > 0 && <span className={styles.discBadge}>-{product.discount}%</span>}
              {isOutOfStock && !hasVariants && <div className={styles.oosOverlay}>Out of Stock</div>}
              {images.length > 1 && <span className={styles.imgCount}>{activeImg + 1}/{images.length}</span>}

              {images.length > 1 && <>
                <button className={`${styles.arrow} ${styles.arrowL}`}
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length) }}>‹</button>
                <button className={`${styles.arrow} ${styles.arrowR}`}
                  onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length) }}>›</button>
              </>}

              {images.length > 0 && !zoomed && <span className={styles.zoomHint}>Tap to enlarge</span>}
            </div>
          </div>

          {/* ══════════════════════════════
              RIGHT — INFO PANEL
          ══════════════════════════════ */}
          <div className={styles.infoPanel}>

            {/* Title */}
            <h1 className={styles.title}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.metaRow}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingVal}>4.8</span>
              <span className={styles.dot}>·</span>
              <span className={styles.sold}>120+ sold</span>
            </div>

            {/* ── STORE CARD ── */}
            {store && (
              <Link href={`/stores/${store.id}`} className={styles.storeCard}>
                <div className={styles.storeLogoWrap}>
                  {store.logo_url
                    ? <img src={store.logo_url} alt={store.name} className={styles.storeLogo} />
                    : <span className={styles.storeLogoFallback}>
                        {store.name?.charAt(0).toUpperCase()}
                      </span>
                  }
                </div>
                <div className={styles.storeInfo}>
                  <div className={styles.storeNameRow}>
                    <span className={styles.storeName}>{store.name}</span>
                    {store.verified && (
                      <span className={styles.verifiedBadge} title="Verified Seller">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#2563eb" stroke="none">
                          <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                  {store.rating > 0 && (
                    <div className={styles.storeRatingRow}>
                      <span className={styles.storeStars}>
                        {[1,2,3,4,5].map(n => (
                          <svg key={n} width="11" height="11" viewBox="0 0 24 24"
                            fill={n <= Math.round(store.rating) ? '#f59e0b' : 'none'}
                            stroke="#f59e0b" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        ))}
                      </span>
                      <span className={styles.storeRatingVal}>{Number(store.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <span className={styles.storeChevron}>›</span>
              </Link>
            )}

            {/* Price */}
            <div className={styles.priceBox}>
              {product.discount > 0 && (
                <span className={styles.offerTag}><span className={styles.offerDot}/>
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
                  <span className={styles.savePill}>Save ETB {(Number(product.price) - Number(finalPrice)).toLocaleString()}</span>
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

            {/* ── COLOR selector ── */}
            {hasVariants && allColors.length > 0 && (
              <div className={styles.varSection}>
                <p className={styles.varLabel}>
                  Color:&nbsp;
                  <strong>{selectedColor ?? <em className={styles.pick}>Select a color</em>}</strong>
                </p>
                <div className={styles.colorRow}>
                  {allColors.map(color => {
                    const colorHasStock = variants.some(v => v.color === color && v.stock > 0)
                    const colorImg      = colorImgMap[color] ?? null
                    const hex           = colorHexMap[color] ?? null

                    return (
                      <button key={color} title={color} onClick={() => colorHasStock && handleColorChange(color)}
                        className={`${styles.colorCard} ${selectedColor === color ? styles.colorOn : ''} ${!colorHasStock ? styles.colorOos : ''}`}>

                        {/* Priority: variant image_url → hex swatch → name-based swatch */}
                        {colorImg ? (
                          <img src={colorImg} alt={color} className={styles.colorImg} />
                        ) : (
                          <ColorSwatch
                            colorHex={hex}
                            colorName={color}
                          />
                        )}

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

            {/* ── SIZE selector ── */}
            {hasVariants && allSizes.length > 0 && (
              <div className={styles.varSection}>
                <p className={styles.varLabel}>
                  {sizeLabel}:&nbsp;
                  <strong>{selectedSize ?? <em className={styles.pick}>Select {sizeLabel === 'Device Model' ? 'a model' : 'a size'}</em>}</strong>
                </p>
                <div className={styles.sizeRow}>
                  {sizesForColor.map(size => {
                    const sizeVariant = variants.find(v => v.size === size && (selectedColor ? v.color === selectedColor : true))
                    const inStock = sizeVariant && sizeVariant.stock > 0
                    return (
                      <button key={size} onClick={() => inStock && setSelectedSize(size)}
                        className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeOn : ''} ${!inStock ? styles.sizeOos : ''}`}>
                        {size}
                        {!inStock && <span className={styles.oosDash} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className={styles.stockRow}>
              {hasVariants && !(selectedColor || selectedSize) && (
                <span className={styles.stockNeutral}>Select options to see availability</span>
              )}
              {hasVariants && (selectedColor || selectedSize) && (
                activeVariant
                  ? activeVariant.stock > 0
                    ? <span className={styles.stockYes}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        In Stock <em>({activeVariant.stock} available)</em>
                      </span>
                    : <span className={styles.stockNo}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Out of Stock
                      </span>
                  : <span className={styles.stockNo}>Combination not available</span>
              )}
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

            {/* Quantity */}
            {canAdd && (
              <div className={styles.qtyRow}>
                <span className={styles.qtyLabel}>Quantity</span>
                <div className={styles.qtyBox}>
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                  <input type="number" className={styles.qtyInput} value={qty} min={1} max={stockAvailable}
                    onChange={e => setQty(Math.min(stockAvailable, Math.max(1, parseInt(e.target.value) || 1)))} />
                  <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(stockAvailable, q + 1))} disabled={qty >= stockAvailable}>+</button>
                </div>
                <span className={styles.maxLabel}>Max {stockAvailable}</span>
              </div>
            )}

            {addError && (
              <div className={styles.errorBox}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {addError}
              </div>
            )}

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button className={`${styles.btnBuy} ${!canAdd ? styles.btnOff : ''}`} onClick={handleBuyNow} disabled={!canAdd}>
                Buy Now
              </button>
              <button className={`${styles.btnCart} ${added ? styles.btnAdded : ''} ${!canAdd ? styles.btnOff : ''}`}
                onClick={handleAddToCart} disabled={!canAdd}>
                {added ? (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Added to Cart!</>
                ) : (
                  <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Add to Cart</>
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
                { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Return & Refund', sub: 'Free returns on defects' },
                { path: 'M1 3h15v13H1zM16 8h5v8h-5M3 16v4M7 16v4',      title: 'Fast Delivery',   sub: '1–3 days in Addis Ababa' },
                { path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', title: 'Cash on Delivery', sub: 'Pay only when received' },
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
