'use client'

import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'
import { useLang } from '../lib/lang'

export default function Footer() {
  const { tr } = useLang()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Addora"
              width={28}
              height={28}
              className={styles.logoImg}
            />
            <span>Addora</span>
          </div>
          <p>{tr('footerTagline')}</p>
          <div className={styles.codBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {tr('footerCodBadge')}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{tr('footerShopHeading')}</h4>
            <Link href="/">{tr('footerAllProducts')}</Link>
            <Link href="/?cat=kids">{tr('footerKidsClothing')}</Link>
            <Link href="/cart">{tr('footerMyCart')}</Link>
            <Link href="/orders">{tr('footerMyOrders')}</Link>
          </div>

          <div className={styles.col}>
            <h4>{tr('footerDeliveryHeading')}</h4>
            <p>{tr('footerDeliveryAddis')}</p>
            <p>{tr('footerDeliveryOther')}</p>
            <p>{tr('footerPayOnReceive')}</p>
            <p>{tr('footerFreeReturns')}</p>
          </div>

          <div className={styles.col}>
            <h4>{tr('footerContactHeading')}</h4>
            <a href="tel:+251926635307">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>{tr('footerContactCity')}</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>{tr('footerCopyright')}</p>
        <div className={styles.bottomLinks}>
          <Link href="/privacy">{tr('privacyFooter')}</Link>
          <Link href="/terms">{tr('termsFooter')}</Link>
          <Link href="/refund-policy">{tr('refundLink')}</Link>
        </div>
      </div>
    </footer>
  )
}
