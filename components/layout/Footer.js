'use client'
import Link from 'next/link'
import Image from 'next/image'
import styles from './Footer.module.css'
import { useLang } from '../../lib/lang'

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
          <p>{tr('footer_tagline')}</p>
          <div className={styles.codBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {tr('footer_cod')}
          </div>
        </div>

        <div className={styles.links}>
          <div className={styles.col}>
            <h4>{tr('footer_shop')}</h4>
            <Link href="/">{tr('footer_all_products')}</Link>
            <Link href="/?cat=kids">{tr('footer_kids_clothing')}</Link>
            <Link href="/cart">{tr('footer_my_cart')}</Link>
            <Link href="/orders">{tr('footer_my_orders')}</Link>
          </div>
          <div className={styles.col}>
            <h4>{tr('footer_delivery')}</h4>
            <p>{tr('footer_delivery_addis')}</p>
            <p>{tr('footer_delivery_other')}</p>
            <p>{tr('footer_delivery_pay')}</p>
            <p>{tr('footer_delivery_returns')}</p>
          </div>
          <div className={styles.col}>
            <h4>{tr('footer_contact')}</h4>
            <a href="tel:+251926635307">+251 926 635 307</a>
            <a href="mailto:addora@addora.com.et">addora@addora.com.et</a>
            <p>{tr('footer_location')}</p>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>{tr('footer_copyright').replace('{year}', new Date().getFullYear())}</p>
        <div className={styles.bottomLinks}>
          <Link href="/privacy">{tr('footer_privacy')}</Link>
          <Link href="/terms">{tr('footer_terms')}</Link>
          <Link href="/refund-policy">{tr('footer_refund')}</Link>
        </div>
      </div>
    </footer>
  )
}
