// lib/supabase.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton Supabase client — safe for Next.js (avoids re-creating on
// every hot-reload in dev and every render in prod).
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
//
// IMPORTANT: auth persistence/refresh/lock behavior is explicitly disabled
// here. This client is created fresh per request and never needs a
// browser session — leaving the defaults on means that if this ever gets
// pulled into a client bundle by accident (a bad import chain, etc.), it
// spins up a second live GoTrueClient in the browser that fights the
// `supabase` singleton above for the same Web Locks key (the lock key is
// derived from the project URL, so ANY client for this project collides,
// singleton or not). That's what causes:
//   "Lock ... was released because another request stole it"
// and silently kills whatever auth call was in flight (e.g. setSession()
// during OTP verification). Disabling these options means this client
// never touches the lock at all, so it can't cause that even if misused.
// ─────────────────────────────────────────────────────────────────────────────
export function createServerClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseKey,
    {
      auth: {
        persistSession:     false,
        autoRefreshToken:   false,
        detectSessionInUrl: false,
      },
    }
  )
}
