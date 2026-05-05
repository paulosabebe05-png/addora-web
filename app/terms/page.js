import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Addora',
  description: 'Terms and conditions for using the Addora marketplace.',
}

const sections = [
  {
    id: 'acceptance',
    icon: '✅',
    title: 'Acceptance of Terms',
    highlight: 'By accessing or using Addora, you agree to be bound by these Terms of Service.',
    content: [
      {
        subtitle: 'Agreement to Terms',
        text: 'By creating an account, placing an order, or otherwise accessing the Addora platform, you confirm that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use Addora.',
      },
      {
        subtitle: 'Eligibility',
        text: 'You must be at least 18 years old or have the consent of a parent or guardian to use Addora. By using our platform, you represent and warrant that you meet these requirements.',
      },
      {
        subtitle: 'Changes to Terms',
        text: 'Addora reserves the right to modify these terms at any time. We will notify users of significant changes via email or a prominent notice on our platform. Continued use after changes constitutes acceptance of the updated terms.',
      },
    ],
  },
  {
    id: 'accounts',
    icon: '👤',
    title: 'User Accounts',
    content: [
      {
        subtitle: 'Account Registration',
        text: 'To purchase on Addora, you must create an account with accurate and complete information including your real name, valid phone number, and delivery address. You are responsible for maintaining the confidentiality of your login credentials.',
      },
      {
        subtitle: 'Account Responsibility',
        text: 'You are fully responsible for all activity that occurs under your account. Addora is not liable for any loss or damage arising from your failure to maintain account security. You must immediately notify us of any unauthorized account use.',
      },
      {
        subtitle: 'Account Termination',
        text: 'Addora reserves the right to suspend or permanently terminate accounts that violate these terms, engage in fraudulent activity, or harm other users or sellers. You may also delete your account at any time through your account settings.',
      },
    ],
  },
  {
    id: 'buying',
    icon: '🛍️',
    title: 'Buying on Addora',
    content: [
      {
        subtitle: 'Orders & Contracts',
        text: 'When you place an order on Addora, you enter into a direct purchase contract with the seller. Addora acts as the marketplace facilitator but is not the seller unless explicitly stated. Your order confirmation constitutes acceptance of the seller\'s offer.',
      },
      {
        subtitle: 'Pricing & Availability',
        text: 'All prices are displayed in Ethiopian Birr (ETB) and include applicable taxes where required. Product availability is subject to change. Addora and sellers reserve the right to cancel orders if products become unavailable or if pricing errors occur.',
      },
      {
        subtitle: 'Cash on Delivery',
        text: 'Addora operates primarily on a Cash on Delivery (COD) model. Payment is due upon receipt of your order. By placing an order, you commit to being available to receive it and pay the stated amount at delivery.',
      },
      {
        subtitle: 'Order Cancellation',
        text: 'You may cancel an order before it has been dispatched for delivery. Once dispatched, cancellation may not be possible. Repeated cancellations or refusals to accept delivered orders may result in account restrictions.',
      },
    ],
  },
  {
    id: 'delivery',
    icon: '🚚',
    title: 'Delivery & Shipping',
    content: [
      {
        subtitle: 'Delivery Timeframes',
        text: 'Estimated delivery times are 1–2 business days within Addis Ababa and 3–5 business days for other Ethiopian cities. These are estimates only and may be affected by factors outside our control including weather, public holidays, and logistical challenges.',
      },
      {
        subtitle: 'Delivery Attempts',
        text: 'Our delivery partners will make reasonable attempts to deliver your order. If delivery is unsuccessful after multiple attempts due to your absence or refusal, additional delivery charges may apply or your order may be returned to the seller.',
      },
      {
        subtitle: 'Delivery Address',
        text: 'You are responsible for providing an accurate and accessible delivery address. Addora is not liable for failed deliveries resulting from incorrect address information provided by the buyer.',
      },
    ],
  },
  {
    id: 'returns',
    icon: '↩️',
    title: 'Returns & Refunds',
    content: [
      {
        subtitle: 'Return Eligibility',
        text: 'Products may be returned within 7 days of delivery if they are defective, damaged, significantly different from the description, or if the wrong item was delivered. Items must be in original condition with packaging intact.',
      },
      {
        subtitle: 'Non-Returnable Items',
        text: 'Certain categories including perishable goods, personal care items (once opened), undergarments, and digital products are not eligible for return unless defective. Sellers may specify additional non-return conditions in their listings.',
      },
      {
        subtitle: 'Refund Process',
        text: 'Approved refunds for COD orders will be processed via Telebirr, Chapa, or bank transfer within 5–7 business days of return confirmation. Addora will communicate the refund method and timeline upon approval.',
      },
      {
        subtitle: 'Dispute Resolution',
        text: 'If you have a dispute with a seller, contact Addora customer support within 14 days of delivery. We will investigate and mediate disputes fairly. Addora\'s decision on disputes is final and binding.',
      },
    ],
  },
  {
    id: 'prohibited',
    icon: '🚫',
    title: 'Prohibited Activities',
    content: [
      {
        subtitle: 'Fraudulent Behavior',
        text: 'You may not place orders with no intention of receiving them, provide false information, impersonate other users, or engage in any form of fraud against Addora, sellers, or other users.',
      },
      {
        subtitle: 'Platform Abuse',
        text: 'You may not attempt to hack, scrape, or disrupt Addora\'s systems, circumvent security measures, post fake reviews, manipulate search results, or use automated tools to interact with the platform.',
      },
      {
        subtitle: 'Prohibited Products',
        text: 'You may not purchase or attempt to purchase illegal goods, counterfeit products, weapons, or any items prohibited under Ethiopian law through Addora.',
      },
    ],
  },
  {
    id: 'liability',
    icon: '⚖️',
    title: 'Limitation of Liability',
    content: [
      {
        subtitle: 'Marketplace Role',
        text: 'Addora is a marketplace platform that connects buyers and sellers. We do not manufacture, inspect, or directly control the quality of products sold by third-party sellers. We are not responsible for the accuracy of seller listings or product quality beyond our mediation role.',
      },
      {
        subtitle: 'Limitation of Damages',
        text: 'To the maximum extent permitted by Ethiopian law, Addora\'s total liability for any claim arising from use of our platform shall not exceed the amount you paid for the specific order giving rise to the claim.',
      },
      {
        subtitle: 'Indemnification',
        text: 'You agree to indemnify and hold Addora harmless from any claims, damages, or expenses arising from your violation of these terms, your use of the platform, or your interactions with sellers or other users.',
      },
    ],
  },
  {
    id: 'governing-law',
    icon: '🏛️',
    title: 'Governing Law',
    content: [
      {
        subtitle: 'Ethiopian Law',
        text: 'These Terms of Service are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of Addis Ababa, Ethiopia.',
      },
      {
        subtitle: 'Entire Agreement',
        text: 'These terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Addora regarding your use of the platform.',
      },
    ],
  },
]

export default function TermsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f8f6',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)',
        padding: '100px 24px 64px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,85,37,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', right: '8%',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>Terms of Service</span>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)',
            color: '#FF8A65', fontSize: '12px', fontWeight: 600,
            padding: '5px 14px', borderRadius: '100px', marginBottom: '20px',
          }}>
            ⚖️ Legal Agreement
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            letterSpacing: '-1px',
            marginBottom: '16px',
          }}>
            Terms of <span style={{ color: '#E75525' }}>Service</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: 1.6, maxWidth: '520px' }}>
            Please read these terms carefully before using Addora. They govern your use of our marketplace and your relationship with us.
          </p>

          <div style={{ display: 'flex', gap: '24px', marginTop: '28px', flexWrap: 'wrap' }}>
            {[
              { label: 'Last updated', value: 'May 1, 2026' },
              { label: 'Effective', value: 'May 1, 2026' },
              { label: 'Jurisdiction', value: 'Ethiopia' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>{item.label}</div>
                <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px',
        display: 'grid', gridTemplateColumns: '240px 1fr', gap: '48px', alignItems: 'start',
      }}>

        {/* Sidebar */}
        <aside style={{ position: 'sticky', top: '88px' }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '24px',
            boxShadow: '0 2px 20px rgba(16,24,43,0.08)', border: '1px solid rgba(16,24,43,0.06)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>
              Contents
            </div>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
                textDecoration: 'none', color: '#374151', fontSize: '13px', fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff5f0'; e.currentTarget.style.color = '#E75525' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#374151' }}
              >
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px' }}>
              <Link href="/privacy" style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none',
              }}>
                🔒 Privacy Policy →
              </Link>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div>
          {/* Summary card */}
          <div style={{
            background: 'linear-gradient(135deg, #10182B, #1a2a42)',
            borderRadius: '16px', padding: '28px 32px', marginBottom: '32px',
            border: '1px solid rgba(231,85,37,0.2)',
          }}>
            <div style={{ fontSize: '22px', marginBottom: '10px' }}>📝</div>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 16px' }}>
              These Terms of Service constitute a legally binding agreement between you and <strong style={{ color: 'white' }}>Addora Technology PLC</strong>, 
              governing your use of the Addora marketplace at <strong style={{ color: 'white' }}>addora.com.et</strong>. 
              These terms apply to all buyers, visitors, and users of our platform.
            </p>
            {/* Key points */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                '✓ Cash on Delivery — pay when you receive',
                '✓ 7-day return window for defective items',
                '✓ Addora mediates all buyer-seller disputes',
                '✓ Governed by Ethiopian law',
              ].map((point, i) => (
                <div key={i} style={{
                  background: 'rgba(231,85,37,0.12)', border: '1px solid rgba(231,85,37,0.2)',
                  borderRadius: '8px', padding: '10px 14px',
                  fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontWeight: 500,
                }}>
                  {point}
                </div>
              ))}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.id} id={section.id} style={{
              background: 'white', borderRadius: '16px', padding: '32px', marginBottom: '16px',
              boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)',
              scrollMarginTop: '88px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  background: 'rgba(231,85,37,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                }}>
                  {section.icon}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#10182B', margin: 0 }}>
                  {section.title}
                </h2>
              </div>

              {section.highlight && (
                <div style={{
                  background: 'rgba(231,85,37,0.07)', border: '1px solid rgba(231,85,37,0.2)',
                  borderRadius: '10px', padding: '12px 16px', marginBottom: '20px',
                  fontSize: '14px', color: '#c44a1f', fontWeight: 600,
                }}>
                  {section.highlight}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {section.content.map((item, ii) => (
                  <div key={ii} style={{
                    paddingLeft: '16px',
                    borderLeft: `3px solid ${ii === 0 ? '#E75525' : 'rgba(231,85,37,0.25)'}`,
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B', marginBottom: '6px' }}>
                      {item.subtitle}
                    </div>
                    <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: 1.75, margin: 0 }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div style={{
            background: '#10182B', borderRadius: '16px', padding: '32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
                Questions about our Terms?
              </div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                Our support team is available to help.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/privacy" style={{
                background: 'rgba(255,255,255,0.08)', color: 'white',
                padding: '11px 20px', borderRadius: '10px', textDecoration: 'none',
                fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)',
              }}>
                Privacy Policy
              </Link>
              <a href="mailto:addora@addora.com.et" style={{
                background: '#E75525', color: 'white', padding: '12px 24px',
                borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700,
              }}>
                Contact Us →
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          aside { display: none; }
        }
      `}</style>
    </div>
  )
}