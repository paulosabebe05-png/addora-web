'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import styles from './NotificationBell.module.css'

export default function NotificationBell({ transparent }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    let channel = null

    // Fetch initial notifications — never let this hang forever.
    // On networks that block/throttle Supabase (e.g. some mobile carriers),
    // an unresolved fetch here should not leave the UI in a broken state.
    fetchNotifications(cancelled)

    // Realtime subscription — wrapped defensively.
    // If the WebSocket connection is blocked or fails (common on some
    // mobile networks), we catch it instead of letting it hang or throw,
    // and we simply fall back to polling-free, non-realtime notifications.
    try {
      channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${user.id}`
        }, (payload) => {
          if (!cancelled) {
            setNotifications(prev => [payload.new, ...prev])
          }
        })
        .subscribe((status, err) => {
          if (err) {
            console.warn('[NotificationBell] realtime subscription error:', err)
          }
          // status can be 'SUBSCRIBED', 'CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'
          // We deliberately do nothing UI-blocking on failure — notifications
          // just won't arrive live, but the rest of the app keeps working.
        })
    } catch (err) {
      console.warn('[NotificationBell] failed to open realtime channel:', err)
    }

    return () => {
      cancelled = true
      if (channel) {
        try {
          supabase.removeChannel(channel)
        } catch (err) {
          console.warn('[NotificationBell] error removing channel:', err)
        }
      }
    }
  }, [user])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const fetchNotifications = async (cancelled) => {
    try {
      // Guard the request with a timeout so a stalled connection
      // (e.g. blocked/slow mobile network) can't hang this indefinitely.
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error) {
        console.warn('[NotificationBell] fetch error:', error)
        return
      }
      if (data && !cancelled) setNotifications(data)
    } catch (err) {
      // AbortError (timeout) or network error — fail silently.
      // Notifications are non-critical; the rest of the app must not break.
      console.warn('[NotificationBell] fetchNotifications failed:', err)
    }
  }

  const markAsRead = async (id) => {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.warn('[NotificationBell] markAsRead failed:', err)
    }
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr)
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Now'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (!user) return null

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        className={`${styles.bell} ${transparent ? styles.bellTransparent : styles.bellSolid}`}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropHead}>
            <span className={styles.dropTitle}>Notifications</span>
            {unreadCount > 0 && <span className={styles.dropBadge}>{unreadCount} new</span>}
          </div>

          <div className={styles.dropList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`${styles.dropItem} ${!n.is_read ? styles.dropItemUnread : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className={styles.dropItemContent}>
                    <div className={styles.dropItemTitle}>{n.title}</div>
                    {n.body && <div className={styles.dropItemBody}>{n.body}</div>}
                  </div>
                  <div className={styles.dropItemMeta}>
                    <span className={styles.dropItemTime}>{timeAgo(n.created_at)}</span>
                    {!n.is_read && <div className={styles.dot} />}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link href="/notifications" className={styles.dropFooter} onClick={() => setOpen(false)}>
            View all notifications
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}
