import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const body = await request.json()
    const { user_id, items, name, phone, address, notes, subtotal, delivery_fee } = body

    if (!user_id || !items?.length || !phone || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: user, error: userErr } = await adminSupabase
      .from('users').select('id').eq('id', user_id).single()

    if (userErr || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const total = subtotal + delivery_fee

    const { data: order, error: orderErr } = await adminSupabase
      .from('orders')
      .insert({
        user_id, subtotal, delivery_fee, total,
        delivery_option: 'standard',
        payment_method: 'cod',
        payment_status: 'pending',
        status: 'pending',
        delivery_address: address,
        phone,
        shipping_provider: 'Addora Delivery',
        current_location: 'Warehouse',
      })
      .select().single()

    if (orderErr) {
      console.error('Order insert error:', orderErr)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Build order items — include variant_id, size, color when present
    const orderItems = items.map(item => {
      const row = {
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_image: item.image_url || null,
        quantity: item.qty,
        price: item.price,
      }
      if (item.variant_id) row.variant_id = item.variant_id
      if (item.size)       row.size       = item.size
      if (item.color)      row.color      = item.color
      return row
    })

    const { error: itemsErr } = await adminSupabase.from('order_items').insert(orderItems)
    if (itemsErr) console.error('Order items insert error:', itemsErr)

    return NextResponse.json({ order }, { status: 201 })

  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}