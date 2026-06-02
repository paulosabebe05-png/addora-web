'use client'
// components/ChatBot.jsx
import { useState, useEffect, useRef } from 'react'
import { getOrCreateSession, processMessage } from '@/lib/chatbotEngine'
import { useLang } from '@/lib/lang'

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

export default function ChatBot() {
  const { lang } = useLang()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [unreadCount, setUnreadCount] = useState(1)
  const bodyRef = useRef(null)

  useEffect(() => {
    async function init() {
      try {
        const sess = await getOrCreateSession()
        setSession(sess)
      } catch (err) {
        console.error('Chatbot init error:', err)
      }
      // Always show welcome regardless of session success
      const welcome = WELCOME[lang] || WELCOME.en
      setMessages([{
        id: 'welcome',
        role: 'bot',
        text: welcome.text,
        quickReplies: welcome.quick,
        time: formatTime(new Date()),
      }])
    }
    init()
  }, [])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: formatTime(new Date()) }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      if (!session) throw new Error('No session')
      const { response, quickReplies } = await processMessage(msg, session.id, lang)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: response,
        quickReplies: quickReplies || [],
        time: formatTime(new Date()),
      }])
      if (!isOpen) setUnreadCount(c => c + 1)
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        quickReplies: ['Contact support'],
        time: formatTime(new Date()),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open chat support"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#E75525',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(231,85,37,0.4)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? (
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
            <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
          </svg>
        )}
        {!isOpen && unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#10182B',
            color: 'white',
            fontSize: '11px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '150px',
          right: '20px',
          zIndex: 9999,
          width: '370px',
          maxWidth: 'calc(100vw - 2rem)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          {/* Header */}
          <div style={{ background: '#10182B', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: '#E75525', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'white', fontWeight: '700',
              fontSize: '18px', flexShrink: 0,
            }}>A</div>
            <div>
              <p style={{ color: 'white', fontWeight: '600', fontSize: '14px', margin: 0 }}>Addora Support</p>
              <p style={{ color: '#9FB3C8', fontSize: '12px', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Always here to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={bodyRef} style={{
            background: '#f9fafb', height: '360px',
            overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {messages.map(m => (
              <div key={m.id} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                {m.role === 'bot' && (
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', marginLeft: '4px' }}>Addora Bot</p>
                )}
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    ...(m.role === 'user'
                      ? { background: '#E75525', color: 'white', borderBottomRightRadius: '4px' }
                      : { background: 'white', border: '1px solid #e5e7eb', color: '#10182B', borderBottomLeftRadius: '4px' }
                    )
                  }}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{m.time}</p>
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {m.quickReplies.map(q => (
                      <button key={q} onClick={() => handleSend(q)} style={{
                        fontSize: '12px', padding: '6px 12px', borderRadius: '999px',
                        border: '1px solid #E75525', color: '#E75525',
                        background: 'white', cursor: 'pointer', fontWeight: '500',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#E75525'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#E75525' }}
                      >{q}</button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Addora Bot</p>
                <div style={{
                  background: 'white', border: '1px solid #e5e7eb',
                  borderRadius: '16px', borderBottomLeftRadius: '4px',
                  padding: '12px 16px', display: 'flex', gap: '4px',
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#9ca3af', display: 'inline-block',
                      animation: `chatbotBounce 1.2s ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            background: 'white', borderTop: '1px solid #f3f4f6',
            padding: '12px', display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'am' ? 'ጥያቄዎን ያስፍሩ...' : 'Type your question...'}
              style={{
                flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: '999px', padding: '8px 16px', fontSize: '14px',
                color: '#10182B', outline: 'none',
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: loading || !input.trim() ? '#f3a07a' : '#E75525',
                border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>

          {/* Footer */}
          <div style={{ background: 'white', textAlign: 'center', padding: '6px', borderTop: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>
              Powered by <span style={{ color: '#E75525', fontWeight: '600' }}>Addora</span>
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatbotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}
