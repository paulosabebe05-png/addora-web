'use client'
// components/ui/LangToggle.js

import { useLang } from '../../lib/lang'
import styles from './LangToggle.module.css'

export default function LangToggle() {
  const { lang, toggle } = useLang()
  return (
    <button className={styles.toggle} onClick={toggle} aria-label="Toggle language">
      <span className={`${styles.opt} ${lang === 'en' ? styles.active : ''}`}>EN</span>
      <span className={styles.divider}>|</span>
      <span className={`${styles.opt} ${lang === 'am' ? styles.active : ''}`}>አማ</span>
    </button>
  )
}