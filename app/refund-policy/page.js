import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy — Addora',
  description: 'Addora\'s refund and return policy for Cash on Delivery orders.',
}

const sections = [
  {
    id: 'overview',
    icon: '📌',
    title: 'Overview',
    highlight: 'All orders on Addora are currently processed via Cash on Delivery (COD). You pay only when your order arrives.',
    content: [
      {
        subtitle: 'How Refunds Work',
        text: 'Because Addora operates on a Cash on Delivery model, you do not pay until you physically receive your order. This means most payment disputes are avoided entirely — if you refuse an order at the door, you are not charged. Refunds apply in cases where you have already accepted and paid for an order and then discovered a valid issue.',
      },
      {
        subtitle: 'Our Commitment',
        text: 'We take product quality and accurate listings seriously. If a product arrives defective, damaged, or significantly different from what was described, Addora will mediate the dispute and, where appropriate, facilitate a full refund to you.',
      },
    ],
  },
  {
    id: 'eligible-refunds',
    icon: '✅',
    title: 'Eligible Refund Reasons',
    content: [
      {
        subtitle: 'Defective or Damaged Product',
        text: 'If the item you received is broken, defective, or was damaged in transit, you are eligible for a full refund. You must report the issue within 48 hours of delivery with photographic evidence.',
      },
      {
        subtitle: 'Wrong Item Delivered',
        text: 'If you received a product that is different from what you ordered (wrong size, color, model, or item), you are eligible for a full refund or a free replacement, whichever you prefer.',
      },
      {
        subtitle: 'Item Significantly Not as Described',
        text: 'If the product received is materially different from the seller\'s description or photos in a way that would have affected your decision to buy, you may request a refund. Minor variations in shade or texture that are within normal manufacturing tolerance are not eligible.',
      },
      {
        subtitle: 'Missing Items',
        text: 'If your order arrived with items missing from a multi-item shipment, you are eligible for a partial or full refund for the missing items.',
      },
    ],
  },
  {
    id: 'not-eligible',
    icon: '🚫',
    title: 'Non-Eligible Situations',
    content: [
      {
        subtitle: 'Change of Mind',
        text: 'We do not accept refund requests based on a change of mind after you have accepted and paid for the order. Please review product descriptions and photos carefully before placing your order.',
      },
      {
        subtitle: 'Reported After 7 Days',
        text: 'Refund requests must be submitted within 7 days of delivery. Issues reported after this window will not be accepted unless there is clear evidence of a hidden defect that could not have been discovered at the time of delivery.',
      },
      {
        subtitle: 'Non-Returnable Categories',
        text: 'The following categories are not eligible for return or refund unless they are defective or damaged upon arrival: perishable goods, opened personal care and hygiene products, undergarments and swimwear, and digital goods or gift cards.',
      },
      {
        subtitle: 'Damage Due to Misuse',
        text: 'Products damaged due to improper use, accidental damage after delivery, or modification by the buyer are not eligible for a refund.',
      },
    ],
  },
  {
    id: 'how-to-request',
    icon: '📝',
    title: 'How to Request a Refund',
    content: [
      {
        subtitle: 'Step 1 — Contact Us Within 7 Days',
        text: 'Email addora@addora.com.et or call +251 926 635 307 within 7 days of receiving your order. Include your order number, a clear description of the issue, and photos or video evidence of the defect or discrepancy.',
      },
      {
        subtitle: 'Step 2 — Review & Mediation',
        text: 'Our support team will review your claim within 2 business days. We may contact the seller to gather their response. If the claim is valid, we will approve the refund. If disputed, our team will make a final binding decision based on the evidence provided.',
      },
      {
        subtitle: 'Step 3 — Return the Item (if required)',
        text: 'For approved refunds, we may ask you to return the item before processing the payment. Our team will coordinate the return pickup at no cost to you. Do not dispose of the item before receiving confirmation from us.',
      },
      {
        subtitle: 'Step 4 — Refund Processed',
        text: 'Once the return is confirmed (or if a return is not required), your refund will be processed within 5–7 business days via Telebirr, Chapa, or bank transfer. We will confirm the method and timeline with you upon approval.',
      },
    ],
  },
  {
    id: 'cod-refusal',
    icon: '🚪',
    title: 'Refusing Delivery at the Door',
    content: [
      {
        subtitle: 'Your Right to Inspect',
        text: 'Because Addora uses Cash on Delivery, you have the right to inspect your order before paying. If the package appears visibly damaged or tampered with at the time of delivery, you may refuse to accept it. You will not be charged.',
      },
      {
        subtitle: 'Partial Acceptance',
        text: 'If a multi-item order arrives and only some items are present or acceptable, contact our support team immediately before accepting or refusing the shipment. Do not accept partial orders and pay for missing items.',
      },
      {
        subtitle: 'Repeated Refusals',
        text: 'Unjustified or repeated refusal to accept orders without a valid reason may result in account restrictions. Our delivery partners record delivery attempts, and patterns of abuse are reviewed by our team.',
      },
    ],
  },
  {
    id: 'refund-timeline',
    icon: '⏱️',
    title: 'Refund Timeline',
    content: [
      {
        subtitle: 'Reporting Window',
        text: 'You must report your issue within 7 days of the delivery date. Claims submitted after this period will not be accepted.',
      },
      {
        subtitle: 'Review Period',
        text: 'Our team will review and respond to your claim within 2 business days of submission.',
      },
      {
        subtitle: 'Payment Processing',
        text: 'Once approved and the item returned (if required), refunds are processed within 5–7 business days. The exact timeline may vary depending on your bank or mobile money provider.',
      },
    ],
  },
  {
    id: 'contact',
    icon: '📬',
    title: 'Contact Us',
    content: [
      {
        subtitle: 'Refund Inquiries',
        text: 'Our support team is available to assist with any refund or return requests. Please have your order number ready when you contact us.',
      },
    ],
  },
]

export default function RefundPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f8f6', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10182B 0%, #1a2a42 60%, #10182B 100%)', padding: 'clamp(64px, 10vw, 100px) 20px clamp(40px, 6vw, 64px)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '8%', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(231,85,37,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>›</span>
            <span style={{ color: '#E75525', fontSize: '13px', fontWeight: 600 }}>Refund Policy</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(231,85,37,0.15)', border: '1px solid rgba(231,85,37,0.3)', color: '#FF8A65', fontSize: '12px', fontWeight: 600, padding: '6px 14px', borderRadius: '100px', marginBottom: '20px' }}>
            ↩️ Refund Policy
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 800, color: 'white', margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.5px' }}>
            Refunds & Returns
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 'clamp(14px, 3.5vw, 16px)', lineHeight: 1.6, margin: '0 0 24px', maxWidth: '560px' }}>
            We want every Addora purchase to be exactly what you expected. Here is how we handle refunds and returns.
          </p>

          {/* COD key facts strip */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { icon: '💵', text: 'Cash on Delivery only' },
              { icon: '🕐', text: '7-day return window' },
              { icon: '📦', text: 'Free return pickup' },
              { icon: '⚡', text: '5–7 day refund processing' },
            ].map((f, i) => (
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
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '16px' }}>Contents</div>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">
                <span style={{ fontSize: '14px' }}>{s.icon}</span>
                <span>{s.title}</span>
              </a>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '16px', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/terms" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                📄 Terms of Service →
              </Link>
              <Link href="/privacy" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#E75525', fontWeight: 600, textDecoration: 'none' }}>
                🔒 Privacy Policy →
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
                <h2 style={{ fontSize: 'clamp(17px, 3.5vw, 20px)', fontWeight: 700, color: '#10182B', margin: 0 }}>{section.title}</h2>
              </div>

              {section.highlight && (
                <div style={{ background: 'rgba(231,85,37,0.07)', border: '1px solid rgba(231,85,37,0.2)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '14px', color: '#c44a1f', fontWeight: 600 }}>
                  {section.highlight}
                </div>
              )}

              {section.id === 'contact' ? (
                <div>
                  <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '20px' }}>{section.content[0].text}</p>
                  <div className="contact-grid">
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
                    <div key={ii} style={{ paddingLeft: '16px', borderLeft: `3px solid ${ii === 0 ? '#E75525' : 'rgba(231,85,37,0.25)'}` }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B', marginBottom: '6px' }}>{item.subtitle}</div>
                      <p style={{ color: '#6b7280', fontSize: '14.5px', lineHeight: 1.75, margin: 0 }}>{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Refund timeline visual */}
          <div style={{ background: 'white', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', marginBottom: '16px', boxShadow: '0 2px 16px rgba(16,24,43,0.06)', border: '1px solid rgba(16,24,43,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#10182B', margin: '0 0 24px' }}>Refund Process at a Glance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { step: '1', label: 'Report the issue', detail: 'Within 7 days of delivery', color: '#E75525' },
                { step: '2', label: 'We review your claim', detail: 'Within 2 business days', color: '#E75525' },
                { step: '3', label: 'Return item (if required)', detail: 'Free pickup coordinated by Addora', color: '#E75525' },
                { step: '4', label: 'Refund sent to you', detail: 'Within 5–7 business days via Telebirr, Chapa, or bank transfer', color: '#E75525' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: s.color, color: 'white', fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
                    {i < 3 && <div style={{ width: '2px', flex: 1, background: 'rgba(231,85,37,0.2)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: i < 3 ? '20px' : '0', paddingTop: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#10182B' }}>{s.label}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#10182B', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>Need to request a refund?</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Contact us with your order number and we'll take care of it.</div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="tel:+251926635307" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', padding: '11px 20px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(255,255,255,0.15)' }}>
                📞 Call Us
              </a>
              <a href="mailto:addora@addora.com.et" style={{ background: '#E75525', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
                Email Support →
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
