'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // Guards against out-of-order resolution: getSession() and the first
    // onAuthStateChange event can both fire close together, and each kicks
    // off an async toUser() lookup. If the earlier call resolves after the
    // later one (slow network), it would otherwise overwrite fresh state
    // with stale data. Only the most recently *started* call is allowed
    // to apply its result.
    let latest = 0

    const apply = async (session) => {
      const callId = ++latest
      if (session) {
        const u = await toUser(session)
        if (active && callId === latest) setUser(u)
      } else {
        if (active && callId === latest) setUser(null)
      }
      if (active) setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => apply(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => apply(session)
    )

    return () => { active = false; subscription.unsubscribe() }
  }, [])

  // `profiles` is the source of truth (it's what verify-otp/admin actions
  // update directly). Auth session `user_metadata` can drift out of sync
  // with it — e.g. it's never touched when a profile is updated through
  // the "existing user" path — so we read the profile row first and only
  // fall back to session metadata if the profile lookup fails or is empty.
  const toUser = async (session) => {
    const u = session.user
    const meta = u.user_metadata ?? {}

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, phone, role')
      .eq('id', u.id)
      .maybeSingle()

    return {
      id:         u.id,
      email:      u.email,
      name:       profile?.full_name || meta.full_name || meta.name || u.email?.split('@')[0] || 'User',
      avatar_url: profile?.avatar_url || meta.avatar_url || null,
      phone:      profile?.phone || meta.phone || null,
      role:       profile?.role || 'user',
    }
  }

  const signUp = async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error

    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({ id: data.user.id, email: data.user.email })
        .eq('id', data.user.id)
    }

    return data
  }

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
  }

  /* ── PHONE / OTP AUTH ── */

  // Kicks off the OTP flow — hits our own API route, which in turn
  // calls Afromessage to actually text the code to the phone.
  const sendPhoneOtp = async (phone) => {
    const res = await fetch('/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to send code')
    return data // { success: true, phone: '+2519...' }
  }

  // Verifies the code the user typed in, then logs them in using the
  // access/refresh tokens our verify-otp route hands back.
  //
  // setSession() briefly needs the browser-wide Supabase auth lock. If
  // AuthProvider's own getSession() call (which runs on every mount) is
  // still holding that lock when this fires, Supabase force-steals it
  // after a 5s timeout and the loser's promise rejects — even though the
  // session data itself gets written correctly (confirmed: reloading
  // the page shows the user signed in fine). Rather than surface that
  // as a scary error on an otherwise-successful sign-in, retry once,
  // specifically for lock-related failures only.
  const verifyPhoneOtp = async (phone, code, name, mode) => {
    const res = await fetch('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, name, mode }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Verification failed')

    const trySetSession = async (attempt = 1) => {
      const { error } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
      if (error) {
        const isLockError = /lock/i.test(error.message || '')
        if (attempt < 2 && isLockError) {
          await new Promise(r => setTimeout(r, 300))
          return trySetSession(attempt + 1)
        }
        throw error
      }
    }

    await trySetSession()
    return data
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      sendPhoneOtp,
      verifyPhoneOtp,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
