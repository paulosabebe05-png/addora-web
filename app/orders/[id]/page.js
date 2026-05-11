'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '../../../lib/lang'
import styles from './orderDetail.module.css'

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailPage() {
  const { user } = useAuth()
  const { tr } = useLang()
  const params = useParams()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === '1'

  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Map DB status → translation key
  const STATUS_LABELS = {
    pending:    tr('stepOrderPlaced'),
    confirmed:  tr('stepConfirmed'),
    processing: tr('stepProcessing'),
    shipped:    tr('stepShipped'),
    delivered:  tr('stepDelivered'),
  }

  useEffect(() => {
    if (!user || !params.id) return
    Promise.all([
      supabase.from('orders').select('*').eq('id', params.id).eq('user_id', user.id).single(),
      supabase.from('order_items').select('id, order_id, product_id, product_name, product_image, quantity, price, size, color, color_hex, variant_id').eq('order_id', params.id)
    ]).then(([{ data: ord }, { data: items }]) => {
      setOrder(ord)
      setOrderItems(items || [])
      setLoading(false)
    })
  }, [user, params.id])

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <Link href="/auth/signin" className={styles.signInBtn}>{tr('signInBtn')}</Link>
      </div>
    )
  }

  if (loading) return <div className={styles.page}><div className="container"><p>{tr('loadingOrder')}</p></div></div>
  if (!order)  return <div className={styles.page}><div className="container"><p>{tr('orderNotFound')}</p></div></div>

  const currentStep = STEPS.indexOf(order.status)

  return (
    <div className={styles.page}>
      <div className="container">

        {/* Success banner */}
        {isSuccess && (
          <div className={styles.successBanner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/>
            </svg>
            <div>
              <strong>{tr('orderPlacedSuccessTitle')}</strong>
              <p>{tr('orderPlacedSuccessSub')}</p>
            </div>
          </div>
        )}

        <div className={styles.header}>
          <div>
            <Link href="/orders" className={styles.back}>← {tr('myOrders')}</Link>
            <h1 className={styles.title}>{tr('orderPrefix')}{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className={styles.date}>
              {new Date(order.created_at).toLocaleDateString('en-ET', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Status timeline */}
        <div className={styles.timeline}>
          {STEPS.map((step, i) => {
            const done   = i <= currentStep
            const active = i === currentStep
            return (
              <div key={step} className={`${styles.step} ${done ? styles.done : ''} ${active ? styles.active : ''}`}>
                <div className={styles.stepDot}>
                  {done && i < currentStep
                    ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <span>{i + 1}</span>
                  }
                </div>
                {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < currentStep ? styles.lineActive : ''}`} />}
                <span className={styles.stepLabel}>{STATUS_LABELS[step]}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.main}>
            <div className={styles.card}>
              <h2>{tr('itemsOrdered')}</h2>
              {orderItems.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    {(item.product_image || item.products?.image_url) && (
                      <img src={item.product_image || item.products?.image_url} alt="" />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <strong>{item.product_name || item.products?.name || 'Product'}</strong>
                    {(item.color || item.size) && (
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                        {item.color && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#f3f4f6', padding: '3px 8px', borderRadius: 20, color: '#374151', fontWeight: 500 }}>
                            <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color_hex || item.color.toLowerCase(), border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0, display: 'inline-block' }} />
                            {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#f3f4f6', padding: '3px 8px', borderRadius: 20, color: '#374151', fontWeight: 500 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                            {item.size}
                          </span>
                        )}
                      </span>
                    )}
                    <span>{tr('qty')}: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>ETB {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h2>{tr('deliveryAddress')}</h2>
              <p className={styles.address}>{order.delivery_address}</p>
              <p className={styles.phone}>📞 {order.phone}</p>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2>{tr('orderTotal')}</h2>
              <div className={styles.rows}>
                <div className={styles.row}><span>{tr('subtotal')}</span><span>ETB {order.subtotal?.toLocaleString()}</span></div>
                <div className={styles.row}><span>{tr('deliveryLabel')}</span><span>ETB {order.delivery_fee?.toLocaleString()}</span></div>
                {order.discount > 0 && (
                  <div className={styles.row}><span>{tr('discountLabel')}</span><span>-ETB {order.discount?.toLocaleString()}</span></div>
                )}
                <div className={`${styles.row} ${styles.totalRow}`}><span>{tr('total')}</span><span>ETB {order.total?.toLocaleString()}</span></div>
              </div>
              <div className={styles.codTag}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                {tr('cashOnDelivery')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
