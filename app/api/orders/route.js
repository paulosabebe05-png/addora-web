import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Payment methods that are actually live and allowed to create an order.
// Add to this list as you wire up telebirr / cbebirr / chapa on the backend.
const ENABLED_PAYMENT_METHODS = ['cod']

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }
    const user_id = user.id
    const body = await request.json()
    const { items, phone, address, notes, subtotal, delivery_fee, payment_method } = body
    if (!items?.length || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Default to COD, and reject anything not yet supported server-side.
    // This mirrors the disabled state on the checkout UI, but enforces it
    // here too in case the request is ever sent directly (e.g. via API).
    const requestedMethod = payment_method || 'cod'
    if (!ENABLED_PAYMENT_METHODS.includes(requestedMethod)) {
      return NextResponse.json(
        { error: 'This payment method is not available yet. Please use Cash on Delivery.' },
        { status: 400 }
      )
    }

    const total = Number(subtotal) + Number(delivery_fee)
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        user_id,
        subtotal:          Number(subtotal),
        delivery_fee:      Number(delivery_fee),
        total,
        delivery_option:   'standard',
        payment_method:    requestedMethod,
        payment_status:    'pending',
        status:            'pending',
        delivery_address:  address,
        phone,
        shipping_provider: 'Addora Delivery',
        current_location:  'Warehouse',
      })
      .select()
      .single()
    if (orderErr) {
      console.error('[order insert]', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
    const orderItems = items.map(item => {
      const row = {
        order_id:      order.id,
        product_id:    item.id,
        product_name:  item.name,
        product_image: item.image_url ?? null,
        quantity:      item.qty,
        price:         item.price,
      }
      if (item.variant_id) row.variant_id = item.variant_id
      if (item.size)       row.size       = item.size
      if (item.color)      row.color      = item.color
      if (item.color_hex)  row.color_hex  = item.color_hex
      return row
    })
    const { error: itemsErr } = await adminSupabase
      .from('order_items')
      .insert(orderItems)
    if (itemsErr) {
      console.error('[order_items insert]', itemsErr)
      await adminSupabase.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 })
    }
    // ── Notify user ───────────────────────────────────────────────────────────
    const { error: notifErr } = await adminSupabase
      .from('notifications')
      .insert({
        user_id:    user_id,
        profile_id: user_id,
        title:      'Order Placed Successfully! 🎉',
        body:       `Your order of ETB ${total.toFixed(2)} has been placed and is being processed.`,
        is_read:    false,
      })
    if (notifErr) {
      console.error('[notification insert error]', JSON.stringify(notifErr))
    }
    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    console.error('[orders API]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
