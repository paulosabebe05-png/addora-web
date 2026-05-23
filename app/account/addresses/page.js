'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLang } from '../../../lib/lang'
import { useAuth } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import styles from './addresses.module.css'

export default function AddressesPage() {
  const { tr } = useLang()
  const { user } = useAuth()
  const router = useRouter()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

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
    // Unset all, then set the chosen one
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id)
    await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id)
    fetchAddresses()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('addresses').delete().eq('id', id)
    setAddresses(prev => prev.filter(a => a.id !== id))
    setDeleting(null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/account" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          {tr('account')}
        </Link>
        <span className={styles.sep}>›</span>
        <span className={styles.pageTitle}>{tr('addressesLink')}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>📍</div>
          <div>
            <h1 className={styles.title}>{tr('deliveryAddressesTitle')}</h1>
            <p className={styles.sub}>{tr('deliveryAddressesSub')}</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
          </div>
        ) : addresses.length === 0 ? (
          <div className={styles.emptyCard}>
            <span className={styles.emptyIcon}>🏠</span>
            <h2 className={styles.emptyTitle}>{tr('noAddressesSaved')}</h2>
            <p className={styles.emptySub}>{tr('addAddressFaster')}</p>
            <Link href="/account/addresses/new" className={styles.addBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {tr('addNewAddress')}
            </Link>
          </div>
        ) : (
          <div className={styles.listWrap}>
            {addresses.map(addr => (
              <div key={addr.id} className={`${styles.addressCard} ${addr.is_default ? styles.defaultCard : ''}`}>
                {addr.is_default && (
                  <span className={styles.defaultBadge}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    {tr('defaultAddress') || 'Default'}
                  </span>
                )}
                <div className={styles.addrMeta}>
                  <span className={styles.addrName}>{addr.name}</span>
                  <span className={styles.addrPhone}>{addr.phone}</span>
                </div>
                <p className={styles.addrText}>{addr.address}</p>
                <div className={styles.addrActions}>
                  {!addr.is_default && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      {tr('setAsDefault') || 'Set as default'}
                    </button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleting === addr.id}
                  >
                    {deleting === addr.id ? '…' : (tr('delete') || 'Delete')}
                  </button>
                </div>
              </div>
            ))}

            <Link href="/account/addresses/new" className={styles.addBtnOutline}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {tr('addNewAddress')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
