'use client'
// lib/lang.js
// Usage:
//   import { useLang } from '../../lib/lang'
//   const { tr, lang, toggle } = useLang()
//   <p>{tr('flash_sale')}</p>

import { createContext, useContext, useState, useEffect } from 'react'
import { t } from './translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')

  // Persist language choice across sessions
  useEffect(() => {
    const saved = localStorage.getItem('addora_lang')
    if (saved === 'am' || saved === 'en') setLang(saved)
  }, [])

  const toggle = () => {
    const next = lang === 'en' ? 'am' : 'en'
    setLang(next)
    localStorage.setItem('addora_lang', next)
    // Switch document font for Amharic — Noto Sans Ethiopic
    document.documentElement.lang = next === 'am' ? 'am' : 'en'
  }

  // Translation function — falls back to English if key missing
  const tr = (key) => t[lang]?.[key] ?? t['en']?.[key] ?? key

  return (
    <LangContext.Provider value={{ lang, toggle, tr }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}