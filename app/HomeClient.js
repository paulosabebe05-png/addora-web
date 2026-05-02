'use client'
import { useState, useEffect } from 'react'
import ProductCard from '../components/ui/ProductCard'
import styles from './HomeClient.module.css'

const CATEGORIES = ['All', 'Kids', 'Electronics', 'Home & Living', 'Beauty', 'Fashion', 'Watches', 'Sports']

// ── Flash Sale Countdown ──────────────────────────────────────────────────────
// Sets a target 8 hours from when the page first loads.
// In production, replace with a fixed server-side timestamp from your DB.
function useCountdown(targetMs) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, targetMs - Date.now()))

  useEffect(() => {
    const tick = setInterval(() => {
      setTimeLeft(prev => {
        const next = Math.max(0, targetMs - Date.now())
        if (next === 0) clearInterval(tick)
        return next
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [targetMs])

  const h = String(Math.floor(timeLeft / 3_600_000)).padStart(2, '0')
  const m = String(Math.floor((timeLeft % 3_600_000) / 60_000)).padStart(2, '0')
  const s = String(Math.floor((timeLeft % 60_000) / 1000)).padStart(2, '0')
  return { h, m, s, expired: timeLeft === 0 }
}

// ── Social Proof Bar ──────────────────────────────────────────────────────────
function SocialProofBar() {
  return (
    <div className={styles.proofBar}>
      <div className={styles.proofInner}>
        <div className={styles.proofItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className={styles.proofNum}>4,800+</span>
          <span className={styles.proofLabel}>orders this week</span>
        </div>

        <span className={styles.proofDivider} />

        <div className={styles.proofItem}>
          <span className={styles.proofStars}>★★★★★</span>
          <span className={styles.proofNum}>4.8</span>
          <span className={styles.proofLabel}>avg rating</span>
        </div>

        <span className={styles.proofDivider} />

        <div className={styles.proofItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span className={styles.proofNum}>200+</span>
          <span className={styles.proofLabel}>verified sellers</span>
        </div>

        <span className={styles.proofDivider} />

        <div className={styles.proofItem}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E75525" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className={styles.proofLabel}>Addis · Dire Dawa · Hawassa</span>
        </div>
      </div>
    </div>
  )
}

// ── How It Works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: '1',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
      title: 'Browse',
      sub: 'Find from 5,000+ products',
    },
    {
      num: '2',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
      title: 'Order',
      sub: 'No payment upfront',
    },
    {
      num: '3',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      ),
      title: 'Receive',
      sub: '1–3 day delivery',
    },
    {
      num: '4',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      title: 'Pay',
      sub: 'Cash on delivery',
    },
  ]

  return (
    <section className={styles.howSection}>
      <div className={styles.sectionInner}>
        <div className={styles.howHeader}>
          <h2 className={styles.howTitle}>How it works</h2>
          <p className={styles.howSub}>Shop in 4 simple steps — no card, no app, no hassle</p>
        </div>
        <div className={styles.howSteps}>
          {steps.map((step, i) => (
            <div key={step.num} className={styles.howStep}>
              <div className={styles.howIconWrap}>
                {step.icon}
                <span className={styles.howNum}>{step.num}</span>
              </div>
              <span className={styles.howStepTitle}>{step.title}</span>
              <span className={styles.howStepSub}>{step.sub}</span>
              {i < steps.length - 1 && (
                <span className={styles.howArrow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HomeClient({ products }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  // Flash sale target: 8 hours from mount. Replace with a real server timestamp in production.
  const [flashTarget] = useState(() => Date.now() + 8 * 3_600_000)
  const { h, m, s, expired } = useCountdown(flashTarget)

  const filtered = products.filter(p => {
    const matchCat =
      activeCategory === 'All' ||
      (p.category && p.category.toLowerCase().includes(activeCategory.toLowerCase())) ||
      p.name.toLowerCase().includes(activeCategory.toLowerCase())

    const matchSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase())

    return matchCat && matchSearch
  })

  return (
    <>
      {/* ── DESKTOP Hero — Option B: soft peach ── */}
      <section className={styles.hero}>
        <div className={styles.sectionInner}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Ethiopia&apos;s Newest Online Marketplace
            </span>

            <h1 className={styles.heroTitle}>
              Shop Smart,{' '}
              <span>Pay on Delivery</span>
            </h1>

            <p className={styles.heroSub}>
              Thousands of products from trusted sellers — cash on delivery, 1–3 day shipping across Ethiopia.
            </p>

            {/* Feature pills */}
            <div className={styles.heroCod}>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Cash on Delivery
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                1–3 Day Delivery
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Quality Guaranteed
              </div>
              <div className={styles.heroFeature}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                Free Delivery in Addis
              </div>
            </div>

            {/* ── NEW: CTA button ── */}
            <div className={styles.heroCtas}>
              <a href="#products" className={styles.heroCtaPrimary}>
                Browse products
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#how" className={styles.heroCtaSecondary}>
                How it works
              </a>
            </div>
          </div>

          {/* Right: stats visual */}
          <div className={styles.heroVisual}>
            <div className={styles.heroOrb} />
            <div className={styles.heroStats}>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatNum}>5,000+</span>
                <span className={styles.heroStatLabel}>Products</span>
              </div>
              <div className={styles.heroStatCard}>
                <span className={styles.heroStatNum}>200+</span>
                <span className={styles.heroStatLabel}>Sellers</span>
              </div>
              <div className={`${styles.heroStatCard} ${styles.heroStatAccent}`}>
                <span className={styles.heroCardLabel}>⚡ Flash Deal</span>
                <span className={styles.heroCardTitle}>Up to 64% Off</span>
                <span className={styles.heroCardSub}>New deals every day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: Social Proof Bar ── */}
      <SocialProofBar />

      {/* ── MOBILE Hero Card ── */}
      <section className={styles.mobileHero}>
        <div className={styles.mobileHeroCard}>
          <div className={styles.mobileHeroLeft}>
            <div className={styles.mobileHeroBrand}>
              <div className={styles.mobileHeroBrandMark}>
                <svg width="13" height="13" viewBox="0 0 32 32" fill="none">
                  <path d="M8 24 Q16 8 24 24" stroke="#E75525" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                  <circle cx="8"  cy="24" r="2.8" fill="#E75525"/>
                  <circle cx="16" cy="13" r="2.8" fill="#E75525"/>
                  <circle cx="24" cy="24" r="2.8" fill="#E75525"/>
                </svg>
              </div>
              <span className={styles.mobileHeroBrandName}>addora</span>
            </div>

            <h2 className={styles.mobileHeroTitle}>Launching in Ethiopia</h2>
            <p className={styles.mobileHeroSub}>Thousands of products · Trusted sellers</p>

            <div className={styles.mobileHeroPills}>
              <span className={styles.mobileHeroPill}>Telebirr</span>
              <span className={styles.mobileHeroPill}>Chapa</span>
              <span className={styles.mobileHeroPill}>Cash on delivery</span>
            </div>

            {/* ── NEW: mobile CTA ── */}
            <a href="#products" className={styles.mobileHeroCta}>
              Shop now
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <div className={styles.mobileHeroRight}>
            <div className={styles.mobileHeroDecorBox}>
              <span className={styles.mobileHeroDot} style={{ top: '20%', left: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ top: '20%', right: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ bottom: '20%', left: '20%' }} />
              <span className={styles.mobileHeroDot} style={{ bottom: '20%', right: '20%' }} />
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className={styles.mobileCategoryRow}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`${styles.mobileCatBtn} ${activeCategory === cat ? styles.mobileCatActive : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Flash Sale Banner with Countdown ── */}
      <div className={styles.flashBanner}>
        <div className={styles.flashInner}>
          <div className={styles.flashLeft}>
            <span className={styles.flashIcon}>⚡</span>
            <div className={styles.flashTitleGroup}>
              <span className={styles.flashTitle}>Flash Sale</span>
              <span className={styles.flashSub}>Limited time deals — up to 64% off</span>
            </div>
            {/* ── NEW: Countdown timer ── */}
            {!expired && (
              <div className={styles.flashCountdown}>
                <span className={styles.flashCountdownLabel}>Ends in</span>
                <div className={styles.flashTimerGroup}>
                  <div className={styles.flashTimerBlock}>
                    <span className={styles.flashTimerNum}>{h}</span>
                    <span className={styles.flashTimerUnit}>h</span>
                  </div>
                  <span className={styles.flashTimerColon}>:</span>
                  <div className={styles.flashTimerBlock}>
                    <span className={styles.flashTimerNum}>{m}</span>
                    <span className={styles.flashTimerUnit}>m</span>
                  </div>
                  <span className={styles.flashTimerColon}>:</span>
                  <div className={styles.flashTimerBlock}>
                    <span className={styles.flashTimerNum}>{s}</span>
                    <span className={styles.flashTimerUnit}>s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.flashDeals}>
            {products.filter(p => p.discount >= 30).slice(0, 3).map(p => (
              <a key={p.id} href={`/products/${p.id}`} className={styles.flashItem}>
                <span className={styles.flashBadge}>-{p.discount}%</span>
                <span className={styles.flashName}>{p.name}</span>
                <span className={styles.flashPrice}>ETB {Math.round(p.price * (1 - p.discount / 100)).toLocaleString()}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW: How It Works ── */}
      <HowItWorks />

      {/* ── Products ── */}
      <section className={styles.products} id="products">
        <div className={styles.sectionInner}>

          {/* Desktop filter bar */}
          <div className={styles.filterBar}>
            <div className={styles.categories}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${activeCategory === cat ? styles.catActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.searchWrap}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={styles.search}
              />
            </div>
          </div>

          {/* Mobile section header */}
          <div className={styles.mobileSectionHeader}>
            <span className={styles.mobileSectionTitle}>Featured products</span>
            <a href="#" className={styles.mobileSeeAll}>See all</a>
          </div>

          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p>No products found</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
