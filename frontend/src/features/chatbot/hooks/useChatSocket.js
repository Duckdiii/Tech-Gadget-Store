import { useEffect, useRef, useState, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { getToken } from '../../../utils/authToken'

/**
 * Kết nối STOMP riêng cho chatbot (độc lập với useNotificationSocket) — subscribe
 * /user/queue/chatbot để nhận từng đoạn text streaming, publish tới /app/chat.send để gửi tin.
 */
export function useChatSocket(user) {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const clientRef = useRef(null)

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
        client.subscribe('/user/queue/chatbot', (message) => {
          const chunk = JSON.parse(message.body)
          if (chunk.error) {
            setMessages((prev) => [...prev, { role: 'assistant', content: chunk.error }])
            setIsStreaming(false)
            return
          }

          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant' && last.streaming) {
              const updatedLast = {
                ...last,
                content: last.content + chunk.delta,
                streaming: !chunk.done,
              }
              return [...prev.slice(0, -1), updatedLast]
            }
            return [
              ...prev,
              { role: 'assistant', content: chunk.delta, streaming: !chunk.done },
            ]
          })

          if (chunk.done) {
            setIsStreaming(false)
          }
        })
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [user])

  const sendMessage = useCallback((content) => {
    if (!content?.trim() || !clientRef.current) return

    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsStreaming(true)
    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ content }),
    })
  }, [])

  const loadHistory = useCallback((historyMessages) => {
    setMessages(
      historyMessages.map((m) => ({ role: m.role.toLowerCase(), content: m.content }))
    )
  }, [])

  return { messages, isStreaming, sendMessage, loadHistory }
}
