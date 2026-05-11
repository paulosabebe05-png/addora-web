'use client'
import Link from 'next/link'
import { useLang } from '../../lib/lang'
import styles from '../SharedPage.module.css'

export default function AboutPage() {
  const { tr } = useLang()

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          {tr('account')}
        </Link>
        <span className={styles.topBarSep}>›</span>
        <span className={styles.topBarTitle}>{tr('aboutTitle')}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>ℹ️</span>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>{tr('aboutTitle')}</h1>
            <p className={styles.heroSub}>{tr('aboutSub')}</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>10K+</span>
            <span className={styles.statBoxLabel}>{tr('statProducts')}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>1–3</span>
            <span className={styles.statBoxLabel}>{tr('statDayDelivery')}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statBoxNum}>100%</span>
            <span className={styles.statBoxLabel}>{tr('statVerified')}</span>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}><p className={styles.cardTitle}>{tr('ourStory')}</p></div>
          <div className={styles.prose}>
            <h2>{tr('aboutHeadline')}</h2>
            <p>{tr('aboutP1')}</p>
            <p>{tr('aboutP2')}</p>
            <h2>{tr('whyAddora')}</h2>
            <ul>
              <li>{tr('aboutBullet1')}</li>
              <li>{tr('aboutBullet2')}</li>
              <li>{tr('aboutBullet3')}</li>
              <li>{tr('aboutBullet4')}</li>
              <li>{tr('aboutBullet5')}</li>
            </ul>
            <h2>{tr('contactUsLink')}</h2>
            <p>📞 +251 926 635 307 &nbsp;·&nbsp; ✉️ support@addora.com.et &nbsp;·&nbsp; 🌐 addora.com.et</p>
            <p style={{ color: '#bbb', fontSize: '12px', marginTop: '20px' }}>{tr('footerCopyright')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
