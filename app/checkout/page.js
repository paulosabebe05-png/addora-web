'use client'
import { useState } from 'react'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './checkout.module.css'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang'  // ← ADDED

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { tr } = useLang()   // ← ADDED

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <h2>{tr('pleaseSignInCheckout')}</h2>
        <Link href="/auth/signin?redirect=/checkout" className={styles.signInBtn}>{tr('signIn')}</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.guestWrap}>
        <h2>{tr('emptyCart')}</h2>
        <Link href="/" className={styles.signInBtn}>{tr('shopNowBtn')}</Link>
      </div>
    )
  }

  const deliveryFee = 80
  const grandTotal = total + deliveryFee

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone || !form.address) {
      setError(tr('fillAllFields'))
      return
    }
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          items,
          name: form.name,
          phone: form.phone,
          address: form.address,
          notes: form.notes,
          subtotal: total,
          delivery_fee: deliveryFee,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || tr('failedToPlaceOrder'))

      clearCart()
      router.push(`/orders/${data.order.id}?success=1`)
    } catch (err) {
      setError(err.message || tr('failedToPlaceOrder'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{tr('checkoutTitle')}</h1>

      <div className={styles.layout}>
        {/* Order summary */}
        <div className={styles.summary}>
          <h2>{tr('orderSummary')}</h2>
          <div className={styles.summaryItems}>
            {items.map(item => {
              const key = item.variant_id ? `${item.id}__${item.variant_id}` : item.id
              return (
                <div key={key} className={styles.summaryItem}>
                  <div className={styles.summaryItemImg}>
                    {item.image_url && <img src={item.image_url} alt={item.name} />}
                  </div>
                  <div className={styles.summaryItemInfo}>
                    <span>{item.name}</span>
                    <span>
                      {[item.color, item.size].filter(Boolean).join(' · ')}
                      {[item.color, item.size].filter(Boolean).length > 0 ? ' · ' : ''}
                      ×{item.qty}
                    </span>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ETB {(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>

          <div className={styles.summaryRows}>
            <div className={styles.row}>
              <span>{tr('subtotal')}</span>
              <span>ETB {total.toLocaleString()}</span>
            </div>
            <div className={styles.row}>
              <span>{tr('deliveryFee')}</span>
              <span>ETB {deliveryFee.toLocaleString()}</span>
            </div>
            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>{tr('total')}</span>
              <span>ETB {grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className={styles.codBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {tr('securedByCOD')}
          </div>
        </div>

        {/* Form */}
        <div className={styles.formSection}>
          <div className={styles.section}>
            <h2>{tr('deliveryInformation')}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label>{tr('fullNameRequired')}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder={tr('fullNamePlaceholder')}
                  className={styles.input}
                  autoComplete="name"
                />
              </div>

              <div className={styles.field}>
                <label>{tr('phoneNumberRequired')}</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder={tr('phonePlaceholder')}
                  className={styles.input}
                  autoComplete="tel"
                  inputMode="tel"
                />
              </div>

              <div className={styles.field}>
                <label>{tr('deliveryAddressRequired')}</label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder={tr('deliveryAddressPlaceholder')}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <label>{tr('orderNotes')}</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder={tr('orderNotesPlaceholder')}
                  className={styles.textarea}
                  rows={2}
                />
              </div>

              {/* Payment */}
              <div className={styles.paymentSection}>
                <h3>{tr('paymentMethod')}</h3>
                <div className={styles.codSelected}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  <div>
                    <strong>{tr('codLabel')}</strong>
                    <p>{tr('codSub')}</p>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : tr('placeOrder')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
