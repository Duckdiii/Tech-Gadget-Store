import { useEffect, useRef, useState } from 'react'
import ChatMessageBubble from './ChatMessageBubble'

export default function ChatPanel({ messages, isStreaming, onSend, onClose }) {
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setInput('')
  }

  return (
    <div
      className="notif-in absolute bottom-full right-0 mb-3 w-96 flex flex-col overflow-hidden"
      style={{
        height: '520px',
        backgroundColor: 'var(--card)',
        border: '1px solid var(--b1)',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--b1)', backgroundColor: 'var(--ink)' }}
      >
        <span
          className="text-[13px] font-bold"
          style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}
        >
          Trợ lý tư vấn TechStore
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center"
          style={{ color: 'var(--t3)' }}
          aria-label="Đóng"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {messages.length === 0 && (
          <p className="text-center text-[12px] mt-8" style={{ color: 'var(--t3)' }}>
            Hỏi mình về sản phẩm, gợi ý mua sắm hoặc trạng thái đơn hàng của bạn nhé!
          </p>
        )}
        {messages.map((message, idx) => (
          <ChatMessageBubble key={idx} role={message.role} content={message.content} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3" style={{ borderTop: '1px solid var(--b1)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi..."
          disabled={isStreaming}
          className="flex-1 px-3 py-2 text-[13px]"
          style={{
            backgroundColor: 'var(--s2)',
            border: '1px solid var(--b1)',
            borderRadius: '6px',
            color: 'var(--t1)',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="px-3 py-2 text-[12px] font-bold text-white shrink-0"
          style={{
            backgroundColor: 'var(--accent)',
            borderRadius: '6px',
            opacity: isStreaming || !input.trim() ? 0.5 : 1,
          }}
        >
          Gửi
        </button>
      </form>
    </div>
  )
}
