'use client'

import Link from 'next/link'
import { useLang } from '@/lib/lang'

export default function TermsPage() {
  const { tr } = useLang()

  const sections = [
    {
      id: 'acceptance',
      icon: tr('termsS1Icon'),
      title: tr('termsS1Title'),
      highlight: tr('termsS1Highlight'),
      content: [
        { subtitle: tr('termsS1Sub1'), text: tr('termsS1Text1') },
        { subtitle: tr('termsS1Sub2'), text: tr('termsS1Text2') },
        { subtitle: tr('termsS1Sub3'), text: tr('termsS1Text3') },
      ],
    },
    {
      id: 'accounts',
      icon: tr('termsS2Icon'),
      title: tr('termsS2Title'),
      content: [
        { subtitle: tr('termsS2Sub1'), text: tr('termsS2Text1') },
        { subtitle: tr('termsS2Sub2'), text: tr('termsS2Text2') },
        { subtitle: tr('termsS2Sub3'), text: tr('termsS2Text3') },
      ],
    },
    {
      id: 'buying',
      icon: tr('termsS3Icon'),
      title: tr('termsS3Title'),
      content: [
        { subtitle: tr('termsS3Sub1'), text: tr('termsS3Text1') },
        { subtitle: tr('termsS3Sub2'), text: tr('termsS3Text2') },
        { subtitle: tr('termsS3Sub3'), text: tr('termsS3Text3') },
        { subtitle: tr('termsS3Sub4'), text: tr('termsS3Text4') },
      ],
    },
    {
      id: 'delivery',
      icon: tr('termsS4Icon'),
      title: tr('termsS4Title'),
      content: [
        { subtitle: tr('termsS4Sub1'), text: tr('termsS4Text1') },
        { subtitle: tr('termsS4Sub2'), text: tr('termsS4Text2') },
        { subtitle: tr('termsS4Sub3'), text: tr('termsS4Text3') },
      ],
    },
    {
      id: 'returns',
      icon: tr('termsS5Icon'),
      title: tr('termsS5Title'),
      content: [
        { subtitle: tr('termsS5Sub1'), text: tr('termsS5Text1') },
        { subtitle: tr('termsS5Sub2'), text: tr('termsS5Text2') },
        { subtitle: tr('termsS5Sub3'), text: tr('termsS5Text3') },
        { subtitle: tr('termsS5Sub4'), text: tr('termsS5Text4') },
      ],
    },
    {
      id: 'prohibited',
      icon: tr('termsS6Icon'),
      title: tr('termsS6Title'),
      content: [
        { subtitle: tr('termsS6Sub1'), text: tr('termsS6Text1') },
        { subtitle: tr('termsS6Sub2'), text: tr('termsS6Text2') },
        { subtitle: tr('termsS6Sub3'), text: tr('termsS6Text3') },
      ],
    },
    {
      id: 'liability',
      icon: tr('termsS7Icon'),
      title: tr('termsS7Title'),
      content: [
        { subtitle: tr('termsS7Sub1'), text: tr('termsS7Text1') },
        { subtitle: tr('termsS7Sub2'), text: tr('termsS7Text2') },
        { subtitle: tr('termsS7Sub3'), text: tr('termsS7Text3') },
      ],
    },
    {
      id: 'governing-law',
      icon: tr('termsS8Icon'),
      title: tr('termsS8Title'),
      content: [
        { subtitle: tr('termsS8Sub1'), text: tr('termsS8Text1') },
        { subtitle: tr('termsS8Sub2'), text: tr('termsS8Text2') },
      ],
    },
  ]

  const summaryBullets = [
    tr('termsBullet1'),
    tr('termsBullet2'),
    tr('termsBullet3'),
    tr('termsBullet4'),
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)', padding: '100px 24px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '8%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>
              {tr('termsBreadcrumbHome')}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>
              {tr('termsBreadcrumbCurrent')}
            </span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)', borderRadius: '20px', padding: '5px 14px', marginBottom: '20px' }}>
            <span style={{ fontSize: '12px' }}>📄</span>
            <span style={{ color: '#E75525', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {tr('termsTitle')}
            </span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
            {tr('termsTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '16px', margin: '0 0 20px', lineHeight: 1.6 }}>
            {tr('termsHeroSub')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>🕐</span>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>{tr('termsLastUpdated')}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="page-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '88px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 20px rgba(16,24,43,0.08)', border: '1px solid rgba(16,24,43,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>
              {tr('termsContentsLabel')}
            </div>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px' }}>
              <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                {tr('termsPrivacyLink')}
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div>
          {/* Intro summary card */}
          <div style={{ background: 'linear-gradient(135deg, #10182B, #1a2a42)', borderRadius: '16px', padding: '28px 24px', marginBottom: '32px', border: '1px solid rgba(231,85,37,0.2)' }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>📝</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 16px' }}>
              {tr('termsIntro')}{' '}
              <strong style={{ color: 'white' }}>Addora Technology PLC</strong>
              {tr('termsIntroAnd')}
              <strong style={{ color: 'white' }}>addora.com.et</strong>
              {tr('termsIntroSuffix')}
            </p>
            <div className="summary-grid">
              {summaryBullets.map((point, i) => (
                <div key={i} style={{ background: 'rgba(231,85,37,0.12)', border: '1px solid rgba(231,85,37,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {point}
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)', scrollMarginTop: '88px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(231,85,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#10182B', margin: 0 }}>{section.title}</h2>
              </div>

              {section.highlight && (
                <div style={{ background: 'rgba(231,85,37,0.07)', border: '1px solid rgba(231,85,37,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#c44a1f', fontWeight: 600 }}>
                  {section.highlight}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {section.content.map((item, ii) => (
                  <div key={ii} style={{ paddingLeft: '16px', borderLeft: `3px solid ${ii === 0 ? '#E75525' : 'rgba(231,85,37,0.25)'}` }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B', marginBottom: '6px' }}>{item.subtitle}</div>
                    <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: 1.75, margin: 0 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div style={{ background: '#10182B', borderRadius: '16px', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                {tr('termsCtaTitle')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                {tr('termsCtaSub')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/privacy" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
                {tr('termsCtaPrivacyBtn')}
              </Link>
              <a href="mailto:addora@addora.com.et" style={{ background: '#E75525', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                {tr('termsCtaContactBtn')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .toc-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; margin-bottom: 2px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 500; transition: background 0.15s, color 0.15s; }
        .toc-link:hover { background: #fff5f0; color: #E75525; }
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 768px) {
          aside { display: none !important; }
          .page-grid { grid-template-columns: 1fr !important; padding: 24px 16px 60px !important; gap: 0 !important; }
          .summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
