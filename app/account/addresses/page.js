'use client'
import Link from 'next/link'
import { useLang } from '../../../lib/lang'
import styles from '../../SharedPage.module.css'

export default function AddressesPage() {
  const { tr } = useLang()

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
        <span className={styles.topBarTitle}>{tr('addressesLink')}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>📍</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{tr('deliveryAddressesTitle')}</h1>
            <p className={styles.heroSub}>{tr('deliveryAddressesSub')}</p>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <p className={styles.cardTitle}>{tr('savedAddresses')}</p>
          </div>
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🏠</span>
            <h2 className={styles.emptyTitle}>{tr('noAddressesSaved')}</h2>
            <p className={styles.emptySub}>{tr('addAddressFaster')}</p>
          </div>
          <button className={styles.addBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {tr('addNewAddress')}
          </button>
        </div>
      </div>
    </div>
  )
}
