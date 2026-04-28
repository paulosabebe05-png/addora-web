'use client'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './cart.module.css'

export default function CartPage() {
  const { items, removeItem, updateQty, total } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    return (
      <div className={styles.guestWrap}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <h2>Sign in to view your cart</h2>
        <p>Your cart items are saved when you're signed in.</p>
        <Link href="/auth/signin?redirect=/cart" className={styles.signInBtn}>Sign In</Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.guestWrap}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.25"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <h2>Your cart is empty</h2>
        <p>Start shopping to add items to your cart.</p>
        <Link href="/" className={styles.signInBtn}>Browse Products</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>My Cart</h1>

        <div className={styles.layout}>
          {/* Items */}
          <div className={styles.items}>
            {items.map(item => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} />
                    : <div className={styles.noImg} />
                  }
                </div>
                <div className={styles.itemBody}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <span className={styles.itemPrice}>ETB {item.price.toLocaleString()}</span>
                  <div className={styles.itemActions}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className={styles.removeBtn}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      Remove
                    </button>
                  </div>
                </div>
                <div className={styles.itemTotal}>
                  ETB {(item.price * item.qty).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span>
              <span>ETB {total.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span className={styles.green}>Calculated at checkout</span>
            </div>

            <div className={styles.summaryTotal}>
              <span>Total</span>
              <span>ETB {total.toLocaleString()}</span>
            </div>

            <div className={styles.codNote}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Pay with <strong>Cash on Delivery</strong>
            </div>

            <button
              className={styles.checkoutBtn}
              onClick={() => router.push('/checkout')}
            >
              Proceed to Checkout
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <Link href="/" className={styles.continueBtn}>
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}