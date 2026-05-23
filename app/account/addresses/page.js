'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLang } from '../../../lib/lang'
import { useAuth } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import styles from './addresses.module.css'

export default function AddressesPage() {
  const { tr } = useLang()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [settingDefault, setSettingDefault] = useState(null)

  useEffect(() => {
    if (!user) return
    fetchAddresses()
  }, [user])

  async function fetchAddresses() {
    setLoading(true)
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setAddresses(data || [])
    setLoading(false)
  }

  async function handleSetDefault(id) {
    setSettingDefault(id)
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    await fetchAddresses()
    setSettingDefault(null)
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {tr('account') || 'Account'}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.pageTitle}>{tr('addressesLink') || 'Addresses'}</span>
      </div>

      <div className={styles.content}>

        {/* Hero header */}
        <div className={styles.hero}>
          <div className={styles.heroIconWrap}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.heroTitle}>
              {tr('deliveryAddressesTitle') || 'Delivery Addresses'}
            </h1>
            <p className={styles.heroSub}>
              {tr('deliveryAddressesSub') || 'Manage your saved delivery locations'}
            </p>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinnerRing} />
            <span className={styles.loadingText}>Loading addresses…</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIllustration}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d8d8d4" strokeWidth="1.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h2 className={styles.emptyTitle}>
              {tr('noAddressesSaved') || 'No saved addresses'}
            </h2>
            <p className={styles.emptySub}>
              {tr('addAddressFaster') || 'Save an address for faster checkout'}
            </p>
            <Link href="/account/addresses/new" className={styles.addBtnFilled}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {tr('addNewAddress') || 'Add new address'}
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {addresses.map((addr, i) => (
              <div
                key={addr.id}
                className={`${styles.card} ${addr.is_default ? styles.cardDefault : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Top row */}
                <div className={styles.cardTop}>
                  <div className={styles.cardPin}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke={addr.is_default ? 'var(--orange, #e75525)' : '#aaa'} strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardNameRow}>
                      <span className={styles.cardName}>{addr.name}</span>
                      {addr.is_default && (
                        <span className={styles.defaultPill}>
                          ★ {tr('defaultAddress') || 'Default'}
                        </span>
                      )}
                    </div>
                    <span className={styles.cardPhone}>{addr.phone}</span>
                    <p className={styles.cardAddr}>{addr.address}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className={styles.cardDivider} />

                {/* Actions */}
                <div className={styles.cardActions}>
                  {!addr.is_default && (
                    <button
                      className={styles.btnGhost}
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={settingDefault === addr.id}
                    >
                      {settingDefault === addr.id ? (
                        <span className={styles.dotSpinner} />
                      ) : (
                        <>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          {tr('setAsDefault') || 'Set as default'}
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className={`${styles.btnGhost} ${styles.btnDelete}`}
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleting === addr.id}
                  >
                    {deleting === addr.id ? (
                      <span className={styles.dotSpinner} />
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
                        </svg>
                        {tr('delete') || 'Delete'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Add another */}
            <Link href="/account/addresses/new" className={styles.addBtnDashed}>
              <span className={styles.addBtnDashedIcon}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              {tr('addNewAddress') || 'Add new address'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
