'use client'
import { useState, useEffect } from 'react'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './checkout.module.css'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/lang'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { tr } = useLang()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  })
  const [savedAddress, setSavedAddress] = useState(null)  // the fetched address object
  const [addressLoading, setAddressLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Auto-fetch user's default (or latest) saved address ──
  useEffect(() => {
    if (!user) return
    fetchDefaultAddress()
  }, [user])

  async function fetchDefaultAddress() {
    setAddressLoading(true)
    // Try default first, then fall back to most recent
    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setSavedAddress(data)
      setForm({
        name: data.name,
        phone: data.phone,
        address: data.address,
        notes: '',
      })
    } else {
      // No saved address — pre-fill name/phone from auth profile if available
      setForm(f => ({
        ...f,
        name: user?.name || '',
        phone: user?.phone || '',
      }))
    }
    setAddressLoading(false)
  }

  // ── After loading, if no address → redirect to add address with return URL ──
  // We intentionally do NOT auto-redirect so the user sees WHY they're blocked.
  const noAddress = !addressLoading && !savedAddress

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
    // Hard block — should not happen since button is disabled, but safety net
    if (!savedAddress) {
      setError(tr('addDeliveryAddress') || 'Please add a delivery address first.')
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

            {/* ── Address loading skeleton ── */}
            {addressLoading ? (
              <div className={styles.addrLoadingBar}>
                <div className={styles.addrSpinner} />
                <span>{tr('loadingAddress') || 'Loading your address…'}</span>
              </div>
            ) : noAddress ? (
              /* ── BLOCKED STATE — no address saved ── */
              <div className={styles.noAddrBlock}>
                <div className={styles.noAddrIcon}>📍</div>
                <h3 className={styles.noAddrTitle}>
                  {tr('noAddressSavedTitle') || 'No delivery address yet'}
                </h3>
                <p className={styles.noAddrSub}>
                  {tr('noAddressSavedSub') || 'Add your delivery address before placing an order.'}
                </p>
                <Link
                  href="/account/addresses/new?redirect=/checkout"
                  className={styles.addAddrBtn}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {tr('addDeliveryAddress') || 'Add delivery address'}
                </Link>
              </div>
            ) : (
              /* ── HAS ADDRESS — show read-only card + form ── */
              <>
                {/* Address card — read only */}
                <div className={styles.savedAddrBanner}>
                  <div className={styles.savedAddrLeft}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <div>
                      <span className={styles.savedAddrName}>{savedAddress.name}</span>
                      <span className={styles.savedAddrPhone}>{savedAddress.phone}</span>
                      <span className={styles.savedAddrText}>{savedAddress.address}</span>
                    </div>
                  </div>
                  <Link href="/account/addresses?redirect=/checkout" className={styles.changeAddrBtn}>
                    {tr('change') || 'Change'}
                  </Link>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  {/* Notes only — name/phone/address come from savedAddress */}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
