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

        {/* Brand */}
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

          <p>{tr('footerBrandDesc')}</p>

          <div className={styles.codBadge}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>

            {tr('footerCOD')}
          </div>
        </div>

        {/* Links */}
        <div className={styles.links}>

          {/* Shop */}
          <div className={styles.col}>
            <h4>{tr('footerShop')}</h4>

            <Link href="/">
              {tr('footerAllProducts')}
            </Link>

            <Link href="/?cat=kids">
              {tr('footerKidsClothing')}
            </Link>

            <Link href="/cart">
              {tr('footerMyCart')}
            </Link>

            <Link href="/orders">
              {tr('footerMyOrders')}
            </Link>
          </div>

          {/* Delivery */}
          <div className={styles.col}>
            <h4>{tr('footerDelivery')}</h4>

            <p>{tr('footerDeliveryAddis')}</p>
            <p>{tr('footerDeliveryCities')}</p>
            <p>{tr('footerPayReceive')}</p>
            <p>{tr('footerFreeReturns')}</p>
          </div>

          {/* Contact */}
          <div className={styles.col}>
            <h4>{tr('footerContact')}</h4>

            <a href="tel:+251926635307">
              +251 926 635 307
            </a>

            <a href="mailto:addora@addora.com.et">
              addora@addora.com.et
            </a>

            <p>{tr('footerLocation')}</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className={styles.bottom}>
        <p>
          © {new Date().getFullYear()} Addora Technology PLC.{' '}
          {tr('footerRights')}
        </p>

        <div className={styles.bottomLinks}>
          <Link href="/privacy">
            {tr('footerPrivacy')}
          </Link>

          <Link href="/terms">
            {tr('footerTerms')}
          </Link>

          <Link href="/refund-policy">
            {tr('footerRefund')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
