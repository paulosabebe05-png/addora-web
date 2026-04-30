import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // ── Verify auth via Authorization header ──────────────────────────────────
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

    // ── Parse body ────────────────────────────────────────────────────────────
    const body = await request.json()
    const { items, phone, address, notes, subtotal, delivery_fee } = body

    if (!items?.length || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const total = Number(subtotal) + Number(delivery_fee)

    // ── Create order ──────────────────────────────────────────────────────────
    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        user_id,
        subtotal:          Number(subtotal),
        delivery_fee:      Number(delivery_fee),
        total,
        delivery_option:   'standard',
        payment_method:    'cod',
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

    // ── Create order items ────────────────────────────────────────────────────
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

    return NextResponse.json({ order }, { status: 201 })

  } catch (err) {
    console.error('[orders API]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}