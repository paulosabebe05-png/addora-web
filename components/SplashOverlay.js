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

const STORAGE_KEY     = 'addora_splash_seen'
const AUTO_DISMISS_MS = 3000

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=Space+Grotesk:wght@600&family=Hanken+Grotesk:wght@400;600&display=swap');

  @keyframes _sp-fadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  @keyframes _sp-gradShift {
    0%   { background-position:0%   50%; }
    50%  { background-position:100% 50%; }
    100% { background-position:0%   50%; }
  }
  @keyframes _sp-particleDrift {
    0%   { transform:translateY(0) translateX(0);         opacity:0; }
    10%  { opacity:1; }
    90%  { opacity:0.6; }
    100% { transform:translateY(-100vh) translateX(50px); opacity:0; }
  }
  @keyframes _sp-float {
    0%,100% { transform:translate(-50%,-50%) scale(1)    rotate(0deg);   }
    50%     { transform:translate(-50%,-50%) scale(1.03) rotate(0.5deg); }
  }
  @keyframes _sp-ringPulse {
    0%   { transform:translate(-50%,-50%) scale(0.85); opacity:0.5; }
    70%  { transform:translate(-50%,-50%) scale(1.05); opacity:0.1; }
    100% { transform:translate(-50%,-50%) scale(0.85); opacity:0.5; }
  }
  @keyframes _sp-shimmer {
    0%       { transform:translateX(-120%); }
    60%,100% { transform:translateX(220%);  }
  }
  @keyframes _sp-pulseGlow {
    0%,100% { box-shadow:0 0 25px rgba(255,107,0,0.5),0 0 0 0 rgba(255,107,0,0.4); }
    50%     { box-shadow:0 0 45px rgba(255,107,0,0.9),0 0 20px 5px rgba(255,107,0,0); }
  }
  ._sp-wordmark {
    background: linear-gradient(135deg,#fff 0%,#ffb693 50%,#ff6b00 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-size: 200% auto;
    animation: _sp-gradShift 5s ease infinite;
  }
  ._sp-ctaShimmer::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
    transform:translateX(-120%);
    animation:_sp-shimmer 2.4s ease-in-out infinite;
    border-radius:9999px;
  }
`

let injected = false
function injectStyles() {
  if (injected || typeof document === 'undefined') return
  injected = true
  const el = document.createElement('style')
  el.textContent = STYLES
  document.head.appendChild(el)
}

export default function SplashOverlay() {
  const [mounted,  setMounted]  = useState(false)
  const [visible,  setVisible]  = useState(false)
  const [exiting,  setExiting]  = useState(false)
  const [progress, setProgress] = useState(0)

  const rafRef   = useRef(null)
  const startRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => { injectStyles(); setMounted(true) }, [])

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
      style={{
        position:       'fixed',
        inset:           0,
        zIndex:          9999,
        background:      '#04152d',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        overflow:       'hidden',
        transition:     'opacity .9s cubic-bezier(.4,0,.2,1), transform .9s cubic-bezier(.4,0,.2,1)',
        ...(exiting ? { opacity:0, transform:'scale(1.04)', pointerEvents:'none' } : {}),
      }}
    >

      {/* ── Deep radial bg ── */}
      <div aria-hidden="true" style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 40%, rgba(255,107,0,0.08) 0%, #04152d 65%)',
      }} />

      {/* ── Floating rings ── */}
      {[
        { size:'70vw',  border:'1px solid rgba(255,107,0,0.12)', anim:'_sp-ringPulse 4s cubic-bezier(.215,.61,.355,1) infinite 0s'   },
        { size:'110vw', border:'1px solid rgba(255,107,0,0.05)', anim:'_sp-ringPulse 4s cubic-bezier(.215,.61,.355,1) infinite 1.5s' },
        { size:'88vw',  border:'1px solid rgba(255,107,0,0.07)', anim:'_sp-float 7s ease-in-out infinite'                             },
      ].map(({ size, border, anim }, i) => (
        <div key={i} aria-hidden="true" style={{
          position:'absolute', width:size, height:size,
          border, borderRadius:'50%',
          left:'50%', top:'50%',
          transform:'translate(-50%,-50%)',
          pointerEvents:'none', animation: anim,
        }} />
      ))}

      {/* ── Ambient orbs ── */}
      <div aria-hidden="true" style={{ position:'absolute', top:'-15%', left:'-10%', width:'55vw', height:'55vw', maxWidth:600, maxHeight:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(255,107,0,0.10) 0%,transparent 70%)', filter:'blur(2px)', pointerEvents:'none' }} />
      <div aria-hidden="true" style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'40vw', height:'40vw', maxWidth:450, maxHeight:450, borderRadius:'50%', background:'radial-gradient(circle,rgba(80,60,220,0.06) 0%,transparent 70%)', filter:'blur(2px)', pointerEvents:'none' }} />

      {/* ── Rising particles ── */}
      {[
        { left:'10%', delay:'0s',  size:6, dur:'15s' },
        { left:'28%', delay:'3s',  size:4, dur:'20s' },
        { left:'52%', delay:'7s',  size:8, dur:'12s' },
        { left:'71%', delay:'1s',  size:5, dur:'25s' },
        { left:'87%', delay:'5s',  size:4, dur:'18s' },
        { left:'40%', delay:'10s', size:6, dur:'16s' },
      ].map(({ left, delay, size, dur }, i) => (
        <div key={i} aria-hidden="true" style={{
          position:'absolute', bottom:0, left,
          width:`${size}px`, height:`${size}px`,
          borderRadius:'50%',
          background:'radial-gradient(circle,rgba(255,107,0,0.8) 0%,rgba(255,107,0,0) 70%)',
          pointerEvents:'none',
          animation:`_sp-particleDrift ${dur} linear infinite ${delay}`,
        }} />
      ))}

      {/* ── Progress bar ── */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'rgba(255,255,255,0.05)', zIndex:20 }}>
        <div style={{
          height:'100%', width:`${progress}%`,
          background:'linear-gradient(90deg,#ff6b00,#ffb693)',
          boxShadow:'0 0 12px rgba(255,107,0,0.9)',
          borderRadius:2, transition:'width 0.05s linear',
        }} />
      </div>

      {/* ── Countdown ── */}
      <div aria-live="polite" aria-atomic="true" style={{
        position:'absolute', bottom:14, right:18, zIndex:20,
        fontFamily:"'Space Grotesk',sans-serif",
        fontSize:10, fontWeight:600, letterSpacing:'0.1em',
        color:'rgba(255,107,0,0.5)',
      }}>
        {secsLeft}s
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{
        position:'relative', zIndex:5,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        textAlign:'center',
        padding:'72px 28px 80px',
        width:'100%', maxWidth:500,
      }}>

        {/* Eyebrow */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, animation:'_sp-fadeUp .6s ease .1s both' }}>
          <div style={{ width:28, height:1, background:'rgba(255,107,0,0.5)' }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
            Ethiopia&apos;s Marketplace
          </span>
          <div style={{ width:28, height:1, background:'rgba(255,107,0,0.5)' }} />
        </div>

        {/* Logo icon */}
        <div style={{
          width:64, height:64, borderRadius:18,
          background:'linear-gradient(135deg,#ff6b00,#cc4400)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 40px rgba(255,107,0,0.55)',
          marginBottom:14,
          animation:'_sp-fadeUp .6s ease .22s both',
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path d="M6 2L3 7h18l-3-5H6Z" fill="white" opacity="0.95"/>
            <rect x="3" y="7" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.7"/>
            <path d="M9 11a3 3 0 006 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div style={{ position:'relative', marginBottom:8, animation:'_sp-fadeUp .6s ease .32s both' }}>
          <div aria-hidden="true" style={{ position:'absolute', inset:'-8px', background:'rgba(255,107,0,0.12)', filter:'blur(24px)', borderRadius:'50%', pointerEvents:'none' }} />
          <span className="_sp-wordmark" style={{
            fontFamily:"'Sora',sans-serif",
            fontSize:52, fontWeight:800,
            letterSpacing:'0.05em', lineHeight:1,
            display:'block',
          }}>
            ADDORA
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily:"'Hanken Grotesk',sans-serif",
          fontSize:15, fontWeight:400,
          color:'rgba(255,255,255,0.65)',
          letterSpacing:'0.02em', marginBottom:10,
          animation:'_sp-fadeUp .6s ease .4s both',
        }}>
          Shop More. Pay Less. Love More.
        </p>

        {/* Sub tagline */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, animation:'_sp-fadeUp .6s ease .46s both' }}>
          <div style={{ width:20, height:1, background:'rgba(255,107,0,0.4)' }} />
          <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.22)' }}>
            The Future of Shopping in Ethiopia
          </span>
          <div style={{ width:20, height:1, background:'rgba(255,107,0,0.4)' }} />
        </div>

        {/* Feature chips */}
        <div style={{ display:'flex', gap:10, marginBottom:36, flexWrap:'wrap', justifyContent:'center', animation:'_sp-fadeUp .6s ease .54s both' }}>
          {[
            { icon:'🚀', label:'Fast\nDelivery'    },
            { icon:'💳', label:'Telebirr\n& CBE'   },
            { icon:'✅', label:'Trusted\nSellers'  },
            { icon:'🤝', label:'Earn as\nAffiliate'},
          ].map(({ icon, label }) => (
            <div key={label} style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:6,
              padding:'12px 12px', minWidth:70, borderRadius:16,
              background:'rgba(4,21,45,0.5)',
              backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)',
              border:'1px solid rgba(255,107,0,0.15)',
              boxShadow:'0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,107,0,0.05)',
            }}>
              <span style={{ fontSize:20, lineHeight:1 }}>{icon}</span>
              <span style={{
                fontFamily:"'Space Grotesk',sans-serif",
                fontSize:8, fontWeight:600,
                letterSpacing:'0.1em', textTransform:'uppercase',
                color:'rgba(255,255,255,0.32)',
                whiteSpace:'pre', textAlign:'center', lineHeight:1.4,
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <button
          className="_sp-ctaShimmer"
          onClick={dismiss}
          style={{
            position:'relative', overflow:'hidden',
            height:56, padding:'0 48px',
            borderRadius:9999,
            background:'linear-gradient(135deg,#ff6b00,#cc4400)',
            border:'1px solid rgba(255,133,51,0.5)',
            color:'#fff',
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:13, fontWeight:600,
            letterSpacing:'0.18em', textTransform:'uppercase',
            cursor:'pointer', marginBottom:14,
            animation:'_sp-fadeUp .6s ease .62s both, _sp-pulseGlow 3s ease-in-out infinite .8s',
            transition:'transform .15s, filter .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.05)'; e.currentTarget.style.filter='brightness(1.15)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.filter='brightness(1)' }}
        >
          Enter Store
        </button>

        {/* Ghost skip */}
        <button
          onClick={dismiss}
          style={{
            height:42, padding:'0 24px', borderRadius:9999,
            background:'rgba(4,21,45,0.5)',
            backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(255,255,255,0.3)',
            fontFamily:"'Space Grotesk',sans-serif",
            fontSize:10, fontWeight:600,
            letterSpacing:'0.14em', textTransform:'uppercase',
            cursor:'pointer', transition:'all .2s',
            animation:'_sp-fadeUp .6s ease .72s both',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,107,0,0.45)'; e.currentTarget.style.color='rgba(255,107,0,0.8)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; e.currentTarget.style.color='rgba(255,255,255,0.3)' }}
        >
          Skip intro
        </button>

      </div>
    </div>
  )
}