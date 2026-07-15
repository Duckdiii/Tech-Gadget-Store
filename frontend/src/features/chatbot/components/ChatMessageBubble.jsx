export default function ChatMessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-[80%] px-3 py-2 text-[13px] leading-snug whitespace-pre-wrap"
        style={
          isUser
            ? {
                backgroundColor: 'var(--accent)',
                color: '#fff',
                borderRadius: '10px 10px 2px 10px',
              }
            : {
                backgroundColor: 'var(--s2)',
                color: 'var(--t1)',
                border: '1px solid var(--b1)',
                borderRadius: '10px 10px 10px 2px',
              }
        }
      >
        {content || ' '}
      </div>
    </div>
  )
}
