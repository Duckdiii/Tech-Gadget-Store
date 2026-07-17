import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../../../services/api'

/** Mirrors the notification fetch/mark-read logic already used by TechStoreAdminSidebar and
 * StoreNavbar, so the dashboard header's bell behaves identically to those. */
export function useHeaderNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(() => {
    setLoading(true)
    return apiFetch('/api/notifications')
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unreadCount = notifications.filter((n) => !n.readAt).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })))
    apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
  }

  const markRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt || new Date().toISOString() } : n))
    )
    apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
  }

  return { notifications, unreadCount, loading, markAllRead, markRead }
}
