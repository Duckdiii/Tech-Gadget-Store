import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import { useChatSocket } from '../hooks/useChatSocket'
import { chatbotService } from '../services/chatbotService'
import ChatPanel from './ChatPanel'

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const { messages, isStreaming, sendMessage, loadHistory } = useChatSocket(user)

  useEffect(() => {
    if (!open || historyLoaded || !user || user.role !== 'customer') return
    chatbotService
      .getHistory()
      .then(loadHistory)
      .catch(() => {})
      .finally(() => setHistoryLoaded(true))
  }, [open, historyLoaded, user, loadHistory])

  if (!user || user.role !== 'customer') return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
          onClose={() => setOpen(false)}
        />
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-14 h-14 flex items-center justify-center text-white transition-transform"
        style={{
          backgroundColor: 'var(--accent)',
          borderRadius: '50%',
          boxShadow: '0 6px 20px rgba(232, 66, 10, 0.4)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label="Trợ lý tư vấn"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8-1.093 0-2.14-.174-3.11-.494L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
