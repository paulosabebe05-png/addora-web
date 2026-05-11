'use client'
// components/ui/LangToggle.js

import { useState, useEffect } from 'react'
import { useLang } from '../../lib/lang'
import styles from './LangToggle.module.css'

export default function LangToggle({ transparent = false }) {
  const { lang, toggleLang } = useLang()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Render a placeholder the same size to avoid layout shift
  if (!mounted) {
    return <span className={`${styles.toggle} ${styles.placeholder}`} aria-hidden="true" />
  }

  const isEn = lang === 'en'

  return (
    <button
      className={`${styles.toggle} ${transparent ? styles.transparent : styles.solid}`}
      onClick={toggleLang}
      aria-label={isEn ? 'Switch to Amharic' : 'Switch to English'}
    >
      <span className={`${styles.label} ${isEn ? styles.active : ''}`}>EN</span>
      <span className={styles.divider}>|</span>
      <span className={`${styles.label} ${styles.amharic} ${!isEn ? styles.active : ''}`}>አማ</span>
    </button>
  )
}
