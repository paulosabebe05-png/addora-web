// lib/chatbotEngine.js
// Addora Buyer Chatbot - Rule-based engine backed by Supabase
// NO external API required - runs entirely on Supabase DB

import { supabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'

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

  const token = uuidv4()
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
      : 'I\'m not sure about that, but our team can help! 🙏<br>Try one of the options below or contact support.',
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

// ─── Main Process Message (entry point) ──────────────────────────────────────

export async function processMessage(userMessage, sessionId, lang = 'en') {
  const faqs = await loadFaqs()
  const { intent, response, quickReplies, matched } = detectIntent(userMessage, faqs, lang)

  // Save user message
  await saveMessage(sessionId, 'user', userMessage, null)

  // Save bot reply
  await saveMessage(sessionId, 'bot', response, intent)

  // Log unresolved queries for admin review
  if (!matched) {
    await logUnresolved(sessionId, userMessage)
  }

  return { intent, response, quickReplies }
}