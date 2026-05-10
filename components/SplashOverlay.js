'use client'

/**
 * SplashOverlay.js
 * ─────────────────────────────────────────────────────────
 * Addora — Cinematic First-Visit Overlay
 * Design: Liquid-Glass (DESIGN.md) · Orange #ff6b00 · Navy #04152d
 *
 * USAGE:
 *   import SplashOverlay from '@/components/SplashOverlay'
 *   <SplashOverlay />
 *
 * BEHAVIOUR:
 *  • First visit  → cinematic overlay appears
 *  • Auto-dismiss → 3 seconds, progress bar fills, then fades out
 *  • User tap     → "Enter Store" or "Skip intro" dismiss immediately
 *  • Subsequent   → nothing rendered (localStorage flag)
 * ─────────────────────────────────────────────────────────
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './SplashOverlay.module.css'

const STORAGE_KEY     = 'addora_splash_seen'
const AUTO_DISMISS_MS = 3000

const PARTICLES = [
  { left: '10%', delay: '0s',  size: 6, dur: '15s' },
  { left: '28%', delay: '3s',  size: 4, dur: '20s' },
  { left: '52%', delay: '7s',  size: 8, dur: '12s' },
  { left: '71%', delay: '1s',  size: 5, dur: '25s' },
  { left: '87%', delay: '5s',  size: 4, dur: '18s' },
  { left: '40%', delay: '10s', size: 6, dur: '16s' },
]

const CHIPS = [
  { icon: '🚀', label: 'Fast\nDelivery'     },
  { icon: '💳', label: 'Telebirr\n& CBE'    },
  { icon: '✅', label: 'Trusted\nSellers'   },
  { icon: '🤝', label: 'Earn as\nAffiliate' },
]

export default function SplashOverlay() {
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [exiting,  setExiting]  = useState(false)
  const [progress, setProgress] = useState(0)

  const rafRef   = useRef(null)
  const startRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [mounted])

  const dismiss = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(timerRef.current)
    localStorage.setItem(STORAGE_KEY, '1')
    setExiting(true)
    timerRef.current = setTimeout(() => setVisible(false), 900)
  }, [])

  useEffect(() => {
    if (!visible) return
    startRef.current = performance.now()
    const tick = (now) => {
      const pct = Math.min(((now - startRef.current) / AUTO_DISMISS_MS) * 100, 100)
      setProgress(pct)
      if (pct < 100) rafRef.current = requestAnimationFrame(tick)
      else dismiss()
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(timerRef.current)
    }
  }, [visible, dismiss])

  if (!mounted || !visible) return null

  const secsLeft = Math.ceil(AUTO_DISMISS_MS / 1000 - (progress / 100) * (AUTO_DISMISS_MS / 1000))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Addora"
      className={`${styles.overlay} ${exiting ? styles.exiting : ''}`}
    >

      {/* ── Deep radial bg ── */}
      <div aria-hidden="true" className={styles.radialBg} />

      {/* ── Floating rings ── */}
      <div aria-hidden="true" className={`${styles.ring} ${styles.ringRippleSm}`} />
      <div aria-hidden="true" className={`${styles.ring} ${styles.ringRippleLg}`} />
      <div aria-hidden="true" className={`${styles.ring} ${styles.ringFloat}`}    />

      {/* ── Ambient orbs ── */}
      <div aria-hidden="true" className={styles.orbTop}    />
      <div aria-hidden="true" className={styles.orbBottom} />

      {/* ── Rising particles ── */}
      {PARTICLES.map(({ left, delay, size, dur }, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={styles.particle}
          style={{
            left,
            width:  size,
            height: size,
            animationDuration:       dur,
            animationDelay:          delay,
          }}
        />
      ))}

      {/* ── Progress bar ── */}
      <div className={styles.progressTrack} aria-hidden="true">
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Countdown ── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={styles.countdown}
      >
        {secsLeft}s
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className={styles.content}>

        {/* Eyebrow */}
        <div className={styles.eyebrow}>
          <div className={styles.eyebrowLine} />
          <span className={styles.eyebrowText}>Ethiopia&apos;s Marketplace</span>
          <div className={styles.eyebrowLine} />
        </div>

        {/* Logo icon */}
        <div className={styles.logoIcon}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 7h18l-3-5H6Z" fill="white" opacity="0.95"/>
            <rect x="3" y="7" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
            <path d="M9 11a3 3 0 006 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div className={styles.wordmarkWrap}>
          <div aria-hidden="true" className={styles.wordmarkGlow} />
          <span className={styles.wordmark}>ADDORA</span>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>
          Shop More. Pay Less. Love More.
        </p>

        {/* Sub tagline */}
        <div className={styles.subTagline}>
          <div className={styles.subTaglineLine} />
          <span className={styles.subTaglineText}>
            The Future of Shopping in Ethiopia
          </span>
          <div className={styles.subTaglineLine} />
        </div>

        {/* Feature chips */}
        <div className={styles.chips}>
          {CHIPS.map(({ icon, label }) => (
            <div key={label} className={styles.chip}>
              <span className={styles.chipIcon}>{icon}</span>
              <span className={styles.chipLabel}>{label}</span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          className={styles.ctaPrimary}
          onClick={dismiss}
        >
          Enter Store
        </button>

        {/* Ghost skip */}
        <button
          className={styles.ctaGhost}
          onClick={dismiss}
        >
          Skip intro
        </button>

      </div>
    </div>
  )
}
