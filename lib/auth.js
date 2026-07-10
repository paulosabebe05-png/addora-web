'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(toUser(session))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session ? toUser(session) : null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const toUser = (session) => {
    const u = session.user
    const meta = u.user_metadata ?? {}
    return {
      id:         u.id,
      email:      u.email,
      name:       meta.full_name ?? meta.name ?? u.email?.split('@')[0] ?? 'User',
      avatar_url: meta.avatar_url ?? null,
      phone:      meta.phone ?? null,
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
  const verifyPhoneOtp = async (phone, code, name) => {
    const res = await fetch('/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code, name }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Verification failed')

    const { error } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    })
    if (error) throw error

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
