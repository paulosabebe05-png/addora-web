'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '../../lib/lang'
import styles from './Footer.module.css'

export default function Footer() {
  const { t } = useLang()

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
          <p>Ethiopia's trusted local eCommerce platform. Shop confidently, pay when delivered.</p>
          <div className={styles.codBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {t('cashOnDeliveryFull')}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{t('shop')}</h4>
            <Link href="/">{t('sectionAllProductsTitle')}</Link>
            <Link href="/?cat=kids">{t('catKids')} Clothing</Link>
            <Link href="/cart">{t('myCart')}</Link>
            <Link href="/orders">{t('myOrders')}</Link>
          </div>

          <div className={styles.col}>
            <h4>Delivery</h4>
            <p>Addis Ababa: 1–2 days</p>
            <p>Other cities: 3–5 days</p>
            <p>{t('cashOnDeliveryFull')}</p>
            <p>{t('trustReturnSub')}</p>
          </div>

          <div className={styles.col}>
            <h4>Contact</h4>
            <a href="tel:+251926635307">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>Addis Ababa, Ethiopia</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>{t('footerCopyright')}</p>
        <div className={styles.bottomLinks}>
          <Link href="/privacy">{t('privacyFooter')}</Link>
          <Link href="/terms">{t('termsFooter')}</Link>
          <Link href="/refund-policy">Refund Policy</Link>
        </div>
      </div>
    </footer>
  )
}
