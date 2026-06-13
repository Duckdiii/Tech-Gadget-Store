import { useNav } from '../hooks/useNav'

export default function EmailSentPage() {
  const onNavigate = useNav()
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#eef0f8' }}
    >
      {/* ── Brand title (outside card) ── */}
      <h1 className="text-[2.6rem] font-black text-blue-800 text-center mb-8 tracking-tight">
        TechStore
      </h1>

      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-10 py-10 w-full max-w-[420px]">

        {/* Check-circle icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <button onClick={() => onNavigate('login')} className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[.99] text-white font-semibold py-3.5 rounded-xl text-sm transition-all cursor-pointer mb-4 tracking-wide">
          Quay lại Đăng nhập
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-500 text-center">
          Bạn không nhận được email?{' '}
          <button className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer transition-colors">
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
