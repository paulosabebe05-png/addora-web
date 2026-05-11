'use client'
// lib/lang.js

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from './translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  // Always start with 'en' on server + first client render (avoids hydration mismatch)
  const [lang, setLangState] = useState('en')

  // Only read localStorage after mount — never on server
  useEffect(() => {
    try {
      const saved = localStorage.getItem('addora_lang')
      if (saved === 'am' || saved === 'en') setLangState(saved)
    } catch {
      // localStorage blocked (private browsing etc.) — stay on 'en'
    }
  }, [])

  // Load Noto Sans Ethiopic only when Amharic is active
  useEffect(() => {
    try {
      if (lang === 'am') {
        const id = 'noto-ethiopic-link'
        if (!document.getElementById(id)) {
          const link = document.createElement('link')
          link.id   = id
          link.rel  = 'stylesheet'
          link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap'
          document.head.appendChild(link)
        }
        document.documentElement.setAttribute('lang', 'am')
      } else {
        document.documentElement.setAttribute('lang', 'en')
      }
    } catch {
      // SSR guard — document not available
    }
  }, [lang])

  const setLang = useCallback((l) => {
    setLangState(l)
    try { localStorage.setItem('addora_lang', l) } catch {}
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'am' : 'en')
  }, [lang, setLang])

  const dict = translations[lang] ?? translations.en
  const tr = useCallback(
    (key) => dict[key] ?? translations.en[key] ?? key,
    [dict]
  )

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, tr }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
