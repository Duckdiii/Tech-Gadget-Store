import { useNavigate } from 'react-router-dom'
import { useForgotPassword } from '../hooks/useForgotPassword'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const {
    email,
    setEmail,
    isPortal,
    error,
    setError,
    loading,
    handleSubmit,
  } = useForgotPassword()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#eef0f8' }}
    >
      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-10 py-10 w-full max-w-[400px]">

        {/* Icon circle */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-dim)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {/* Circular refresh arrows */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              {/* Lock shape in center */}
              <rect x="9.5" y="12.5" width="5" height="4" rx="0.8" strokeWidth={1.3} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3}
                d="M10.5 12.5v-1a1.5 1.5 0 013 0v1" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-gray-900 text-center mb-3">Quên mật khẩu?</h1>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-7 px-2">
          Vui lòng nhập địa chỉ email đã đăng ký để nhận<br />
          liên kết khôi phục mật khẩu.
        </p>

        {/* Error message */}
        {error && (
          <div className="text-red-500 text-sm text-center mb-4 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Email field */}
        <div className="mb-5">
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="admin@techstore.com"
              aria-label="Email khôi phục mật khẩu"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] transition disabled:opacity-50"
            />
          </div>
        </div>

        {/* Submit button */}
        <button aria-label="Gửi yêu cầu khôi phục mật khẩu" type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer mb-5 tracking-wide disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
          onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent-d)')}
          onMouseLeave={e => !loading && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
        </button>

        {/* Back to login */}
        <div className="flex justify-center">
          <button aria-label="Quay lại trang Đăng nhập" type="button" onClick={() => navigate(isPortal ? '/portal/login' : '/login')}
            className="flex items-center gap-1.5 text-sm font-bold cursor-pointer transition-colors border-none bg-transparent"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-8">
        <button aria-label="Liên hệ hỗ trợ" type="button" className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors border-none bg-transparent">
          Liên hệ hỗ trợ
        </button>
      </div>
    </div>
  )
}
