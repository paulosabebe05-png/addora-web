'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import styles from './notifications.module.css'

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!user) { router.push('/auth/signin?redirect=/notifications'); return }
    fetchNotifications()
  }, [user])

  const fetchNotifications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setNotifications(data || [])
    setLoading(false)
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
    if (!unreadIds.length) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr)
    const mins = Math.floor(diff / 60000)
    if (mins < 1)  return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24)  return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 7)  return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getIcon = (title = '') => {
    const t = title.toLowerCase()
    if (t.includes('order') && t.includes('place')) return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    )
    if (t.includes('deliver') || t.includes('shipped')) return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    )
    if (t.includes('status') || t.includes('update')) return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
      </svg>
    )
    if (t.includes('cancel')) return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    )
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    )
  }

  const getAccent = (title = '') => {
    const t = title.toLowerCase()
    if (t.includes('cancel'))  return '#dc2626'
    if (t.includes('deliver')) return '#16a34a'
    if (t.includes('place'))   return '#E75525'
    return '#6366f1'
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              Notifications
              {unreadCount > 0 && <span className={styles.unreadPill}>{unreadCount}</span>}
            </h1>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={markAllRead}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${filter === 'all' ? styles.tabActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All
              {notifications.length > 0 && <span className={styles.tabCount}>{notifications.length}</span>}
            </button>
            <button
              className={`${styles.tab} ${filter === 'unread' ? styles.tabActive : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
              {unreadCount > 0 && <span className={`${styles.tabCount} ${styles.tabCountOrange}`}>{unreadCount}</span>}
            </button>
          </div>
        </div>

        {/* List */}
        <div className={styles.list}>
          {loading ? (
            <div className={styles.skeletonWrap}>
              {[...Array(4)].map((_, i) => (
                <div className={styles.skeleton} key={i}>
                  <div className={styles.skeletonIcon} />
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonLine} style={{ width: '60%' }} />
                    <div className={styles.skeletonLine} style={{ width: '85%', height: '11px', marginTop: '6px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              </div>
              <p className={styles.emptyTitle}>{filter === 'unread' ? 'All caught up!' : 'No notifications yet'}</p>
              <p className={styles.emptySubtitle}>{filter === 'unread' ? 'You have no unread notifications' : "We'll notify you about your orders here"}</p>
            </div>
          ) : (
            filtered.map((n, i) => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.is_read ? styles.itemUnread : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <div className={styles.iconWrap} style={{ '--accent': getAccent(n.title) }}>
                  {getIcon(n.title)}
                </div>

                <div className={styles.content}>
                  <div className={styles.itemTitle}>{n.title}</div>
                  {n.body && <div className={styles.itemBody}>{n.body}</div>}
                  <div className={styles.itemTime}>{timeAgo(n.created_at)}</div>
                </div>

                <div className={styles.itemActions}>
                  {!n.is_read && <div className={styles.dot} />}
                  <button
                    className={styles.deleteBtn}
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                    title="Dismiss"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}