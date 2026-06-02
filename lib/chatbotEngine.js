// lib/chatbotEngine.js
// Addora Buyer Chatbot — Rule-based engine backed by Supabase
// Production-hardened: error handling, XSS-safe, query-efficient

import { supabase } from './supabase'

// ─── Session Management ──────────────────────────────────────────────────────

export async function getOrCreateSession(userId = null) {
  let stored = null
  try {
    stored = localStorage.getItem('addora_chat_session')
  } catch {
    // localStorage unavailable (SSR or private mode) — proceed without it
  }

  if (stored) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_token', stored)
      .maybeSingle()
    if (!error && data) return data
  }

  const token = crypto.randomUUID()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId || null, session_token: token })
    .select()
    .single()

  if (error) throw new Error(`Failed to create chat session: ${error.message}`)

  try {
    localStorage.setItem('addora_chat_session', token)
  } catch {
    // Silently ignore localStorage write failures
  }

  return data
}

// ─── FAQ Knowledge Base ───────────────────────────────────────────────────────

const FAQ_CACHE_TTL_MS = 5 * 60 * 1000
let faqCache = { data: null, fetchedAt: 0 }

export async function loadFaqs() {
  const now = Date.now()
  if (faqCache.data && now - faqCache.fetchedAt < FAQ_CACHE_TTL_MS) {
    return faqCache.data
  }

  const { data, error } = await supabase
    .from('chatbot_faqs')
    .select('intent, keywords, response_en, response_am, quick_replies, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(`Failed to load FAQs: ${error.message}`)

  faqCache = { data, fetchedAt: now }
  return data
}

// ─── Order Lookup ─────────────────────────────────────────────────────────────

// ✅ FIXED: Added order_items join so we get full product details
const ORDER_FIELDS = `
  id,
  status,
  subtotal,
  delivery_fee,
  discount,
  total,
  created_at,
  tracking_number,
  estimated_delivery,
  current_location,
  shipping_provider,
  delivery_address,
  payment_method,
  tracking_events,
  order_items (
    id,
    product_name,
    product_image,
    quantity,
    price,
    size,
    color
  )
`

/**
 * Extracts the first recognised order/tracking identifier from a user message
 * and queries Supabase for a matching order (with items).
 * Resolution priority: full UUID → 8-char short ID → tracking number.
 */
async function lookupOrder(userMessage) {
  // Full UUID
  const uuidMatch = userMessage.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  )
  if (uuidMatch) {
    const { data } = await supabase
      .from('orders')
      .select(ORDER_FIELDS)
      .eq('id', uuidMatch[0].toLowerCase())
      .maybeSingle()
    if (data) return data
  }

  // Short hex ID (8 chars, optionally prefixed with #)
  const shortIdMatch = userMessage.match(/(?:^|[\s#])([0-9A-Fa-f]{8})(?:\b|$)/)
  if (shortIdMatch) {
    const { data } = await supabase
      .from('orders')
      .select(ORDER_FIELDS)
      .ilike('id', `${shortIdMatch[1]}%`)
      .maybeSingle()
    if (data) return data
  }

  // Tracking number — alphanumeric, 6–20 chars, must contain at least one digit
  const trackingMatch = userMessage.match(/\b([A-Z0-9]{6,20})\b/i)
  if (trackingMatch && /\d/.test(trackingMatch[1])) {
    const { data } = await supabase
      .from('orders')
      .select(ORDER_FIELDS)
      .eq('tracking_number', trackingMatch[1].toUpperCase())
      .maybeSingle()
    if (data) return data
  }

  return null
}

async function getRecentOrders() {
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) return null

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      tracking_number,
      estimated_delivery,
      current_location,
      shipping_provider,
      order_items (
        product_name,
        quantity,
        price
      )
    `)
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) {
    console.error('Error fetching recent orders:', error)
    return null
  }

  return data && data.length > 0 ? data : null
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function formatOrderStatus(status) {
  const map = {
    pending:    '🕐 Pending',
    confirmed:  '✅ Confirmed',
    processing: '⚙️ Processing',
    shipped:    '🚚 Shipped',
    delivered:  '📦 Delivered',
    cancelled:  '❌ Cancelled',
    refunded:   '💸 Refunded',
  }
  return map[status] ?? status
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

function formatCurrency(amount) {
  if (amount == null) return null
  return `ETB ${Number(amount).toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Renders the order_items array as an HTML list of product lines.
 * Example output:
 *   • Nike Air Max x1 — ETB 2,400.00  [Size: 42 | Color: Black]
 */
function formatOrderItems(items) {
  if (!items || items.length === 0) return null

  const lines = items.map(item => {
    const qty   = item.quantity > 1 ? ` x${item.quantity}` : ''
    const price = formatCurrency(item.price * item.quantity)
    const attrs = [
      item.size  ? `Size: ${item.size}`   : null,
      item.color ? `Color: ${item.color}` : null,
    ].filter(Boolean).join(' | ')

    return `&nbsp;&nbsp;• <b>${item.product_name}</b>${qty} — ${price}${attrs ? ` <span style="color:#6b7280;font-size:12px;">[${attrs}]</span>` : ''}`
  })

  return lines.join('<br>')
}

// ─── Tracking response builder ────────────────────────────────────────────────

function isOrderTrackingIntent(userMessage) {
  const lower = userMessage.toLowerCase()

  const hasId =
    /[0-9a-f]{8}-[0-9a-f]{4}/.test(lower) ||
    /(?:^|[\s#])[0-9a-f]{8}(?:\b|$)/i.test(userMessage) ||
    /\b[A-Z]{2,4}\d{6,}\b/.test(userMessage)

  const hasTrackingVerb =
    /\b(track|where is|where's|shipped|in transit|parcel|dispatch|estimated delivery)\b/i.test(userMessage)

  const hasStatusEnquiry =
    /\b(order status|check.*order|order.*status|my order)\b/i.test(lower)

  return hasId || hasTrackingVerb || hasStatusEnquiry
}

async function buildTrackingResponse(userMessage, lang) {
  if (!isOrderTrackingIntent(userMessage)) return null

  const order = await lookupOrder(userMessage)

  if (order) {
    const shortId  = order.id.slice(0, 8).toUpperCase()
    const status   = formatOrderStatus(order.status)
    const location = order.current_location || 'Warehouse'
    const provider = order.shipping_provider || 'Addora Delivery'
    const eta      = formatDate(order.estimated_delivery)
    const trackingNo = order.tracking_number || 'Not assigned yet'

    // ✅ Build items section
    const itemLines = formatOrderItems(order.order_items)

    // ✅ Build price breakdown
    const subtotal    = formatCurrency(order.subtotal)
    const deliveryFee = formatCurrency(order.delivery_fee)
    const discount    = order.discount > 0 ? formatCurrency(order.discount) : null
    const total       = formatCurrency(order.total)

    const lines = [
      `📦 <strong>Order #${shortId}</strong>`,
      `<hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0;">`,

      // ── Items ──
      itemLines ? `<b>Items:</b><br>${itemLines}` : null,
      itemLines ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0;">` : null,

      // ── Price breakdown ──
      subtotal    ? `Subtotal: ${subtotal}`             : null,
      deliveryFee ? `Delivery: ${deliveryFee}`          : null,
      discount    ? `Discount: <span style="color:#16a34a;">−${discount}</span>` : null,
      total       ? `<b>Total: ${total}</b>`            : null,

      `<hr style="border:none;border-top:1px solid #e5e7eb;margin:6px 0;">`,

      // ── Shipping ──
      `Status: <strong>${status}</strong>`,
      `Location: ${location}`,
      `Carrier: ${provider}`,
      `Tracking #: ${trackingNo}`,
      eta ? `Est. Delivery: <strong>${eta}</strong>` : null,
    ].filter(Boolean).join('<br>')

    return {
      response: lines,
      quickReplies: ['Return & refund', 'Contact support', 'Payment methods'],
    }
  }

  // No specific order found — show user's recent orders if logged in
  const recentOrders = await getRecentOrders()

  if (recentOrders) {
    const orderLines = recentOrders.map(o => {
      const shortId = o.id.slice(0, 8).toUpperCase()
      const status  = formatOrderStatus(o.status)
      const date    = formatDate(o.created_at)
      const total   = formatCurrency(o.total)

      // Show first product name as a preview
      const firstItem = o.order_items?.[0]
      const itemPreview = firstItem
        ? ` — ${firstItem.product_name}${o.order_items.length > 1 ? ` +${o.order_items.length - 1} more` : ''}`
        : ''

      return `• <strong>#${shortId}</strong>${itemPreview}<br>&nbsp;&nbsp;${status}${date ? ` · ${date}` : ''}${total ? ` · ${total}` : ''}`
    }).join('<br><br>')

    return {
      response: `📦 <strong>Your recent orders:</strong><br><br>${orderLines}<br><br>Share an order number for full tracking details.`,
      quickReplies: ['Contact support', 'Return & refund'],
    }
  }

  // Not logged in / no orders found
  return {
    response: lang === 'am'
      ? 'ትዕዛዝዎን ለመከታተል የትዕዛዝ ቁጥርዎን ያስፍሩ (ለምሳሌ: <strong>#7AE331F9</strong>) ወይም ወደ <strong>መለያዬ → ትዕዛዞች</strong> ይሂዱ።'
      : 'To track your order, share your order number (e.g. <strong>#7AE331F9</strong>) or visit <strong>My Account → Orders</strong>.',
    quickReplies: ['Contact support', 'Return & refund'],
  }
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

export function detectIntent(userMessage, faqs, lang = 'en') {
  const lower = userMessage.toLowerCase().trim()

  for (const faq of faqs) {
    if (!Array.isArray(faq.keywords)) continue
    const matched = faq.keywords.some(kw =>
      typeof kw === 'string' && lower.includes(kw.toLowerCase())
    )
    if (matched) {
      return {
        intent: faq.intent,
        response: lang === 'am' && faq.response_am ? faq.response_am : faq.response_en,
        quickReplies: Array.isArray(faq.quick_replies) ? faq.quick_replies : [],
        matched: true,
      }
    }
  }

  return {
    intent: 'unknown',
    response: lang === 'am'
      ? 'ይቅርታ፣ ጥያቄዎን ሊሠሩ አልቻሉም። ቡድናችን ያግዝዎ። 🙏'
      : "I'm not sure about that, but our team can help! 🙏<br>Try one of the options below or contact support.",
    quickReplies: ['Track my order', 'Payment methods', 'Return & refund', 'Contact support'],
    matched: false,
  }
}

// ─── Persistence helpers ──────────────────────────────────────────────────────

export async function saveMessage(sessionId, role, content, intent = null) {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role, content, intent })
      .select('id')
      .single()
    if (error) console.error('saveMessage error:', error.message)
    return data
  } catch (err) {
    console.error('saveMessage unexpected error:', err)
    return null
  }
}

export async function logUnresolved(sessionId, userMessage) {
  try {
    const { error } = await supabase
      .from('chatbot_unresolved')
      .insert({ session_id: sessionId, user_message: userMessage })
    if (error) console.error('logUnresolved error:', error.message)
  } catch (err) {
    console.error('logUnresolved unexpected error:', err)
  }
}

export async function loadChatHistory(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(`Failed to load chat history: ${error.message}`)
  return data || []
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function processMessage(userMessage, sessionId, lang = 'en') {
  await saveMessage(sessionId, 'user', userMessage, null)

  if (isOrderTrackingIntent(userMessage)) {
    try {
      const trackingResult = await buildTrackingResponse(userMessage, lang)
      if (trackingResult) {
        await saveMessage(sessionId, 'bot', trackingResult.response, 'track_order')
        return { intent: 'track_order', ...trackingResult }
      }
    } catch (err) {
      console.error('Tracking lookup error:', err)
    }
  }

  let faqs = []
  try {
    faqs = await loadFaqs()
  } catch (err) {
    console.error('FAQ load error:', err)
    const fallback = {
      intent: 'error',
      response: lang === 'am'
        ? 'ይቅርታ፣ ለጊዜው ማገናኘት አልተቻለም። እባክዎ ድጋፍ ያግኙ።'
        : "Sorry, I'm having trouble right now. Please contact our support team.",
      quickReplies: ['Contact support'],
    }
    await saveMessage(sessionId, 'bot', fallback.response, fallback.intent)
    return fallback
  }

  const { intent, response, quickReplies, matched } = detectIntent(userMessage, faqs, lang)

  await saveMessage(sessionId, 'bot', response, intent)
  if (!matched) await logUnresolved(sessionId, userMessage)

  return { intent, response, quickReplies }
}
