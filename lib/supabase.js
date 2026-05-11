// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const globalKey = '__supabase_singleton__'

if (!globalThis[globalKey]) {
  globalThis[globalKey] = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
    },
  })
}

export const supabase = globalThis[globalKey]
