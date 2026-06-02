// components/ChatBot.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { getOrCreateSession, processMessage } from '@/lib/chatbotEngine'
import { useLang } from '@/lib/lang'

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND = { primary: '#E75525', dark: '#10182B', green: '#4ade80' }

const WELCOME = {
  en: {
    text: "👋 Hello! I'm the <strong>Addora Assistant</strong>. How can I help you today?",
    quick: ['Track my order', 'Payment methods', 'Return & refund', 'Browse products', 'Contact support'],
  },
  am: {
    text: "👋 ሰላም! እኔ <strong>Addora አስፈፃሚ</strong> ነኝ። ዛሬ እንዴት ልረዳዎ?",
    quick: ['ትዕዛዝ ከታተል', 'የክፍያ ዘዴዎች', 'ተመላሽ & ሪፈንድ', 'ድጋፍ ያግኙ'],
  },
}

function buildWelcomeMessage(lang) {
  const w = WELCOME[lang] || WELCOME.en
  return {
    id: 'welcome',
    role: 'bot',
    text: w.text,
    quickReplies: w.quick,
    time: formatTime(new Date()),
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sanitizeHtml(html) {
  let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
  clean = clean.replace(/href\s*=\s*["']?\s*javascript:[^"'\s>]*/gi, '')
  return clean
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatBot() {
  const { lang } = useLang()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => [buildWelcomeMessage('en')])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [sessionError, setSessionError] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const mountedRef = useRef(true)

  // ── Session init ────────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    async function init() {
      try {
        const sess = await getOrCreateSession()
        if (!cancelled) setSession(sess)
      } catch (err) {
        console.error('Chatbot session init error:', err)
        if (!cancelled) setSessionError(true)
      }
    }

    init()
    return () => { cancelled = true; mountedRef.current = false }
  }, [])

  // ── Welcome message respects current lang ──────────────────────────────────
  useEffect(() => {
    setMessages([buildWelcomeMessage(lang)])
    if (!isOpen) setUnreadCount(1)
  }, [lang]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading])

  // ── Clear unread when opened; focus input ──────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // ── Send handler ───────────────────────────────────────────────────────────
  const handleSend = useCallback(async (quickText) => {
    const msg = (quickText ?? input).trim()
    if (!msg || loading) return

    if (!quickText) setInput('')

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: msg,
      time: formatTime(new Date()),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      if (sessionError || !session) throw new Error('no-session')

      const { response, quickReplies } = await processMessage(msg, session.id, lang)

      if (!mountedRef.current) return
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: response,
        quickReplies: Array.isArray(quickReplies) ? quickReplies : [],
        time: formatTime(new Date()),
      }])
      if (!isOpen) setUnreadCount(c => c + 1)
    } catch (err) {
      if (!mountedRef.current) return
      const isNoSession = err.message === 'no-session'
      setMessages(prev => [...prev, {
        id: `b-err-${Date.now()}`,
        role: 'bot',
        text: isNoSession
          ? "⚠️ Couldn't connect to support. Please refresh the page or <strong>contact us directly</strong>."
          : lang === 'am'
            ? 'ይቅርታ፣ ስህተት ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።'
            : 'Sorry, something went wrong. Please try again.',
        quickReplies: ['Contact support'],
        time: formatTime(new Date()),
      }])
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [input, loading, session, sessionError, isOpen, lang])

  // ── Escape closes chat ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close chat support' : 'Open chat support'}
        aria-expanded={isOpen}
        style={{
          position: 'fixed',
          // Sit above the mobile bottom nav bar (~64px) + safe area for iOS home indicator
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          right: '16px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: BRAND.primary,
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(231,85,37,0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(231,85,37,0.55)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(231,85,37,0.4)'
        }}
      >
        <span style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isOpen ? (
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
            </svg>
          )}
        </span>

        {/* Unread badge */}
        {!isOpen && unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`}
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: BRAND.dark,
              color: 'white',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid white',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Addora Support Chat"
          aria-modal="false"
          style={{
            position: 'fixed',
            // Keep the window above the FAB, which is already above the nav bar
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)',
            right: '16px',
            zIndex: 9998,
            width: '370px',
            maxWidth: 'calc(100vw - 32px)',
            // Clamp height so it never overlaps the top of the screen
            maxHeight: 'calc(100vh - env(safe-area-inset-bottom, 0px) - 220px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            animation: 'chatWindowIn 0.22s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: BRAND.dark,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: BRAND.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '17px',
              flexShrink: 0,
              userSelect: 'none',
            }}>
              A
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0, lineHeight: 1.3 }}>
                Addora Support
              </p>
              <p style={{
                color: '#9FB3C8',
                fontSize: '12px',
                margin: '2px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: BRAND.green,
                  display: 'inline-block',
                  flexShrink: 0,
                }} />
                Always here to help
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '8px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Messages ── */}
          <div
            ref={bodyRef}
            style={{
              background: '#f8f9fb',
              flex: 1,
              minHeight: '200px',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db transparent',
            }}
          >
            {messages.map(m => (
              <MessageBubble
                key={m.id}
                message={m}
                onQuickReply={handleSend}
                isLoading={loading}
              />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {/* ── Input ── */}
          <div style={{
            background: 'white',
            borderTop: '1px solid #f0f0f2',
            padding: '10px 12px',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={lang === 'am' ? 'ጥያቄዎን ያስፍሩ...' : 'Type your question...'}
              disabled={loading}
              aria-label="Chat message input"
              style={{
                flex: 1,
                background: '#f4f5f7',
                border: '1.5px solid transparent',
                borderRadius: '24px',
                padding: '9px 16px',
                fontSize: '14px',
                color: BRAND.dark,
                outline: 'none',
                transition: 'border-color 0.15s',
                lineHeight: '1.4',
              }}
              onFocus={e => e.target.style.borderColor = BRAND.primary}
              onBlur={e => e.target.style.borderColor = 'transparent'}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: loading || !input.trim() ? '#f3a07a' : BRAND.primary,
                border: 'none',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.transform = 'scale(1.08)' }}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>

          {/* ── Footer ── */}
          <div style={{
            background: 'white',
            textAlign: 'center',
            padding: '5px 12px 7px',
            borderTop: '1px solid #f0f0f2',
            flexShrink: 0,
          }}>
            <p style={{ fontSize: '10px', color: '#b0b7c3', margin: 0 }}>
              Powered by{' '}
              <span style={{ color: BRAND.primary, fontWeight: '600' }}>Addora</span>
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes chatWindowIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); transform-origin: bottom right; }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MessageBubble({ message: m, onQuickReply, isLoading }) {
  const isUser = m.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      maxWidth: '88%',
    }}>
      {!isUser && (
        <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', marginLeft: '4px', fontWeight: '500' }}>
          Addora Bot
        </p>
      )}

      <div
        style={{
          padding: '10px 14px',
          borderRadius: '16px',
          fontSize: '14px',
          lineHeight: '1.6',
          wordBreak: 'break-word',
          ...(isUser
            ? {
                background: '#E75525',
                color: 'white',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'white',
                border: '1px solid #e8eaed',
                color: '#10182B',
                borderBottomLeftRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }
          ),
        }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(m.text) }}
      />

      <p style={{ fontSize: '11px', color: '#b0b7c3', marginTop: '4px', marginLeft: isUser ? 0 : '4px' }}>
        {m.time}
      </p>

      {m.quickReplies && m.quickReplies.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
          {m.quickReplies.map(q => (
            <QuickReplyButton key={q} label={q} onPress={onQuickReply} disabled={isLoading} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuickReplyButton({ label, onPress, disabled }) {
  return (
    <button
      onClick={() => !disabled && onPress(label)}
      disabled={disabled}
      style={{
        fontSize: '12px',
        padding: '6px 13px',
        borderRadius: '999px',
        border: '1.5px solid #E75525',
        color: disabled ? '#f3a07a' : '#E75525',
        borderColor: disabled ? '#f3a07a' : '#E75525',
        background: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '500',
        transition: 'background 0.15s, color 0.15s',
        lineHeight: 1.3,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = '#E75525'
          e.currentTarget.style.color = 'white'
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.color = '#E75525'
        }
      }}
    >
      {label}
    </button>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', marginLeft: '4px', fontWeight: '500' }}>
        Addora Bot
      </p>
      <div style={{
        background: 'white',
        border: '1px solid #e8eaed',
        borderRadius: '16px',
        borderBottomLeftRadius: '4px',
        padding: '12px 16px',
        display: 'flex',
        gap: '5px',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: '#c4c9d4',
            display: 'inline-block',
            animation: `chatbotBounce 1.1s ${i * 0.18}s ease-in-out infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}
