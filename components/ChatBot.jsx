'use client'
// components/ChatBot.jsx
// Addora Buyer Chatbot Widget
// Uses: Supabase DB + Rule-based engine (no external API)

import { useState, useEffect, useRef } from 'react'
import {
  getOrCreateSession,
  processMessage,
  loadChatHistory,
} from '@/lib/chatbotEngine'
import { useLang } from '@/context/LangProvider' // your existing lang context

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

  // Initialize session and welcome message
  useEffect(() => {
    async function init() {
      try {
        const sess = await getOrCreateSession()
        setSession(sess)

        // Load previous history if exists
        // const history = await loadChatHistory(sess.id)
        // if (history.length > 0) { setMessages(mapHistory(history)); return }

        // Show welcome message
        const welcome = WELCOME[lang] || WELCOME.en
        setMessages([
          {
            id: 'welcome',
            role: 'bot',
            text: welcome.text,
            quickReplies: welcome.quick,
            time: formatTime(new Date()),
          },
        ])
      } catch (err) {
        console.error('Chatbot init error:', err)
      }
    }
    init()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading])

  // Reset unread on open
  useEffect(() => {
    if (isOpen) setUnreadCount(0)
  }, [isOpen])

  function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function handleSend(text) {
    const msg = (text || input).trim()
    if (!msg || !session) return
    setInput('')

    // Add user message to UI
    const userMsg = {
      id: Date.now(),
      role: 'user',
      text: msg,
      time: formatTime(new Date()),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const { response, quickReplies } = await processMessage(msg, session.id, lang)

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: response,
        quickReplies: quickReplies || [],
        time: formatTime(new Date()),
      }
      setMessages(prev => [...prev, botMsg])

      if (!isOpen) setUnreadCount(c => c + 1)
    } catch (err) {
      console.error('Bot error:', err)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: 'Sorry, something went wrong. Please try again.',
          quickReplies: ['Contact support'],
          time: formatTime(new Date()),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#E75525] shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95"
        aria-label="Open chat support"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z" />
          </svg>
        )}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#10182B] text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] shadow-2xl rounded-2xl overflow-hidden flex flex-col"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

          {/* Header */}
          <div className="bg-[#10182B] px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E75525] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              A
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Addora Support</p>
              <p className="text-[#9FB3C8] text-xs flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                Always here to help
              </p>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={bodyRef}
            className="bg-gray-50 flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ height: '360px' }}
          >
            {messages.map(m => (
              <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}>
                {m.role === 'bot' && (
                  <p className="text-[11px] text-gray-400 mb-1 pl-1">Addora Bot</p>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#E75525] text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-[#10182B] rounded-bl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
                <p className="text-[11px] text-gray-400 mt-1">{m.time}</p>

                {/* Quick reply buttons */}
                {m.quickReplies && m.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.quickReplies.map(q => (
                      <button
                        key={q}
                        onClick={() => handleSend(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[#E75525] text-[#E75525] bg-white hover:bg-[#E75525] hover:text-white transition-colors font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="self-start flex flex-col items-start">
                <p className="text-[11px] text-gray-400 mb-1 pl-1">Addora Bot</p>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-gray-400"
                      style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 p-3 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'am' ? 'ጥያቄዎን ያስፍሩ...' : 'Type your question...'}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-[#10182B] outline-none focus:border-[#E75525] focus:bg-white transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#E75525] flex items-center justify-center text-white flex-shrink-0 hover:bg-[#c94418] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
              </svg>
            </button>
          </div>

          {/* Brand footer */}
          <div className="bg-white text-center py-1.5 border-t border-gray-100">
            <p className="text-[10px] text-gray-400">
              Powered by <span className="text-[#E75525] font-semibold">Addora</span>
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  )
}