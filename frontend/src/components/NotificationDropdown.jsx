import { useState, useEffect, useRef } from 'react'
import { useNotificationSocket } from '../hooks/useNotificationSocket'
import { apiFetch } from '../services/api'

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'Vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  return `${day} ngày trước`
}

function renderNotificationIcon(type) {
  switch (type) {
    case 'RESTOCKED':
      return <svg className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
    case 'PROMOTION':
      return <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case 'OUT_OF_STOCK':
      return <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
    case 'PRICE_UPDATE':
      return <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    default:
      return <svg className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
  }
}

export default function NotificationDropdown({ user }) {
  const [bellRing, setBellRing] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [open, setOpen] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      setNotifications([])
      return
    }
    apiFetch('/api/notifications')
      .then(setNotifications)
      .catch(() => {})
  }, [user])

  useNotificationSocket(user, (notification) => {
    setNotifications(prev => [notification, ...prev])
    setBellRing(true)
  })

  const unreadCount = notifications.filter(n => !n.readAt).length

  const handleBell = () => {
    setBellRing(true)
    setOpen(prev => !prev)
  }

  useEffect(() => {
    if (!bellRing) return
    const t = setTimeout(() => setBellRing(false), 600)
    return () => clearTimeout(t)
  }, [bellRing])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })))
    apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
    apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
  }

  return (
    <div className="relative" ref={bellRef}>
      <button
        type="button"
        onClick={handleBell}
        className="relative transition-colors"
        style={{ color: open ? 'var(--accent)' : 'var(--t3)' }}
        aria-label="Thông báo"
      >
        <svg
          className={`w-5 h-5 origin-top ${bellRing ? 'bell-ring' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-2 w-4 h-4 text-white text-[9px] font-bold flex items-center justify-center pointer-events-none"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notif-in absolute right-0 top-full mt-2 w-80 overflow-hidden"
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: '1px solid var(--b1)' }}
          >
            <span className="text-[12px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>
              Thông báo
              {unreadCount > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 text-[9px] font-bold text-white"
                  style={{ backgroundColor: 'var(--accent)', borderRadius: '2px' }}
                >
                  {unreadCount} mới
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button aria-label="Đánh dấu đã đọc tất cả thông báo" type="button"
                onClick={markAllRead}
                className="text-[11px] font-medium border-none bg-transparent cursor-pointer"
                style={{ color: 'var(--accent)' }}
              >
                Đọc tất cả
              </button>
            )}
          </div>

          <ul className="max-h-72 overflow-y-auto" style={{ borderBottom: '1px solid var(--b1)' }}>
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-[12px]" style={{ color: 'var(--t3)' }}>
                Không có thông báo nào
              </li>
            )}
            {notifications.map(n => {
              const unread = !n.readAt
              return (
                <li key={n.id} style={{ borderBottom: '1px solid var(--b1)' }}>
                  <button
                    type="button"
                    aria-label={`Thông báo: ${n.title}`}
                    onClick={() => unread && markRead(n.id)}
                    className="w-full text-left flex gap-3 px-4 py-3 cursor-pointer transition-colors border-none bg-transparent"
                    style={{
                      backgroundColor: unread ? 'rgba(232,66,10,0.05)' : 'transparent',
                    }}
                  >
                    {renderNotificationIcon(n.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-snug font-semibold" style={{ color: unread ? 'var(--t1)' : 'var(--t2)' }}>
                        {n.title}
                      </p>
                      <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--t3)' }}>{n.message}</p>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--t3)' }}>{timeAgo(n.createdAt)}</p>
                    </div>
                    {unread && (
                      <span className="w-1.5 h-1.5 mt-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="px-4 py-2.5 text-center">
            <button aria-label="Xem tất cả thông báo" type="button"
              className="text-[11px] font-medium border-none bg-transparent cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
