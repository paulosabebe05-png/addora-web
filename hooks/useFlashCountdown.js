'use client'
// hooks/useFlashCountdown.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches the active flash sale's `ends_at` from Supabase (flash_sales table).
// Falls back to a local 6-hour timer if no active row is found.
// Ticks every second; sets `expired = true` when time runs out,
// which triggers the flash section to empty itself.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const FALLBACK_HOURS = 6

function breakDown(endMs) {
  const ms = Math.max(0, endMs - Date.now())
  const totalSec = Math.floor(ms / 1000)
  return {
    h: Math.floor(totalSec / 3600),
    m: Math.floor((totalSec % 3600) / 60),
    s: totalSec % 60,
  }
}

/**
 * useFlashCountdown()
 *
 * Returns { h, m, s, expired, loading }
 *  - h / m / s  : time remaining (integers)
 *  - expired    : true when the sale has ended (show empty state)
 *  - loading    : true while fetching from Supabase
 *
 * Source of truth: public.flash_sales — the row with active = true
 * and the latest ends_at is used. If none exists the countdown falls
 * back to a local 6-hour timer so the UI never breaks.
 */
export function useFlashCountdown() {
  const [endMs,   setEndMs]   = useState(null)
  const [time,    setTime]    = useState({ h: 0, m: 0, s: 0 })
  const [expired, setExpired] = useState(false)
  const [loading, setLoading] = useState(true)
  const tickRef = useRef(null)

  // ── 1. Fetch ends_at from Supabase ────────────────────────────────────────
  useEffect(() => {
    async function fetchSale() {
      try {
        const { data, error } = await supabase
          .from('flash_sales')
          .select('ends_at')
          .eq('active', true)
          .order('ends_at', { ascending: false })
          .limit(1)
          .single()

        if (error || !data) {
          console.warn('No active flash sale found, using fallback timer.')
          setEndMs(Date.now() + FALLBACK_HOURS * 3_600_000)
        } else {
          const ms = new Date(data.ends_at).getTime()
          setEndMs(ms)
          if (Date.now() >= ms) setExpired(true)
        }
      } catch (err) {
        console.error('Flash sale fetch error:', err)
        setEndMs(Date.now() + FALLBACK_HOURS * 3_600_000)
      } finally {
        setLoading(false)
      }
    }

    fetchSale()
  }, [])

  // ── 2. Tick every second once we have endMs ────────────────────────────────
  useEffect(() => {
    if (endMs === null || expired) return

    setTime(breakDown(endMs))

    tickRef.current = setInterval(() => {
      if (Date.now() >= endMs) {
        setTime({ h: 0, m: 0, s: 0 })
        setExpired(true)
        clearInterval(tickRef.current)
      } else {
        setTime(breakDown(endMs))
      }
    }, 1000)

    return () => clearInterval(tickRef.current)
  }, [endMs, expired])

  return { ...time, expired, loading }
}