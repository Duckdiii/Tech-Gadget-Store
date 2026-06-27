import { useNav } from '../hooks/useNav'

export default function EmailSentPage() {
  const onNavigate = useNav()
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#eef0f8' }}
    >
      {/* ── Brand title (outside card) ── */}
      <h1 className="text-[2.6rem] font-black text-center mb-8 tracking-tight" style={{ color: 'var(--accent)' }}>
        TechStore
      </h1>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-10 py-10 w-full max-w-[420px]">

        {/* Check-circle icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-dim)' }}>
            <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
          Kiểm tra email của bạn
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-7 px-1">
          Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến địa chỉ email{' '}
          <strong className="text-gray-800 font-semibold">admin@techstore.com</strong>.
          {' '}Vui lòng kiểm tra hộp thư đến (hoặc thư rác) và làm theo hướng dẫn.
        </p>

        {/* Back to login button */}
        <button onClick={() => onNavigate('login')}
          className="w-full text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer mb-4 tracking-wide"
          style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          Quay lại Đăng nhập
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-500 text-center">
          Bạn không nhận được email?{' '}
          <button className="hover:underline font-bold cursor-pointer transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            Gửi lại
          </button>
        </p>
      </div>

      {/* ── Footer links ── */}
      <div className="flex items-center gap-6 mt-8">
        {['Privacy Policy', 'Terms of Service', 'Help Center'].map((link) => (
          <button key={link} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
            {link}
          </button>
        ))}
      </div>
    </div>
  )
}
