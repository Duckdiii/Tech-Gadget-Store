import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { getToken } from '../utils/authToken'

// Kết nối WebSocket (STOMP) khi có khách hàng đăng nhập, nhận thông báo mới real-time
// (đẩy từ OrderNotificationConsumer) — không cần refresh trang. onNotification không cần
// tự memo hoá: hook luôn gọi đúng bản mới nhất qua ref, chỉ kết nối lại khi `user` đổi.
export function useNotificationSocket(user, onNotification) {
  const callbackRef = useRef(onNotification)

  useEffect(() => {
    callbackRef.current = onNotification
  })

  useEffect(() => {
    if (!user || user.role !== 'customer') return

    const token = getToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${protocol}://${window.location.host}/ws`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (message) => {
          callbackRef.current(JSON.parse(message.body))
        })
      },
    })

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [user])
}
