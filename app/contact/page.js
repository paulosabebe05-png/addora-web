'use client'
import Link from 'next/link'
import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { useLang } from '../../lib/lang'
import styles from '../SharedPage.module.css'

const EMAILJS_SERVICE_ID  = 'service_2dfyujd'
const EMAILJS_TEMPLATE_ID = 'template_v3umwfu'
const EMAILJS_PUBLIC_KEY  = '2yREi3p2GpqFfOIdS'

export default function ContactPage() {
  const { tr } = useLang()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')

    const form = e.target
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name:    form[0].value,
          email:   form[1].value,
          subject: form[2].value,
          message: form[3].value,
        },
        EMAILJS_PUBLIC_KEY
      )
      setSent(true)
    } catch {
      setError(tr('contactFailedError'))
    }
    setSending(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {tr('account')}
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>{tr('contactTitle')}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>📞</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{tr('contactTitle')}</h1>
            <p className={styles.heroSub}>{tr('contactSub')}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><p className={styles.cardTitle}>{tr('reachUsDirectly')}</p></div>
          {[
            { icon: '📞', label: tr('contactPhone'), sub: '+251 926 635 307', href: 'tel:+251926635307' },
            { icon: '✉️', label: tr('contactEmail'), sub: 'support@addora.com.et', href: 'mailto:support@addora.com.et' },
            { icon: '🌐', label: tr('contactWebsite'), sub: 'addora.com.et', href: 'https://addora.com.et' },
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
          <div className={styles.cardHeader}><p className={styles.cardTitle}>{tr('sendAMessage')}</p></div>
          {sent ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>✅</span>
              <h2 className={styles.emptyTitle}>{tr('messageSentTitle')}</h2>
              <p className={styles.emptySub}>{tr('messageSentSub')}</p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div>
                <label className={styles.label}>{tr('contactFullName')}</label>
                <input className={styles.input} type="text" placeholder={tr('contactNamePlaceholder')} required />
              </div>
              <div>
                <label className={styles.label}>{tr('contactEmailPhone')}</label>
                <input className={styles.input} type="text" placeholder={tr('contactEmailPlaceholder')} required />
              </div>
              <div>
                <label className={styles.label}>{tr('contactSubject')}</label>
                <input className={styles.input} type="text" placeholder={tr('contactSubjectPlaceholder')} required />
              </div>
              <div>
                <label className={styles.label}>{tr('contactMessage')}</label>
                <textarea className={styles.textarea} placeholder={tr('contactMessagePlaceholder')} required />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={sending}>
                {sending ? tr('contactSending') : tr('contactSendBtn')}
              </button>
              {error && <p style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
