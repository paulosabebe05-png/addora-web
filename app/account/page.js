'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import { useLang } from '../../lib/lang'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { user, signOut } = useAuth()
  const { tr } = useLang()

  const accountLinks = [
    {
      group: tr('myAccount'),
      items: [
        { href: '/orders',            label: tr('myOrdersLink'),       desc: tr('myOrdersDesc'),       icon: '📦' },
        { href: '/wishlist',          label: tr('wishlistLink'),        desc: tr('wishlistDesc'),        icon: '❤️' },
        { href: '/account/addresses', label: tr('addressesLink'),       desc: tr('addressesDesc'),       icon: '📍' },
        { href: '/account/payment',   label: tr('paymentMethodsLink'),  desc: tr('paymentMethodsDesc'),  icon: '💳' },
        { href: '/notifications',     label: tr('notificationsLink'),   desc: tr('notificationsDesc'),   icon: '🔔' },
      ],
    },
    {
      group: tr('helpLegal'),
      items: [
        { href: '/help',          label: tr('helpCenterLink'),  desc: tr('helpCenterDesc'),  icon: '💬' },
        { href: '/contact',       label: tr('contactUsLink'),   desc: tr('contactUsDesc'),   icon: '📞' },
        { href: '/refund-policy', label: tr('refundLink'),      desc: tr('refundDesc'),      icon: '🔄' },
        { href: '/privacy',       label: tr('privacyLink'),     desc: tr('privacyDesc'),     icon: '🔒' },
        { href: '/terms',         label: tr('termsLink'),       desc: tr('termsDesc'),       icon: '📋' },
        { href: '/about',         label: tr('aboutLink'),       desc: tr('aboutDesc'),       icon: 'ℹ️' },
      ],
    },
  ]

  // `user` here is the flattened object from auth.js's toUser() —
  // { id, email, name, avatar_url, phone } — not a raw Supabase user,
  // so there's no `user_metadata` key to read from.
  const displayName = user?.name || 'User'
  const contactLine  = user?.email || user?.phone || ''
  const initial      = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  return (
    <div className={styles.page}>

      {/* ── Mobile-only gradient header ── */}
      <div className={styles.mobileHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>{tr('accountTitle')}</h1>
          {user ? (
            <div className={styles.userCard}>
              <div className={styles.avatar}>{initial}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{contactLine}</span>
              </div>
              <Link href="/account/edit" className={styles.editBtn}>{tr('edit')}</Link>
            </div>
          ) : (
            <div className={styles.guestCard}>
              <div className={styles.guestIcon}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className={styles.guestText}>
                <span className={styles.guestTitle}>{tr('welcomeToAddora')}</span>
                <span className={styles.guestSub}>{tr('signInToAccess')}</span>
              </div>
              <div className={styles.authButtons}>
                <Link href="/auth/signin" className={styles.signInBtn}>{tr('signIn')}</Link>
                <Link href="/auth/signup" className={styles.signUpBtn}>{tr('register')}</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile stats bar ── */}
      {user && (
        <div className={`${styles.statsBar} ${styles.mobileOnly}`}>
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>{tr('ordersLabel')}</span></div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>{tr('wishlistLabel')}</span></div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>{tr('reviewsLabel')}</span></div>
        </div>
      )}

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT
          ══════════════════════════════════════ */}
      <div className={styles.desktopLayout}>

        {/* ── Left sidebar ── */}
        <aside className={styles.sidebar}>

          {/* Profile card */}
          <div className={styles.sidebarProfile}>
            <div className={styles.sidebarAvatarRing}>
              {user ? (
                <div className={styles.sidebarAvatar}>{initial}</div>
              ) : (
                <div className={styles.sidebarAvatar}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              )}
            </div>

            {user ? (
              <>
                <h2 className={styles.sidebarName}>{displayName}</h2>
                <p className={styles.sidebarEmail}>{contactLine}</p>
                <Link href="/account/edit" className={styles.sidebarEditBtn}>{tr('editProfile')}</Link>
              </>
            ) : (
              <>
                <h2 className={styles.sidebarName}>{tr('welcomeToAddora')}</h2>
                <p className={styles.sidebarEmail}>{tr('signInToAccess')}</p>
                <div className={styles.sidebarAuthBtns}>
                  <Link href="/auth/signin" className={styles.sidebarSignIn}>{tr('signIn')}</Link>
                  <Link href="/auth/signup" className={styles.sidebarSignUp}>{tr('register')}</Link>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          {user && (
            <div className={styles.sidebarStats}>
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>{tr('ordersLabel')}</span>
              </div>
              <div className={styles.sidebarStatDivider} />
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>{tr('wishlistLabel')}</span>
              </div>
              <div className={styles.sidebarStatDivider} />
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>{tr('reviewsLabel')}</span>
              </div>
            </div>
          )}

          {/* Quick nav */}
          <nav className={styles.sidebarNav}>
            {accountLinks.map(group => (
              <div key={group.group} className={styles.sidebarNavGroup}>
                <span className={styles.sidebarNavLabel}>{group.group}</span>
                {group.items.map(item => (
                  <Link key={item.href} href={item.href} className={styles.sidebarNavItem}>
                    <span className={styles.sidebarNavIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    <svg className={styles.chevron} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          {/* Sign out */}
          {user && (
            <button className={styles.sidebarSignOut} onClick={signOut}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {tr('signOut')}
            </button>
          )}
        </aside>

        {/* ── Right content ── */}
        <main className={styles.mainContent}>

          {/* Affiliate banner */}
          <div className={styles.affiliateBanner}>
            <div className={styles.affiliateLeft}>
              <span className={styles.affiliateEarn}>{tr('earnWithAddora')}</span>
              <span className={styles.affiliateDesc}>{tr('earnDesc')}</span>
            </div>
            <Link href="/affiliates" className={styles.affiliateJoin}>{tr('joinAffiliate')}</Link>
          </div>

          {/* Link groups */}
          <div className={styles.sections}>
            {accountLinks.map((group) => (
              <div key={group.group} className={styles.group}>
                <span className={styles.groupLabel}>{group.group}</span>
                <div className={styles.groupCard}>
                  {group.items.map((item) => (
                    <Link key={item.href} href={item.href} className={styles.linkRow}>
                      <span className={styles.linkIcon}>{item.icon}</span>
                      <div className={styles.linkText}>
                        <span className={styles.linkLabel}>{item.label}</span>
                        <span className={styles.linkDesc}>{item.desc}</span>
                      </div>
                      {item.badge && <span className={styles.badge}>{item.badge}</span>}
                      <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <span className={styles.footerLogo}>Addora</span>
            <span className={styles.footerSub}>{tr('footerCopyright')}</span>
            <div className={styles.footerLinks}>
              <Link href="/privacy">{tr('privacyFooter')}</Link>
              <span>·</span>
              <Link href="/terms">{tr('termsFooter')}</Link>
              <span>·</span>
              <Link href="/contact">{tr('contactFooter')}</Link>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile-only sections (below header) ── */}
      <div className={styles.mobileSections}>
        <div className={styles.affiliateBanner}>
          <div className={styles.affiliateLeft}>
            <span className={styles.affiliateEarn}>{tr('earnWithAddora')}</span>
            <span className={styles.affiliateDesc}>{tr('earnDesc')}</span>
          </div>
          <Link href="/affiliates" className={styles.affiliateJoin}>{tr('joinAffiliate')}</Link>
        </div>

        <div className={styles.sections}>
          {accountLinks.map((group) => (
            <div key={group.group} className={styles.group}>
              <span className={styles.groupLabel}>{group.group}</span>
              <div className={styles.groupCard}>
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} className={styles.linkRow}>
                    <span className={styles.linkIcon}>{item.icon}</span>
                    <div className={styles.linkText}>
                      <span className={styles.linkLabel}>{item.label}</span>
                      <span className={styles.linkDesc}>{item.desc}</span>
                    </div>
                    {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    <svg className={styles.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {user && (
          <button className={styles.signOutBtn} onClick={signOut}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {tr('signOut')}
          </button>
        )}

        <div className={styles.footer}>
          <span className={styles.footerLogo}>Addora</span>
          <span className={styles.footerSub}>{tr('footerCopyright')}</span>
          <div className={styles.footerLinks}>
            <Link href="/privacy">{tr('privacyFooter')}</Link>
            <span>·</span>
            <Link href="/terms">{tr('termsFooter')}</Link>
            <span>·</span>
            <Link href="/contact">{tr('contactFooter')}</Link>
          </div>
        </div>
        <div className={styles.bottomPad} />
      </div>

    </div>
  )
}
