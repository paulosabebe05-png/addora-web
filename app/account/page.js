'use client'
import Link from 'next/link'
import { useAuth } from '../../lib/auth'
import styles from './AccountPage.module.css'

export default function AccountPage() {
  const { user, signOut } = useAuth()

  const accountLinks = [
    {
      group: 'My Account',
      items: [
        { href: '/orders',                label: 'My Orders',        desc: 'Track, return or buy again',    icon: '📦' },
        { href: '/wishlist',              label: 'Wishlist',         desc: 'Saved items for later',         icon: '❤️' },
        { href: '/account/addresses',     label: 'Addresses',        desc: 'Delivery addresses',            icon: '📍' },
        { href: '/account/payment',       label: 'Payment Methods',  desc: 'Telebirr, CBE Birr & more',     icon: '💳' },
        { href: '/notifications',         label: 'Notifications',    desc: 'Manage alerts',                 icon: '🔔' },
      ],
    },
    {
      group: 'Help & Legal',
      items: [
        { href: '/help',           label: 'Help Center',     desc: 'FAQs and support',          icon: '💬' },
        { href: '/contact',        label: 'Contact Us',      desc: 'Get in touch with us',       icon: '📞' },
        { href: '/refund-policy',  label: 'Refund & Returns',desc: 'Our return policy',          icon: '🔄' },
        { href: '/privacy',        label: 'Privacy Policy',  desc: 'How we use your data',       icon: '🔒' },
        { href: '/terms',          label: 'Terms of Service',desc: 'Terms and conditions',       icon: '📋' },
        { href: '/about',          label: 'About Addora',    desc: 'Our story and mission',      icon: 'ℹ️' },
      ],
    },
  ]

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initial     = (user?.email?.[0] ?? 'U').toUpperCase()

  return (
    <div className={styles.page}>

      {/* ── Mobile-only gradient header ── */}
      <div className={styles.mobileHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Account</h1>
          {user ? (
            <div className={styles.userCard}>
              <div className={styles.avatar}>{initial}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{displayName}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
              <Link href="/account/edit" className={styles.editBtn}>Edit</Link>
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
                <span className={styles.guestTitle}>Welcome to Addora</span>
                <span className={styles.guestSub}>Sign in to access your account</span>
              </div>
              <div className={styles.authButtons}>
                <Link href="/auth/signin" className={styles.signInBtn}>Sign In</Link>
                <Link href="/auth/signup" className={styles.signUpBtn}>Register</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile stats bar ── */}
      {user && (
        <div className={`${styles.statsBar} ${styles.mobileOnly}`}>
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>Orders</span></div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>Wishlist</span></div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}><span className={styles.statNum}>0</span><span className={styles.statLabel}>Reviews</span></div>
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
                <p className={styles.sidebarEmail}>{user.email}</p>
                <Link href="/account/edit" className={styles.sidebarEditBtn}>Edit Profile</Link>
              </>
            ) : (
              <>
                <h2 className={styles.sidebarName}>Welcome!</h2>
                <p className={styles.sidebarEmail}>Sign in to manage your account</p>
                <div className={styles.sidebarAuthBtns}>
                  <Link href="/auth/signin" className={styles.sidebarSignIn}>Sign In</Link>
                  <Link href="/auth/signup" className={styles.sidebarSignUp}>Register</Link>
                </div>
              </>
            )}
          </div>

          {/* Stats */}
          {user && (
            <div className={styles.sidebarStats}>
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>Orders</span>
              </div>
              <div className={styles.sidebarStatDivider} />
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>Wishlist</span>
              </div>
              <div className={styles.sidebarStatDivider} />
              <div className={styles.sidebarStat}>
                <span className={styles.sidebarStatNum}>0</span>
                <span className={styles.sidebarStatLabel}>Reviews</span>
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
              Sign Out
            </button>
          )}
        </aside>

        {/* ── Right content ── */}
        <main className={styles.mainContent}>

          {/* Affiliate banner */}
          <div className={styles.affiliateBanner}>
            <div className={styles.affiliateLeft}>
              <span className={styles.affiliateEarn}>Earn with Addora</span>
              <span className={styles.affiliateDesc}>Share products &amp; earn on every sale</span>
            </div>
            <Link href="/affiliates" className={styles.affiliateJoin}>Join →</Link>
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
            <span className={styles.footerSub}>© 2025 Addora Technology PLC · Addis Ababa, Ethiopia</span>
            <div className={styles.footerLinks}>
              <Link href="/privacy">Privacy</Link>
              <span>·</span>
              <Link href="/terms">Terms</Link>
              <span>·</span>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile-only sections (below header) ── */}
      <div className={styles.mobileSections}>
        <div className={styles.affiliateBanner}>
          <div className={styles.affiliateLeft}>
            <span className={styles.affiliateEarn}>Earn with Addora</span>
            <span className={styles.affiliateDesc}>Share products &amp; earn on every sale</span>
          </div>
          <Link href="/affiliates" className={styles.affiliateJoin}>Join →</Link>
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
            Sign Out
          </button>
        )}

        <div className={styles.footer}>
          <span className={styles.footerLogo}>Addora</span>
          <span className={styles.footerSub}>© 2025 Addora Technology PLC · Addis Ababa, Ethiopia</span>
          <div className={styles.footerLinks}>
            <Link href="/privacy">Privacy</Link>
            <span>·</span>
            <Link href="/terms">Terms</Link>
            <span>·</span>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div className={styles.bottomPad} />
      </div>

    </div>
  )
}
