'use client'
import Link from 'next/link'
import { useLang } from '@/lib/lang'

export default function PrivacyPage() {
  const { tr } = useLang()

  // All section data built from tr() so it reacts to language changes
  const sections = [
    {
      id: 'information-we-collect',
      icon: '📋',
      title: tr('privacySec1Title'),
      content: [
        { subtitle: tr('privacySec1Sub1'), text: tr('privacySec1Text1') },
        { subtitle: tr('privacySec1Sub2'), text: tr('privacySec1Text2') },
        { subtitle: tr('privacySec1Sub3'), text: tr('privacySec1Text3') },
      ],
    },
    {
      id: 'how-we-use',
      icon: '⚙️',
      title: tr('privacySec2Title'),
      content: [
        { subtitle: tr('privacySec2Sub1'), text: tr('privacySec2Text1') },
        { subtitle: tr('privacySec2Sub2'), text: tr('privacySec2Text2') },
        { subtitle: tr('privacySec2Sub3'), text: tr('privacySec2Text3') },
        { subtitle: tr('privacySec2Sub4'), text: tr('privacySec2Text4') },
      ],
    },
    {
      id: 'information-sharing',
      icon: '🤝',
      title: tr('privacySec3Title'),
      content: [
        { subtitle: tr('privacySec3Sub1'), text: tr('privacySec3Text1') },
        { subtitle: tr('privacySec3Sub2'), text: tr('privacySec3Text2') },
        { subtitle: tr('privacySec3Sub3'), text: tr('privacySec3Text3') },
        { subtitle: tr('privacySec3Sub4'), text: tr('privacySec3Text4') },
      ],
    },
    {
      id: 'data-security',
      icon: '🔒',
      title: tr('privacySec4Title'),
      content: [
        { subtitle: tr('privacySec4Sub1'), text: tr('privacySec4Text1') },
        { subtitle: tr('privacySec4Sub2'), text: tr('privacySec4Text2') },
        { subtitle: tr('privacySec4Sub3'), text: tr('privacySec4Text3') },
      ],
    },
    {
      id: 'your-rights',
      icon: '⚖️',
      title: tr('privacySec5Title'),
      content: [
        { subtitle: tr('privacySec5Sub1'), text: tr('privacySec5Text1') },
        { subtitle: tr('privacySec5Sub2'), text: tr('privacySec5Text2') },
        { subtitle: tr('privacySec5Sub3'), text: tr('privacySec5Text3') },
      ],
    },
    {
      id: 'cookies',
      icon: '🍪',
      title: tr('privacySec6Title'),
      content: [
        { subtitle: tr('privacySec6Sub1'), text: tr('privacySec6Text1') },
        { subtitle: tr('privacySec6Sub2'), text: tr('privacySec6Text2') },
      ],
    },
    {
      id: 'contact',
      icon: '📬',
      title: tr('privacySec7Title'),
      content: [
        { subtitle: tr('privacySec7Sub1'), text: tr('privacySec7Text1') },
      ],
    },
  ]

  const contactCards = [
    { icon: '📧', label: tr('privacyContactEmailLabel'),    value: 'addora@addora.com.et',     href: 'mailto:addora@addora.com.et' },
    { icon: '📞', label: tr('privacyContactPhoneLabel'),    value: '+251 926 635 307',           href: 'tel:+251926635307' },
    { icon: '📍', label: tr('privacyContactLocationLabel'), value: tr('privacyContactLocationValue'), href: null },
    { icon: '🌐', label: tr('privacyContactWebsiteLabel'),  value: 'www.addora.com.et',         href: 'https://addora.com.et' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)', padding: '100px 24px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>{tr('breadcrumbHome')}</Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>{tr('privacyTitle')}</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)', color: '#FF8A65', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', marginBottom: '20px' }}>
            🔒 {tr('privacyTitle')}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            {tr('privacyHeroTitle')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '560px' }}>
            {tr('privacyHeroSub')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <span>{tr('privacyLastUpdated')}</span>
            <span>·</span>
            <span>Addora Technology PLC</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="page-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '88px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 20px rgba(16,24,43,0.08)', border: '1px solid rgba(16,24,43,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>
              {tr('contentsLabel')}
            </div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px' }}>
              <Link href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                {tr('termsTermsLink')}
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div>
          <div style={{ background: 'linear-gradient(135deg, #10182B, #1a2a42)', borderRadius: '16px', padding: '28px 24px', marginBottom: '32px', border: '1px solid rgba(231,85,37,0.2)' }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>👋</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
              {tr('privacyIntro')}
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)', scrollMarginTop: '88px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(231,85,37,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#10182B', margin: 0 }}>{section.title}</h2>
              </div>

              {section.id === 'contact' ? (
                <div>
                  <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>
                    {section.content[0].text}
                  </p>
                  <div className="contact-grid">
                    {contactCards.map(c => (
                      <a key={c.label} href={c.href || '#'} className="contact-card">
                        <span style={{ fontSize: '18px' }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '1px' }}>{c.label}</div>
                          <div style={{ fontSize: '13px', color: '#10182B', fontWeight: 600 }}>{c.value}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {section.content.map((item, ii) => (
                    <div key={ii} style={{ paddingLeft: '16px', borderLeft: '3px solid', borderImage: ii === 0 ? 'linear-gradient(to bottom, #E75525, rgba(231,85,37,0.3)) 1' : 'linear-gradient(to bottom, rgba(231,85,37,0.3), rgba(231,85,37,0.05)) 1' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B', marginBottom: '6px' }}>{item.subtitle}</div>
                      <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: 1.75, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Bottom CTA */}
          <div style={{ background: '#10182B', borderRadius: '16px', padding: '28px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>{tr('privacyCtaTitle')}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{tr('privacyCtaSub')}</div>
            </div>
            <a href="mailto:addora@addora.com.et" style={{ background: '#E75525', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {tr('privacyCtaBtn')}
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .toc-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; margin-bottom: 2px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 500; transition: background 0.15s, color 0.15s; }
        .toc-link:hover { background: #fff5f0; color: #E75525; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .contact-card { display: flex; align-items: center; gap: 12px; background: #f8f8f6; border-radius: 12px; padding: 14px 16px; text-decoration: none; border: 1px solid #f0f0ee; transition: border-color 0.15s; }
        .contact-card:hover { border-color: #E75525; }
        @media (max-width: 768px) {
          aside { display: none !important; }
          .page-grid { grid-template-columns: 1fr !important; padding: 24px 16px 60px !important; gap: 0 !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
