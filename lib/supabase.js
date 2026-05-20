// lib/supabase.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton Supabase client — safe for Next.js (avoids re-creating on
// every hot-reload in dev and every render in prod).
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[supabase.js] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
    'Add them to your .env.local file.'
  )
}

const GLOBAL_KEY = '__supabase_singleton__'

if (!globalThis[GLOBAL_KEY]) {
  globalThis[GLOBAL_KEY] = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  })
}

/** Browser + server singleton — use this everywhere on the client side */
export const supabase = globalThis[GLOBAL_KEY]

// ─────────────────────────────────────────────────────────────────────────────
// SERVER-ONLY client (used in Server Components / Route Handlers)
// Uses the service-role key so it bypasses RLS — NEVER import this in
// 'use client' files.
// Falls back to anon key if service-role key is not set (RLS still applies).
// ─────────────────────────────────────────────────────────────────────────────
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseKey
  )
}
