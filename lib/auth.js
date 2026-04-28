'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('addora_user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const signUp = async ({ name, phone, password }) => {
    // Check if phone already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existing) throw new Error('Phone number already registered')

    // Hash password using Web Crypto API (SHA-256)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const pin_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ name, phone, pin_hash })
      .select()
      .single()

    if (error) throw error

    const userObj = { id: newUser.id, name: newUser.name, phone: newUser.phone }
    localStorage.setItem('addora_user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const signIn = async ({ phone, password }) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const pin_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .eq('pin_hash', pin_hash)
      .single()

    if (error || !dbUser) throw new Error('Invalid phone number or password')

    const userObj = { id: dbUser.id, name: dbUser.name, phone: dbUser.phone }
    localStorage.setItem('addora_user', JSON.stringify(userObj))
    setUser(userObj)
    return userObj
  }

  const signOut = () => {
    localStorage.removeItem('addora_user')
    localStorage.removeItem('addora_cart')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)