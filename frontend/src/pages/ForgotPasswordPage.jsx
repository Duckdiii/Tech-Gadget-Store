import { useState } from 'react'
import { useNav } from '../hooks/useNav'

export default function ForgotPasswordPage() {
  const onNavigate = useNav()
  const [email, setEmail] = useState('')

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#eef0f8' }}
    >
      {/* ── Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-10 py-10 w-full max-w-[400px]">

        {/* Icon circle */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Email field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@techstore.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Submit button */}
        <button onClick={() => onNavigate('emailSent')} className="w-full bg-blue-800 hover:bg-blue-900 active:scale-[.99] text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer mb-5 tracking-wide">
          Gửi yêu cầu khôi phục
        </button>

        {/* Back to login */}
        <div className="flex justify-center">
          <button onClick={() => onNavigate('login')} className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại trang Đăng nhập
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-8">
        <button className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
          Liên hệ hỗ trợ
        </button>
      </div>
    </div>
  )
}
