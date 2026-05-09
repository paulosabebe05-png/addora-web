'use client'
import Link from 'next/link'
import { useState } from 'react'
import styles from '../SharedPage.module.css'

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Account
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>Contact Us</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>📞</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Contact Us</h1>
            <p className={styles.heroSub}>We usually respond within a few hours</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><p className={styles.cardTitle}>Reach Us Directly</p></div>
          {[
            { icon: '📞', label: 'Phone', sub: '+251 926 635 307', href: 'tel:+251926635307' },
            { icon: '✉️', label: 'Email', sub: 'support@addora.com.et', href: 'mailto:support@addora.com.et' },
            { icon: '🌐', label: 'Website', sub: 'addora.com.et', href: 'https://addora.com.et' },
          ].map(item => (
            <a key={item.label} href={item.href} className={styles.row} style={{ textDecoration: 'none' }}>
              <div className={styles.rowIcon}>{item.icon}</div>
              <div className={styles.rowText}>
                <div className={styles.rowLabel}>{item.label}</div>
                <div className={styles.rowSub}>{item.sub}</div>
              </div>
            </a>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><p className={styles.cardTitle}>Send a Message</p></div>
          {sent ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>✅</span>
              <h2 className={styles.emptyTitle}>Message Sent!</h2>
              <p className={styles.emptySub}>We will get back to you within 24 hours.</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} type="text" placeholder="Your name" required />
              </div>
              <div>
                <label className={styles.label}>Email or Phone</label>
                <input className={styles.input} type="text" placeholder="your@email.com or +251..." required />
              </div>
              <div>
                <label className={styles.label}>Subject</label>
                <input className={styles.input} type="text" placeholder="What is this about?" required />
              </div>
              <div>
                <label className={styles.label}>Message</label>
                <textarea className={styles.textarea} placeholder="Tell us how we can help..." required />
              </div>
              <button type="submit" className={styles.submitBtn}>Send Message →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}