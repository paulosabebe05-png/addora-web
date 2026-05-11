'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useLang } from '../../lib/lang'
import styles from '../SharedPage.module.css'

const faqs = [
  { q: 'How do I track my order?', a: 'Go to My Orders from your account page. Each order shows real-time status, estimated delivery, and tracking details.' },
  { q: 'What payment methods are accepted?', a: 'We accept Telebirr, CBE Birr, and Cash on Delivery for all orders across Addis Ababa and nearby regions.' },
  { q: 'How long does delivery take?', a: 'Standard delivery within Addis Ababa takes 1–3 business days. We will notify you once your order is on its way.' },
  { q: 'How do I return or exchange an item?', a: 'You can request a return within 7 days of delivery. Go to My Orders, select the order, and tap "Return". Our team will arrange a pickup.' },
  { q: 'Is Cash on Delivery available everywhere?', a: 'Cash on Delivery is currently available in Addis Ababa. We are expanding to other cities soon.' },
  { q: 'How do I cancel my order?', a: 'Orders can be cancelled within 1 hour of placing them. Go to My Orders and select "Cancel Order". After dispatch, cancellation is no longer possible.' },
]

export default function HelpPage() {
  const [open, setOpen] = useState(null)
  const { tr } = useLang()
  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Account
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>Help Center</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>💬</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>Help Center</h1>
            <p className={styles.heroSub}>Find answers to common questions</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Frequently Asked Questions</p>
          </div>
          <div className={styles.faq}>
            {faqs.map((f, i) => (
              <div key={i} className={styles.faqItem}>
                <button className={styles.faqQ} onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {open === i && <div className={styles.faqA}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>Still Need Help?</p>
          </div>
          {[
            { icon: '📞', label: 'Call Us', sub: '+251 926 635 307', href: 'tel:+251926635307' },
            { icon: '✉️', label: 'Email Support', sub: 'support@addora.com.et', href: 'mailto:support@addora.com.et' },
            { icon: '💬', label: 'Contact Form', sub: 'Send us a message', href: '/contact' },
          ].map(item => (
            <a key={item.label} href={item.href} className={styles.row} style={{ textDecoration: 'none' }}>
              <div className={styles.rowIcon}>{item.icon}</div>
              <div className={styles.rowText}>
                <div className={styles.rowLabel}>{item.label}</div>
                <div className={styles.rowSub}>{item.sub}</div>
              </div>
              <svg className={styles.rowChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
