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
        redirectTo: 'https://addora.com.et/auth/callback',
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
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      // NO redirectTo here
    },
  })
  if (error) throw error
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
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
