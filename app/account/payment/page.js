'use client'
import Link from 'next/link'
import { useLang } from '../../../lib/lang'
import styles from '../../SharedPage.module.css'

export default function PaymentPage() {
  const { tr } = useLang()

  const methods = [
    { icon: '📱', labelKey: 'telebirrLabel', subKey: 'telebirrSub' },
    { icon: '🏦', labelKey: 'cbeBirrLabel',  subKey: 'cbeBirrSub' },
    { icon: '💵', labelKey: 'codArrivesLabel', subKey: 'codArrivesSub' },
  ]

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
        <span className={styles.topBarTitle}>{tr('paymentMethodsTitle')}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>💳</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{tr('paymentMethodsTitle')}</h1>
            <p className={styles.heroSub}>{tr('paymentMethodsSub')}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>{tr('acceptedPayments')}</p>
          </div>
          {methods.map(m => (
            <div key={m.labelKey} className={styles.row}>
              <div className={styles.rowIcon}>{m.icon}</div>
              <div className={styles.rowText}>
                <div className={styles.rowLabel}>{tr(m.labelKey)}</div>
                <div className={styles.rowSub}>{tr(m.subKey)}</div>
              </div>
              <svg className={styles.rowChevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>{tr('savedPaymentInfo')}</p>
          </div>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>💳</span>
            <h2 className={styles.emptyTitle}>{tr('noSavedPaymentInfo')}</h2>
            <p className={styles.emptySub}>{tr('savedPaymentInfoSub')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
