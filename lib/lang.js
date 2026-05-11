'use client'
// lib/lang.js
// Language context — EN ↔ አማ toggle with localStorage persistence

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from './translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLangState] = useState('en')
  const [mounted, setMounted] = useState(false)

  // Hydrate from localStorage once on client
  useEffect(() => {
    const saved = localStorage.getItem('addora_lang')
    if (saved === 'am' || saved === 'en') setLangState(saved)
    setMounted(true)
  }, [])

  // Inject Noto Sans Ethiopic from Google Fonts when switching to Amharic
  useEffect(() => {
    if (!mounted) return
    const id = 'noto-ethiopic-link'
    if (lang === 'am') {
      if (!document.getElementById(id)) {
        const link = document.createElement('link')
        link.id = id
        link.rel = 'stylesheet'
        link.href =
          'https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap'
        document.head.appendChild(link)
      }
      document.documentElement.setAttribute('lang', 'am')
      document.documentElement.style.setProperty('--font-ethiopic', "'Noto Sans Ethiopic', sans-serif")
    } else {
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.style.setProperty('--font-ethiopic', 'inherit')
    }
  }, [lang, mounted])

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem('addora_lang', l)
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'am' : 'en')
  }, [lang, setLang])

  // tr() — translate a key
  const dict = translations[lang] ?? translations.en
  const tr = useCallback(
    (key) => dict[key] ?? translations.en[key] ?? key,
    [dict]
  )

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, tr, mounted }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
