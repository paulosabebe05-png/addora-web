import React, { useState, useEffect } from 'react';

const AccountPage = () => {
  const [isLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      color: '#FF6B35',
      bg: '#FFF0EB',
      title: 'My Orders',
      subtitle: 'Track, return or buy again',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      ),
      color: '#E8335A',
      bg: '#FFF0F3',
      title: 'Wishlist',
      subtitle: 'Saved items for later',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      color: '#FF6B35',
      bg: '#FFF0EB',
      title: 'Addresses',
      subtitle: 'Delivery addresses',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
          <line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
      ),
      color: '#F5A623',
      bg: '#FFF8EC',
      title: 'Payment Methods',
      subtitle: 'Telebirr, CBE Birr & more',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10"/>
          <path d="M12 20V4"/>
          <path d="M6 20v-6"/>
        </svg>
      ),
      color: '#7B5CF5',
      bg: '#F3F0FF',
      title: 'My Points',
      subtitle: 'View & redeem your rewards',
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        </svg>
      ),
      color: '#10B981',
      bg: '#ECFDF5',
      title: 'Notifications',
      subtitle: 'Manage alerts & updates',
    },
  ];

  const helpItems = [
    { title: 'Help Center', subtitle: 'FAQs & support articles' },
    { title: 'Contact Us', subtitle: 'Chat, email or call us' },
    { title: 'Return & Refund Policy', subtitle: 'How returns & refunds work' },
    { title: 'Privacy Policy', subtitle: 'How we use your data' },
    { title: 'Terms of Service', subtitle: 'Rules & agreements' },
  ];

  const styles = {
    page: {
      fontFamily: "'DM Sans', 'Nunito', 'Helvetica Neue', Arial, sans-serif",
      background: '#F4F5F7',
      minHeight: '100vh',
      maxWidth: '430px',
      margin: '0 auto',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '80px',
    },
    // FIXED HEADER - no overlap
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : '0 1px 0 #f0f0f0',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'box-shadow 0.3s',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    logo: {
      width: '36px',
      height: '36px',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: '17px',
      fontWeight: '800',
      color: '#1A1A2E',
      letterSpacing: '-0.5px',
    },
    searchBar: {
      flex: 1,
      margin: '0 12px',
      background: '#F4F5F7',
      borderRadius: '12px',
      padding: '9px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      border: '1.5px solid #EBEBEB',
    },
    searchText: {
      fontSize: '14px',
      color: '#9CA3AF',
      fontWeight: '400',
    },
    cartBtn: {
      width: '36px',
      height: '36px',
      background: '#FFF0EB',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: 'pointer',
    },

    // HERO SECTION - no overlap with header since header is sticky
    hero: {
      background: 'linear-gradient(160deg, #FF6B35 0%, #E8452C 60%, #C73B1F 100%)',
      padding: '28px 20px 36px',
      position: 'relative',
      overflow: 'hidden',
    },
    heroDecor1: {
      position: 'absolute',
      top: '-30px',
      right: '-30px',
      width: '160px',
      height: '160px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.07)',
    },
    heroDecor2: {
      position: 'absolute',
      bottom: '-50px',
      right: '60px',
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
    },
    heroDecor3: {
      position: 'absolute',
      top: '20px',
      left: '-20px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.06)',
    },
    avatarWrapper: {
      width: '68px',
      height: '68px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.18)',
      border: '2px solid rgba(255,255,255,0.35)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '14px',
      backdropFilter: 'blur(8px)',
    },
    heroTitle: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#fff',
      marginBottom: '4px',
      letterSpacing: '-0.5px',
    },
    heroSubtitle: {
      fontSize: '14px',
      color: 'rgba(255,255,255,0.8)',
      marginBottom: '20px',
      fontWeight: '400',
    },
    btnRow: {
      display: 'flex',
      gap: '10px',
    },
    signInBtn: {
      flex: 1,
      padding: '12px 0',
      borderRadius: '14px',
      background: '#fff',
      color: '#FF6B35',
      fontWeight: '700',
      fontSize: '15px',
      border: 'none',
      cursor: 'pointer',
      letterSpacing: '-0.2px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      transition: 'transform 0.15s, box-shadow 0.15s',
    },
    registerBtn: {
      flex: 1,
      padding: '12px 0',
      borderRadius: '14px',
      background: 'rgba(255,255,255,0.18)',
      color: '#fff',
      fontWeight: '700',
      fontSize: '15px',
      border: '1.5px solid rgba(255,255,255,0.45)',
      cursor: 'pointer',
      letterSpacing: '-0.2px',
      backdropFilter: 'blur(8px)',
      transition: 'transform 0.15s',
    },

    // EARN BANNER
    earnBanner: {
      margin: '16px',
      background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
      borderRadius: '18px',
      padding: '18px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 8px 24px rgba(26,26,46,0.18)',
      position: 'relative',
      overflow: 'hidden',
    },
    earnBannerDecor: {
      position: 'absolute',
      top: '-20px',
      right: '100px',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'rgba(255,107,53,0.12)',
    },
    earnLeft: {},
    earnLabel: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#FF6B35',
      letterSpacing: '0.5px',
      marginBottom: '3px',
      textTransform: 'uppercase',
    },
    earnTitle: {
      fontSize: '16px',
      fontWeight: '800',
      color: '#fff',
      marginBottom: '3px',
      letterSpacing: '-0.3px',
    },
    earnSubtitle: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.55)',
    },
    joinBtn: {
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '10px 18px',
      fontSize: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 12px rgba(255,107,53,0.4)',
    },

    // SECTION
    section: {
      margin: '0 16px 8px',
    },
    sectionLabel: {
      fontSize: '11px',
      fontWeight: '800',
      color: '#9CA3AF',
      letterSpacing: '1.2px',
      textTransform: 'uppercase',
      marginBottom: '10px',
      marginLeft: '2px',
    },
    card: {
      background: '#fff',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    },
    menuItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '15px 18px',
      borderBottom: '1px solid #F9FAFB',
      cursor: 'pointer',
      transition: 'background 0.15s',
      gap: '14px',
    },
    menuItemLast: {
      borderBottom: 'none',
    },
    iconBox: (color, bg) => ({
      width: '44px',
      height: '44px',
      borderRadius: '13px',
      background: bg,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    menuText: {
      flex: 1,
    },
    menuTitle: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#1A1A2E',
      marginBottom: '2px',
      letterSpacing: '-0.2px',
    },
    menuSubtitle: {
      fontSize: '12.5px',
      color: '#9CA3AF',
      fontWeight: '400',
    },
    chevron: {
      color: '#D1D5DB',
    },

    // HELP ITEMS
    helpItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 18px',
      borderBottom: '1px solid #F9FAFB',
      cursor: 'pointer',
      gap: '12px',
    },
    helpDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #FF6B35, #FF8C42)',
      flexShrink: 0,
    },
    helpText: {
      flex: 1,
    },
    helpTitle: {
      fontSize: '14.5px',
      fontWeight: '600',
      color: '#1A1A2E',
      letterSpacing: '-0.2px',
      marginBottom: '1px',
    },
    helpSubtitle: {
      fontSize: '12px',
      color: '#9CA3AF',
    },

    // BOTTOM NAV
    bottomNav: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '430px',
      background: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderTop: '1px solid #F0F0F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 0 14px',
      zIndex: 200,
      boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
    },
    navItem: (active) => ({
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
      cursor: 'pointer',
      color: active ? '#FF6B35' : '#9CA3AF',
      flex: 1,
    }),
    navLabel: (active) => ({
      fontSize: '10.5px',
      fontWeight: active ? '700' : '500',
      letterSpacing: '0.2px',
    }),
    navCenterBtn: {
      width: '52px',
      height: '52px',
      borderRadius: '17px',
      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 20px rgba(255,107,53,0.45)',
      marginBottom: '4px',
      border: '3px solid #fff',
    },

    appVersion: {
      textAlign: 'center',
      fontSize: '12px',
      color: '#CBD5E1',
      fontWeight: '500',
      marginTop: '8px',
      marginBottom: '4px',
      letterSpacing: '0.3px',
    },
  };

  return (
    <div style={styles.page}>
      {/* STICKY HEADER - properly fixed above content */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="7" cy="7" r="3" fill="#fff"/>
              <circle cx="17" cy="7" r="3" fill="rgba(255,255,255,0.6)"/>
              <circle cx="7" cy="17" r="3" fill="rgba(255,255,255,0.6)"/>
              <circle cx="17" cy="17" r="3" fill="rgba(255,255,255,0.85)"/>
            </svg>
          </div>
          <span style={styles.logoText}>Addora</span>
        </div>
        <div style={styles.searchBar}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <span style={styles.searchText}>Search products...</span>
        </div>
        <button style={styles.cartBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </button>
      </header>

      {/* HERO — starts right below sticky header, no overlap */}
      <section style={styles.hero}>
        <div style={styles.heroDecor1}/>
        <div style={styles.heroDecor2}/>
        <div style={styles.heroDecor3}/>
        <div style={styles.avatarWrapper}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h1 style={styles.heroTitle}>Welcome to Addora</h1>
        <p style={styles.heroSubtitle}>Sign in to access your account</p>
        <div style={styles.btnRow}>
          <button style={styles.signInBtn}>Sign In</button>
          <button style={styles.registerBtn}>Register</button>
        </div>
      </section>

      {/* EARN BANNER */}
      <div style={styles.earnBanner}>
        <div style={styles.earnBannerDecor}/>
        <div style={styles.earnLeft}>
          <div style={styles.earnLabel}>🚀 Earn with Addora</div>
          <div style={styles.earnTitle}>Share & Earn</div>
          <div style={styles.earnSubtitle}>Share products & earn on every sale</div>
        </div>
        <button style={styles.joinBtn}>Join →</button>
      </div>

      {/* MY ACCOUNT */}
      <div style={{ ...styles.section, marginTop: '8px' }}>
        <div style={styles.sectionLabel}>My Account</div>
        <div style={styles.card}>
          {menuItems.map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.menuItem,
                ...(i === menuItems.length - 1 ? styles.menuItemLast : {}),
              }}
            >
              <div style={styles.iconBox(item.color, item.bg)}>
                {item.icon}
              </div>
              <div style={styles.menuText}>
                <div style={styles.menuTitle}>{item.title}</div>
                <div style={styles.menuSubtitle}>{item.subtitle}</div>
              </div>
              <div style={styles.chevron}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HELP & LEGAL */}
      <div style={{ ...styles.section, marginTop: '16px' }}>
        <div style={styles.sectionLabel}>Help &amp; Legal</div>
        <div style={styles.card}>
          {helpItems.map((item, i) => (
            <div
              key={i}
              style={{
                ...styles.helpItem,
                ...(i === helpItems.length - 1 ? { borderBottom: 'none' } : {}),
              }}
            >
              <div style={styles.helpDot}/>
              <div style={styles.helpText}>
                <div style={styles.helpTitle}>{item.title}</div>
                <div style={styles.helpSubtitle}>{item.subtitle}</div>
              </div>
              <div style={styles.chevron}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* APP VERSION */}
      <p style={styles.appVersion}>Addora v2.4.1 · Made with ❤️ in Ethiopia</p>

      {/* BOTTOM NAV */}
      <nav style={styles.bottomNav}>
        <div style={styles.navItem(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span style={styles.navLabel(false)}>Home</span>
        </div>
        <div style={styles.navItem(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span style={styles.navLabel(false)}>Orders</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', cursor: 'pointer', flex: 1 }}>
          <div style={styles.navCenterBtn}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <span style={{ fontSize: '10.5px', fontWeight: '600', color: '#9CA3AF' }}>Shop</span>
        </div>
        <div style={styles.navItem(false)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span style={styles.navLabel(false)}>Categories</span>
        </div>
        <div style={styles.navItem(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF6B35" stroke="#FF6B35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={styles.navLabel(true)}>Account</span>
        </div>
      </nav>
    </div>
  );
};

export default AccountPage;
