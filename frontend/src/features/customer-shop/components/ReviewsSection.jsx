import { useState } from 'react'
import { useAuth } from '../../../context/useAuth'
import { avatarInitials, formatDate } from '../../../utils/formatters'

function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        const fill = Math.max(0, Math.min(1, (value ?? 0) - i))
        return (
          <span key={i} className={`relative ${size} inline-block`}>
            <svg className={`absolute inset-0 ${size}`} style={{ color: '#e2e8f0' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {fill > 0 && (
              <svg className={`absolute inset-0 ${size}`} style={{ color: '#F59E0B', clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </span>
        )
      })}
    </div>
  )
}

function StarPicker({ rating, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer border-none bg-transparent p-0.5"
          aria-label={`${n} sao`}
        >
          <svg className="w-7 h-7" fill={(hover || rating) >= n ? '#F59E0B' : '#e2e8f0'} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#F97316,#EA580C)',
  'linear-gradient(135deg,#10B981,#059669)',
  'linear-gradient(135deg,#F59E0B,#EA580C)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
]

export default function ReviewsSection({ reviews, loading, submitting, error, submitReview, removeReview, averageRating }) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [rating, setRating] = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating || !content.trim()) return
    const ok = await submitReview(content.trim(), rating)
    if (ok) {
      setContent('')
      setRating(0)
    }
  }

  return (
    <div id="product-reviews" className="mt-10 bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--b1)' }}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h2 className="text-lg font-black" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Đánh giá sản phẩm</h2>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{(averageRating ?? 0).toFixed(1)}</span>
          <Stars value={averageRating} size="w-5 h-5" />
          <span className="text-xs font-semibold" style={{ color: 'var(--t3)' }}>({reviews.length} đánh giá)</span>
        </div>
      </div>

      {/* Write review form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-7 p-4" style={{ backgroundColor: 'var(--s2)', borderRadius: '12px', border: '1px solid var(--b1)' }}>
          <p className="text-xs font-extrabold mb-2" style={{ color: 'var(--t2)' }}>Chọn số sao</p>
          <StarPicker rating={rating} onChange={setRating} />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={3}
            className="w-full mt-3 p-3 text-sm outline-none resize-none"
            style={{ border: '1.5px solid var(--b1)', borderRadius: '10px', backgroundColor: 'var(--card)', color: 'var(--t1)' }}
          />
          {error && <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !rating || !content.trim()}
            className="mt-3 px-5 py-2.5 text-xs font-extrabold text-white cursor-pointer disabled:opacity-50 border-none"
            style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '8px' }}
          >
            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      ) : (
        <div className="mb-7 p-4 text-sm text-center" style={{ backgroundColor: 'var(--s2)', borderRadius: '12px', color: 'var(--t3)' }}>
          Đăng nhập để viết đánh giá cho sản phẩm này.
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse" style={{ backgroundColor: 'var(--s2)', borderRadius: '10px' }} />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-center py-6" style={{ color: 'var(--t3)' }}>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên!</p>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map((review, i) => (
            <div key={review.id} className="flex gap-3 pb-5" style={{ borderBottom: '1px solid var(--b1)' }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs text-white shrink-0"
                style={{ background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length] }}
              >
                {avatarInitials(review.userName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{review.userName}</span>
                    <span className="text-xs ml-2" style={{ color: 'var(--t3)' }}>{formatDate(review.createdAt)}</span>
                  </div>
                  {review.mine && (
                    <button
                      onClick={() => removeReview(review.id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-600 cursor-pointer border-none bg-transparent"
                    >
                      Xoá
                    </button>
                  )}
                </div>
                <Stars value={review.rating} />
                <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--t2)' }}>{review.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
