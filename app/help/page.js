'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLang } from '../../lib/lang'
import styles from '../SharedPage.module.css'

export default function HelpPage() {
  const [open, setOpen] = useState(null)
  const { tr } = useLang()

  const faqs = [
    { q: tr('faqQ1'), a: tr('faqA1') },
    { q: tr('faqQ2'), a: tr('faqA2') },
    { q: tr('faqQ3'), a: tr('faqA3') },
    { q: tr('faqQ4'), a: tr('faqA4') },
    { q: tr('faqQ5'), a: tr('faqA5') },
    { q: tr('faqQ6'), a: tr('faqA6') },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>

          {tr('account')}
        </Link>

        <span className={styles.topBarSep}>›</span>

        <span className={styles.topBarTitle}>
          {tr('helpCenterTitle')}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>💬</span>

          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              {tr('helpCenterTitle')}
            </h1>

            <p className={styles.heroSub}>
              {tr('helpCenterSub')}
            </p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>
              {tr('faqTitle')}
            </p>
          </div>

          <div className={styles.faq}>
            {faqs.map((f, i) => (
              <div key={i} className={styles.faqItem}>
                <button
                  className={styles.faqQ}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {f.q}

                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{
                      transform: open === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {open === i && (
                  <div className={styles.faqA}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>
              {tr('stillNeedHelp')}
            </p>
          </div>

          {[
            {
              icon: '📞',
              label: tr('callUs'),
              sub: '+251 926 635 307',
              href: 'tel:+251926635307',
            },
            {
              icon: '✉️',
              label: tr('emailSupport'),
              sub: 'support@addora.com.et',
              href: 'mailto:support@addora.com.et',
            },
            {
              icon: '💬',
              label: tr('contactForm'),
              sub: tr('sendUsAMessage'),
              href: '/contact',
            },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className={styles.row}
              style={{ textDecoration: 'none' }}
            >
              <div className={styles.rowIcon}>
                {item.icon}
              </div>

              <div className={styles.rowText}>
                <div className={styles.rowLabel}>
                  {item.label}
                </div>

                <div className={styles.rowSub}>
                  {item.sub}
                </div>
              </div>

              <svg
                className={styles.rowChevron}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
