import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Addora',
  description: 'How Addora collects, uses, and protects your personal information.',
}

const sections = [
  {
    id: 'information-we-collect',
    icon: '📋',
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you create an account or place an order on Addora, we collect information you provide directly, including your full name, phone number, email address, and delivery address. This information is essential to process your orders and deliver products to you.',
      },
      {
        subtitle: 'Order & Transaction Data',
        text: 'We retain records of products you have purchased, order history, delivery status, and payment method preferences. This helps us resolve disputes, process returns, and improve our service.',
      },
      {
        subtitle: 'Device & Usage Data',
        text: 'We automatically collect certain technical information when you visit our platform, including your IP address, browser type, device type, pages visited, and time spent on each page. This helps us optimize performance and detect fraud.',
      },
    ],
  },
  {
    id: 'how-we-use',
    icon: '⚙️',
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Order Fulfillment',
        text: 'Your personal information is primarily used to process and deliver your orders, send order confirmations and delivery updates via SMS or email, and coordinate with our delivery partners across Ethiopia.',
      },
      {
        subtitle: 'Customer Support',
        text: 'We use your contact information to respond to your inquiries, resolve disputes with sellers, process refund requests, and send important service announcements related to your account.',
      },
      {
        subtitle: 'Platform Improvement',
        text: 'Aggregated and anonymized usage data helps us understand how customers interact with Addora, which product categories are most popular, and where we can improve the shopping experience.',
      },
      {
        subtitle: 'Promotions & Offers',
        text: 'With your consent, we may send you promotional messages about flash sales, new arrivals, and exclusive deals. You can opt out of marketing communications at any time through your account settings.',
      },
    ],
  },
  {
    id: 'information-sharing',
    icon: '🤝',
    title: 'Information Sharing',
    content: [
      {
        subtitle: 'With Sellers',
        text: 'When you place an order, we share your delivery name, address, and phone number with the seller responsible for fulfilling your order. Sellers are contractually prohibited from using this information for any purpose other than fulfilling your order.',
      },
      {
        subtitle: 'With Delivery Partners',
        text: 'We share your delivery address and contact number with our logistics and delivery partners to ensure your order reaches you. These partners are bound by confidentiality obligations.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by Ethiopian law, court order, or government authority. We will notify you of such requests unless legally prohibited from doing so.',
      },
      {
        subtitle: 'We Never Sell Your Data',
        text: 'Addora does not sell, rent, or trade your personal information to third parties for their marketing purposes. Your data is yours.',
      },
    ],
  },
  {
    id: 'data-security',
    icon: '🔒',
    title: 'Data Security',
    content: [
      {
        subtitle: 'How We Protect You',
        text: 'We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS), secure database storage, and restricted access controls. Only authorized Addora personnel can access personal information, and only when necessary.',
      },
      {
        subtitle: 'Payment Security',
        text: 'As a cash-on-delivery platform, we do not store credit card or bank account information. Payments via Telebirr and Chapa are processed through their secure, certified payment infrastructure.',
      },
      {
        subtitle: 'Your Responsibility',
        text: 'You are responsible for keeping your account credentials confidential. Please use a strong password and never share your login details. Contact us immediately if you suspect unauthorized access to your account.',
      },
    ],
  },
  {
    id: 'your-rights',
    icon: '⚖️',
    title: 'Your Rights',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access the personal information we hold about you and request corrections to any inaccurate data. You can update most information directly through your account settings.',
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request deletion of your account and associated personal data at any time. Note that we may retain certain information as required by law or for legitimate business purposes such as fraud prevention.',
      },
      {
        subtitle: 'Marketing Opt-Out',
        text: 'You can unsubscribe from promotional communications at any time by clicking "unsubscribe" in any marketing email, or by contacting our support team.',
      },
    ],
  },
  {
    id: 'cookies',
    icon: '🍪',
    title: 'Cookies & Tracking',
    content: [
      {
        subtitle: 'What We Use',
        text: 'Addora uses cookies and similar tracking technologies to keep you logged in, remember your preferences, and understand how you use our platform. We use both session cookies (deleted when you close your browser) and persistent cookies.',
      },
      {
        subtitle: 'Your Choices',
        text: 'You can control cookies through your browser settings. Disabling cookies may affect some features of Addora, such as staying logged in or maintaining your shopping cart.',
      },
    ],
  },
  {
    id: 'contact',
    icon: '📬',
    title: 'Contact Us',
    content: [
      {
        subtitle: 'Privacy Inquiries',
        text: 'For any questions, concerns, or requests related to your privacy and personal data, please contact our dedicated privacy team. We are committed to responding within 48 hours.',
      },
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)', padding: '100px 24px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>Privacy Policy</span>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)', color: '#FF8A65', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', marginBottom: '20px' }}>
            🔒 Privacy Policy
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Your Privacy Matters to Us
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '560px' }}>
            We are transparent about how we handle your personal data on the Addora marketplace.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            <span>Last updated: January 2025</span>
            <span>·</span>
            <span>Addora Technology PLC</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start' }}>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '88px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 20px rgba(16,24,43,0.08)', border: '1px solid rgba(16,24,43,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>
              Contents
            </div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px' }}>
              <Link href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                📄 Terms of Service →
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div>
          <div style={{ background: 'linear-gradient(135deg, #10182B, #1a2a42)', borderRadius: '16px', padding: '28px 32px', marginBottom: '32px', border: '1px solid rgba(231,85,37,0.2)' }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>👋</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.7, margin: 0 }}>
              Addora Technology PLC operates the Addora marketplace at <strong style={{ color: 'white' }}>addora.com.et</strong>. We are committed to protecting your privacy and being transparent about our data practices. By using Addora, you agree to the terms described in this policy.
            </p>
          </div>

          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{ background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)', scrollMarginTop: '88px' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {[
                      { icon: '📧', label: 'Email', value: 'addora@addora.com.et', href: 'mailto:addora@addora.com.et' },
                      { icon: '📞', label: 'Phone', value: '+251 926 635 307', href: 'tel:+251926635307' },
                      { icon: '📍', label: 'Location', value: 'Addis Ababa, Ethiopia', href: null },
                      { icon: '🌐', label: 'Website', value: 'www.addora.com.et', href: 'https://addora.com.et' },
                    ].map(c => (
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

          <div style={{ background: '#10182B', borderRadius: '16px', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Still have questions about your privacy?</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Our team is ready to help you.</div>
            </div>
            <a href="mailto:addora@addora.com.et" style={{ background: '#E75525', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Contact Us →
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .toc-link { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; margin-bottom: 2px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 500; transition: background 0.15s, color 0.15s; }
        .toc-link:hover { background: #fff5f0; color: #E75525; }
        .contact-card { display: flex; align-items: center; gap: 12px; background: #f8f8f6; border-radius: 12px; padding: 14px 16px; text-decoration: none; border: 1px solid #f0f0ee; transition: border-color 0.15s; }
        .contact-card:hover { border-color: #E75525; }
        @media (max-width: 768px) {
          aside { display: none !important; }
          div[style*="gridTemplateColumns: 240px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
