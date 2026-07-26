import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { getToken } from '../utils/authToken'
import { getWsBrokerUrl } from '../utils/wsUrl'

export function useNotificationSocket(user, onNotification) {// Hook này dùng để lắng nghe các thông báo từ server gửi về qua WebSocket
  const callbackRef = useRef(onNotification)// Dùng useRef để lưu trữ callback onNotification, tránh việc tạo lại hàm khi component re-render

  useEffect(() => {// Cập nhật callbackRef.current mỗi khi onNotification thay đổi
    callbackRef.current = onNotification // Cập nhật callbackRef.current mỗi khi onNotification thay đổi
  })

  useEffect(() => {// Tạo kết nối WebSocket khi user thay đổi
    if (!user || user.role !== 'customer') return

    const token = getToken()
    if (!token) return

    const client = new Client({
      brokerURL: getWsBrokerUrl(),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => { // Khi kết nối thành công, đăng ký lắng nghe thông báo từ server
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
