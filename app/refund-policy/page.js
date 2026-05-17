'use client'

import Link from 'next/link'
import { useLang } from '@/lib/lang'

export default function RefundPolicyPage() {
  const { tr } = useLang()

  const sections = [
    {
      id: 'overview',
      icon: tr('refundS1Icon'),
      title: tr('refundS1Title'),
      highlight: tr('refundS1Highlight'),
      content: [
        { subtitle: tr('refundS1Sub1'), text: tr('refundS1Text1') },
        { subtitle: tr('refundS1Sub2'), text: tr('refundS1Text2') },
      ],
    },
    {
      id: 'eligible-refunds',
      icon: tr('refundS2Icon'),
      title: tr('refundS2Title'),
      content: [
        { subtitle: tr('refundS2Sub1'), text: tr('refundS2Text1') },
        { subtitle: tr('refundS2Sub2'), text: tr('refundS2Text2') },
        { subtitle: tr('refundS2Sub3'), text: tr('refundS2Text3') },
        { subtitle: tr('refundS2Sub4'), text: tr('refundS2Text4') },
      ],
    },
    {
      id: 'not-eligible',
      icon: tr('refundS3Icon'),
      title: tr('refundS3Title'),
      content: [
        { subtitle: tr('refundS3Sub1'), text: tr('refundS3Text1') },
        { subtitle: tr('refundS3Sub2'), text: tr('refundS3Text2') },
        { subtitle: tr('refundS3Sub3'), text: tr('refundS3Text3') },
        { subtitle: tr('refundS3Sub4'), text: tr('refundS3Text4') },
      ],
    },
    {
      id: 'how-to-request',
      icon: tr('refundS4Icon'),
      title: tr('refundS4Title'),
      content: [
        { subtitle: tr('refundS4Sub1'), text: tr('refundS4Text1') },
        { subtitle: tr('refundS4Sub2'), text: tr('refundS4Text2') },
        { subtitle: tr('refundS4Sub3'), text: tr('refundS4Text3') },
        { subtitle: tr('refundS4Sub4'), text: tr('refundS4Text4') },
      ],
    },
    {
      id: 'cod-refusal',
      icon: tr('refundS5Icon'),
      title: tr('refundS5Title'),
      content: [
        { subtitle: tr('refundS5Sub1'), text: tr('refundS5Text1') },
        { subtitle: tr('refundS5Sub2'), text: tr('refundS5Text2') },
        { subtitle: tr('refundS5Sub3'), text: tr('refundS5Text3') },
      ],
    },
    {
      id: 'refund-timeline',
      icon: tr('refundS6Icon'),
      title: tr('refundS6Title'),
      content: [
        { subtitle: tr('refundS6Sub1'), text: tr('refundS6Text1') },
        { subtitle: tr('refundS6Sub2'), text: tr('refundS6Text2') },
        { subtitle: tr('refundS6Sub3'), text: tr('refundS6Text3') },
      ],
    },
    {
      id: 'contact',
      icon: tr('refundS7Icon'),
      title: tr('refundS7Title'),
      content: [
        { subtitle: tr('refundS7Sub1'), text: tr('refundS7Text1') },
      ],
    },
  ]

  const heroFacts = [
    { icon: '💵', text: tr('refundFact1') },
    { icon: '🕐', text: tr('refundFact2') },
    { icon: '📦', text: tr('refundFact3') },
    { icon: '⚡', text: tr('refundFact4') },
  ]

  const glanceSteps = [
    { step: '1', label: tr('refundStep1Label'), detail: tr('refundStep1Detail') },
    { step: '2', label: tr('refundStep2Label'), detail: tr('refundStep2Detail') },
    { step: '3', label: tr('refundStep3Label'), detail: tr('refundStep3Detail') },
    { step: '4', label: tr('refundStep4Label'), detail: tr('refundStep4Detail') },
  ]

  const contactCards = [
    { icon: '📧', labelKey: 'refundContactEmailLabel', value: 'addora@addora.com.et', href: 'mailto:addora@addora.com.et' },
    { icon: '📞', labelKey: 'refundContactPhoneLabel', value: '+251 926 635 307', href: 'tel:+251926635307' },
    { icon: '📍', labelKey: 'refundContactLocationLabel', valueKey: 'refundContactLocationValue', href: null },
    { icon: '🌐', labelKey: 'refundContactWebsiteLabel', value: 'www.addora.com.et', href: 'https://addora.com.et' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)', padding: 'clamp(64px, 10vw, 100px) 20px clamp(40px, 6vw, 64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '8%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>
              {tr('refundBreadcrumbHome')}
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>
              {tr('refundBreadcrumbCurrent')}
            </span>
          </div>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)', color: '#FF8A65', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', marginBottom: '20px' }}>
            {tr('refundBadgeLabel')}
          </div>

          <h1 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            {tr('refundHeroTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px, 3.5vw, 16px)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: '560px' }}>
            {tr('refundHeroSub')}
          </p>

          {/* Key-facts strip */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {heroFacts.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile TOC */}
      <div className="mobile-toc">
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: '8px', padding: '16px 20px', width: 'max-content' }}>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1px solid rgba(16,24,43,0.08)', borderRadius: '100px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#374151', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="page-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Sidebar */}
        <aside className="sidebar" style={{ position: 'sticky', top: '88px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 20px rgba(16,24,43,0.08)', border: '1px solid rgba(16,24,43,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>
              {tr('refundContentsLabel')}
            </div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                {tr('refundSidebarTerms')}
              </Link>
              <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                {tr('refundSidebarPrivacy')}
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div>
          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{ background: 'white', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)', scrollMarginTop: '88px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: section.highlight ? '16px' : '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(231,85,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: 'clamp(17px, 3.5vw, 20px)', fontWeight: 700, color: '#10182B', margin: 0 }}>
                  {section.title}
                </h2>
              </div>

              {section.highlight && (
                <div style={{ background: 'rgba(231,85,37,0.07)', border: '1px solid rgba(231,85,37,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#c44a1f', fontWeight: 600 }}>
                  {section.highlight}
                </div>
              )}

              {section.id === 'contact' ? (
                <div>
                  <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
                    {section.content[0].text}
                  </p>
                  <div className="contact-grid">
                    {contactCards.map((c) => (
                      <a key={c.labelKey} href={c.href || '#'} className="contact-card">
                        <span style={{ fontSize: '18px' }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '1px' }}>
                            {tr(c.labelKey)}
                          </div>
                          <div style={{ fontSize: '13px', color: '#10182B', fontWeight: 600 }}>
                            {c.valueKey ? tr(c.valueKey) : c.value}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {section.content.map((item, ii) => (
                    <div key={ii} style={{ paddingLeft: '16px', borderLeft: `3px solid ${ii === 0 ? '#E75525' : 'rgba(231,85,37,0.25)'}` }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B', marginBottom: '6px' }}>
                        {item.subtitle}
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: 1.75, margin: 0 }}>
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Refund process at a glance */}
          <div style={{ background: 'white', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#10182B', margin: '0 0 24px' }}>
              {tr('refundGlanceTitle')}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {glanceSteps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#E75525', color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {s.step}
                    </div>
                    {i < glanceSteps.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: 'rgba(231,85,37,0.2)', margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < glanceSteps.length - 1 ? '20px' : '0', paddingTop: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ background: '#10182B', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                {tr('refundCtaTitle')}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                {tr('refundCtaSub')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="tel:+251926635307" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
                {tr('refundCtaCallBtn')}
              </a>
              <a href="mailto:addora@addora.com.et" style={{ background: '#E75525', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                {tr('refundCtaEmailBtn')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .page-grid { display: grid; grid-template-columns: 240px 1fr; gap: 48px; align-items: start; }
        .sidebar { display: block; }
        .mobile-toc { display: none; background: white; border-bottom: 1px solid rgba(16,24,43,0.07); }
        .toc-link { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; margin-bottom:2px; text-decoration:none; color:#374151; font-size:13px; font-weight:500; transition:background 0.15s,color 0.15s; }
        .toc-link:hover { background:#fff5f0; color:#E75525; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .contact-card { display:flex; align-items:center; gap:12px; background:#f8f8f6; border-radius:12px; padding:14px 16px; text-decoration:none; border:1px solid #f0f0ee; transition:border-color 0.15s; }
        .contact-card:hover { border-color:#E75525; }
        @media (max-width: 768px) {
          .page-grid { grid-template-columns: 1fr !important; gap: 0 !important; padding-top: 24px !important; }
          .sidebar { display: none !important; }
          .mobile-toc { display: block; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
