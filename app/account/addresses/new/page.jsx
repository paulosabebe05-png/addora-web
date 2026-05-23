'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../../lib/auth'
import { useLang } from '../../../../lib/lang'
import { supabase } from '../../../../lib/supabase'
import styles from './new-address.module.css'

export default function NewAddressPage() {
  const { user } = useAuth()
  const { tr } = useLang()
  const router = useRouter()

  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError(tr('fillAllFields') || 'Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      // Check if user has any existing addresses — if none, make this default
      const { count } = await supabase
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { error: insertError } = await supabase.from('addresses').insert({
        user_id: user.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        is_default: count === 0, // auto-default if first address
      })

      if (insertError) throw insertError
      router.push('/account/addresses')
    } catch (err) {
      setError(err.message || 'Failed to save address.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account/addresses" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {tr('addressesLink') || 'Addresses'}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.pageTitle}>{tr('addNewAddress') || 'New Address'}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>{tr('addNewAddress') || 'New Address'}</h1>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>
                {tr('fullNameRequired') || 'Full Name *'}
              </label>
              <input
                className={styles.input}
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={tr('fullNamePlaceholder') || 'e.g. Abebe Girma'}
                autoComplete="name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {tr('phoneNumberRequired') || 'Phone Number *'}
              </label>
              <input
                className={styles.input}
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder={tr('phonePlaceholder') || 'e.g. 0911 123 456'}
                autoComplete="tel"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                {tr('deliveryAddressRequired') || 'Delivery Address *'}
              </label>
              <textarea
                className={styles.textarea}
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder={tr('deliveryAddressPlaceholder') || 'e.g. Bole, near Edna Mall, House No. 42, Addis Ababa'}
                rows={4}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading
                ? <span className={styles.spinner} />
                : (tr('saveAddress') || 'Save Address')
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}