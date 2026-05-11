'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '../../lib/lang'
import styles from './Footer.module.css'

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
            {tr('cashOnDelivery')}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{tr('shop')}</h4>
            <Link href="/">{tr('allProducts')}</Link>
            <Link href="/?cat=kids">{tr('kidsClothing')}</Link>
            <Link href="/cart">{tr('myCart')}</Link>
            <Link href="/orders">{tr('myOrders')}</Link>
          </div>

          <div className={styles.col}>
            <h4>{tr('delivery')}</h4>
            <p>{tr('addisDelivery')}</p>
            <p>{tr('otherCitiesDelivery')}</p>
            <p>{tr('payOnReceive')}</p>
            <p>{tr('freeReturns')}</p>
          </div>

          <div className={styles.col}>
            <h4>{tr('contact')}</h4>
            <a href="tel:+251926635307">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} {tr('footerCopyright')}</p>
        <div className={styles.bottomLinks}>
          <Link href="/privacy">{tr('privacyPolicy')}</Link>
          <Link href="/terms">{tr('termsOfService')}</Link>
          <Link href="/refund-policy">{tr('refundPolicy')}</Link>
        </div>
      </div>
    </footer>
  )
}
