'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import styles from './orders.module.css'
import { useLang } from '../../lib/lang'   // ← ADDED

// Status config now uses translation keys instead of hardcoded English labels
const STATUS_CONFIG = {
  pending:    { key: 'statusPending',    color: '#f59e0b', bg: '#fffbeb' },
  confirmed:  { key: 'statusConfirmed',  color: '#3b82f6', bg: '#eff6ff' },
  processing: { key: 'statusProcessing', color: '#8b5cf6', bg: '#f5f3ff' },
  shipped:    { key: 'statusShipped',    color: '#0ea5e9', bg: '#f0f9ff' },
  delivered:  { key: 'statusDelivered',  color: '#16a34a', bg: '#f0fdf4' },
  cancelled:  { key: 'statusCancelled',  color: '#e53e3e', bg: '#fff5f5' },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { tr } = useLang()   // ← ADDED
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || [])
        setLoading(false)
      })
  }, [user])

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <h2>{tr('signInToViewOrders')}</h2>
        <Link href="/auth/signin?redirect=/orders" className={styles.signInBtn}>{tr('signIn')}</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>{tr('myOrdersTitle')}</h1>

        {loading ? (
          <div className={styles.loading}>
            {[1,2,3].map(i => (
              <div key={i} className={`${styles.orderCard} skeleton`} style={{ height: 100 }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <h2>{tr('noOrdersTitle')}</h2>
            <p>{tr('noOrdersSub')}</p>
            <Link href="/" className={styles.signInBtn}>{tr('shopNowBtn')}</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className={styles.orderCard}>
                  <div className={styles.orderLeft}>
                    <div className={styles.orderId}>{tr('orderPrefix')}{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className={styles.orderDate}>
                      {new Date(order.created_at).toLocaleDateString('en-ET', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className={styles.orderMid}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: status.color, background: status.bg }}
                    >
                      {tr(status.key)}
                    </span>
                    <span className={styles.payMethod}>{tr('cashOnDeliveryFull')}</span>
                  </div>

                  <div className={styles.orderRight}>
                    <span className={styles.orderTotal}>ETB {order.total.toLocaleString()}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
