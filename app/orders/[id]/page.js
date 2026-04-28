'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '../../../lib/auth'
import { supabase } from '../../../lib/supabase'
import { useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './orderDetail.module.css'

const STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

export default function OrderDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const searchParams = useSearchParams()
  const isSuccess = searchParams.get('success') === '1'

  const [order, setOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !params.id) return
    Promise.all([
      supabase.from('orders').select('*').eq('id', params.id).eq('user_id', user.id).single(),
      supabase.from('order_items').select('id, order_id, product_id, product_name, product_image, quantity, price, size, color, variant_id').eq('order_id', params.id)
    ]).then(([{ data: ord }, { data: items }]) => {
      setOrder(ord)
      setOrderItems(items || [])
      setLoading(false)
    })
  }, [user, params.id])

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <Link href="/auth/signin" className={styles.signInBtn}>Sign In</Link>
      </div>
    )
  }

  if (loading) return <div className={styles.page}><div className="container"><p>Loading order...</p></div></div>
  if (!order) return <div className={styles.page}><div className="container"><p>Order not found.</p></div></div>

  const currentStep = STEPS.indexOf(order.status)

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Success banner */}
        {isSuccess && (
          <div className={styles.successBanner}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong>Order placed successfully!</strong>
              <p>We'll call you to confirm your order soon.</p>
            </div>
          </div>
        )}

        <div className={styles.header}>
          <div>
            <Link href="/orders" className={styles.back}>← My Orders</Link>
            <h1 className={styles.title}>Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className={styles.date}>
              Placed on {new Date(order.created_at).toLocaleDateString('en-ET', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Status timeline */}
        <div className={styles.timeline}>
          {STEPS.map((step, i) => {
            const done = i <= currentStep
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
              <h2>Items Ordered</h2>
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
                      <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                        {item.color && (
                          <span style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, color: '#374151' }}>
                            🎨 {item.color}
                          </span>
                        )}
                        {item.size && (
                          <span style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4, color: '#374151' }}>
                            📐 Size: {item.size}
                          </span>
                        )}
                      </span>
                    )}
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>ETB {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h2>Delivery Address</h2>
              <p className={styles.address}>{order.delivery_address}</p>
              <p className={styles.phone}>📞 {order.phone}</p>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.sidebar}>
            <div className={styles.card}>
              <h2>Order Total</h2>
              <div className={styles.rows}>
                <div className={styles.row}><span>Subtotal</span><span>ETB {order.subtotal?.toLocaleString()}</span></div>
                <div className={styles.row}><span>Delivery</span><span>ETB {order.delivery_fee?.toLocaleString()}</span></div>
                {order.discount > 0 && <div className={styles.row}><span>Discount</span><span>-ETB {order.discount?.toLocaleString()}</span></div>}
                <div className={`${styles.row} ${styles.totalRow}`}><span>Total</span><span>ETB {order.total?.toLocaleString()}</span></div>
              </div>
              <div className={styles.codTag}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Cash on Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}