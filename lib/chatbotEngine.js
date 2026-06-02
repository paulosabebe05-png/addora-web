// lib/chatbotEngine.js
// Addora Buyer Chatbot - Rule-based engine backed by Supabase

import { supabase } from './supabase'

// ─── Session Management ──────────────────────────────────────────────────────

export async function getOrCreateSession(userId = null) {
  const stored = localStorage.getItem('addora_chat_session')

  if (stored) {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('session_token', stored)
      .single()
    if (data) return data
  }

  const token = crypto.randomUUID()
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId || null, session_token: token })
    .select()
    .single()

  if (error) throw error
  localStorage.setItem('addora_chat_session', token)
  return data
}

// ─── Load FAQ Knowledge Base from Supabase ───────────────────────────────────

let cachedFaqs = null

export async function loadFaqs() {
  if (cachedFaqs) return cachedFaqs
  const { data, error } = await supabase
    .from('chatbot_faqs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  cachedFaqs = data
  return data
}

// ─── Track Order from Supabase ───────────────────────────────────────────────

async function lookupOrder(userMessage) {
  // Extract order ID or tracking number from the message
  // Matches patterns like: #7AE331F9, 7AE331F9, full UUIDs, or tracking numbers
  const shortIdMatch = userMessage.match(/[#]?([A-F0-9]{8})/i)
  const uuidMatch = userMessage.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
  const trackingMatch = userMessage.match(/\b([A-Z0-9]{6,20})\b/)

  let order = null

  // Try UUID match first (full order ID)
  if (uuidMatch) {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, tracking_number, estimated_delivery, current_location, shipping_provider, tracking_events, delivery_address, payment_method')
      .eq('id', uuidMatch[0])
      .single()
    order = data
  }

  // Try short ID match (first 8 chars of UUID)
  if (!order && shortIdMatch) {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, tracking_number, estimated_delivery, current_location, shipping_provider, tracking_events, delivery_address, payment_method')
      .ilike('id', `${shortIdMatch[1]}%`)
      .single()
    order = data
  }

  // Try tracking number
  if (!order && trackingMatch) {
    const { data } = await supabase
      .from('orders')
      .select('id, status, total, created_at, tracking_number, estimated_delivery, current_location, shipping_provider, tracking_events, delivery_address, payment_method')
      .eq('tracking_number', trackingMatch[1])
      .single()
    order = data
  }

  return order
}

// Try to get the logged-in user's most recent orders
async function getRecentOrders() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('orders')
    .select('id, status, total, created_at, tracking_number, estimated_delivery, current_location, shipping_provider')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return data && data.length > 0 ? data : null
}

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
  return map[status] || status
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-ET', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function buildTrackingResponse(userMessage, lang) {
  // Check if message contains an order reference
  const hasOrderRef = /[#A-F0-9]{6,}/i.test(userMessage) ||
    /order|track|status|where|parcel/i.test(userMessage)

  if (!hasOrderRef) return null

  // Try to find a specific order from the message
  const order = await lookupOrder(userMessage)

  if (order) {
    const shortId = order.id.slice(0, 8).toUpperCase()
    const status = formatOrderStatus(order.status)
    const location = order.current_location || 'Warehouse'
    const provider = order.shipping_provider || 'Addora Delivery'
    const eta = order.estimated_delivery ? formatDate(order.estimated_delivery) : null
    const trackingNo = order.tracking_number || 'Not assigned yet'

    return {
      response: `
        📦 <strong>Order #${shortId}</strong><br>
        Status: <strong>${status}</strong><br>
        Location: ${location}<br>
        Carrier: ${provider}<br>
        Tracking #: ${trackingNo}<br>
        ${eta ? `Est. Delivery: <strong>${eta}</strong>` : ''}
      `.trim(),
      quickReplies: ['Return & refund', 'Contact support', 'Payment methods'],
    }
  }

  // No specific order found — try to show user's recent orders if logged in
  const recentOrders = await getRecentOrders()

  if (recentOrders && recentOrders.length > 0) {
    const orderLines = recentOrders.map(o => {
      const shortId = o.id.slice(0, 8).toUpperCase()
      const status = formatOrderStatus(o.status)
      const date = formatDate(o.created_at)
      return `• <strong>#${shortId}</strong> — ${status} (${date})`
    }).join('<br>')

    return {
      response: `📦 <strong>Your recent orders:</strong><br><br>${orderLines}<br><br>Reply with an order number for full tracking details.`,
      quickReplies: ['Contact support', 'Return & refund'],
    }
  }

  // Not logged in or no orders
  return {
    response: lang === 'am'
      ? 'ትዕዛዝዎን ለመከታተል የትዕዛዝ ቁጥርዎን ያስፍሩ (ለምሳሌ: #7AE331F9) ወይም ወደ <strong>መለያዬ → ትዕዛዞች</strong> ይሂዱ።'
      : 'To track your order, please share your order number (e.g. <strong>#7AE331F9</strong>) or go to <strong>My Account → Orders</strong>.',
    quickReplies: ['Contact support', 'Return & refund'],
  }
}

// ─── Intent Detection ────────────────────────────────────────────────────────

export function detectIntent(userMessage, faqs, lang = 'en') {
  const lower = userMessage.toLowerCase().trim()

  for (const faq of faqs) {
    const matched = faq.keywords.some(keyword =>
      lower.includes(keyword.toLowerCase())
    )
    if (matched) {
      return {
        intent: faq.intent,
        response: lang === 'am' && faq.response_am ? faq.response_am : faq.response_en,
        quickReplies: faq.quick_replies || [],
        matched: true,
      }
    }
  }

  return {
    intent: 'unknown',
    response: lang === 'am'
      ? 'ይቅርታ፣ ጥያቄዎን ሊሠሩ አልቻሉም። ቡድናችን ያግዝዎ። 🙏'
      : "I'm not sure about that, but our team can help! 🙏<br>Try one of the options below or contact support.",
    quickReplies: ['Track my order', 'Payment help', 'Return & refund', 'Contact support'],
    matched: false,
  }
}

// ─── Save Message to Supabase ─────────────────────────────────────────────────

export async function saveMessage(sessionId, role, content, intent = null) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ session_id: sessionId, role, content, intent })
    .select()
    .single()
  if (error) console.error('Error saving message:', error)
  return data
}

// ─── Log Unresolved Query ─────────────────────────────────────────────────────

export async function logUnresolved(sessionId, userMessage) {
  await supabase
    .from('chatbot_unresolved')
    .insert({ session_id: sessionId, user_message: userMessage })
}

// ─── Load Chat History ────────────────────────────────────────────────────────

export async function loadChatHistory(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// ─── Main Process Message ─────────────────────────────────────────────────────

export async function processMessage(userMessage, sessionId, lang = 'en') {
  // Check if this is a tracking request — query orders table directly
  const isTrackingRequest =
    /track|order|where is|status|parcel|shipped|delivery|#[A-F0-9]/i.test(userMessage)

  if (isTrackingRequest) {
    const trackingResult = await buildTrackingResponse(userMessage, lang)
    if (trackingResult) {
      await saveMessage(sessionId, 'user', userMessage, null)
      await saveMessage(sessionId, 'bot', trackingResult.response, 'track_order')
      return { intent: 'track_order', ...trackingResult }
    }
  }

  // Fall back to FAQ matching
  const faqs = await loadFaqs()
  const { intent, response, quickReplies, matched } = detectIntent(userMessage, faqs, lang)

  await saveMessage(sessionId, 'user', userMessage, null)
  await saveMessage(sessionId, 'bot', response, intent)

  if (!matched) {
    await logUnresolved(sessionId, userMessage)
  }

  return { intent, response, quickReplies }
}
