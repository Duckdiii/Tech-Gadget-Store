import { useState } from 'react'
import { useNav } from '../hooks/useNav'

function PasswordInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
      <input
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
      />
    </div>
  )
}

export default function ResetPasswordPage() {
  const onNavigate = useNav()
  const [newPwd, setNewPwd]     = useState('password123')
  const [confirmPwd, setConfirmPwd] = useState('password123')

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#eef0f8' }}>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Card with thick blue top border */}
        <div
          className="bg-white rounded-2xl w-full max-w-[420px]"
          style={{ border: '1px solid #e5e7eb', borderTop: '4px solid #1e40af' }}
        >
          <div className="px-10 py-9">

            {/* Titles */}
            <div className="text-center mb-7">
              <h1 className="text-[2rem] font-black text-blue-800 leading-tight mb-2">TechStore</h1>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Vui lòng thiết lập mật khẩu mới cho tài<br />khoản của bạn.
              </p>
            </div>

            {/* New password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</label>
              <PasswordInput
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            {/* Confirm password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <PasswordInput
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3.5 mb-5">
              <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600 leading-relaxed">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số.
              </p>
            </div>

            {/* Submit button */}
            <button onClick={() => onNavigate('login')} className="w-full bg-blue-700 hover:bg-blue-800 active:scale-[.99] text-white font-bold py-3.5 rounded-xl text-sm transition-all cursor-pointer mb-5 tracking-wide">
              Cập nhật mật khẩu
            </button>

            {/* Back to login */}
            <div className="flex justify-center">
              <button onClick={() => onNavigate('login')} className="flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại Đăng nhập
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── Footer bar ── */}
      <footer className="border-t border-gray-300 px-8 py-4 flex items-center justify-between shrink-0">
        <span className="text-sm text-gray-500">© 2024 TechStore. All rights reserved.</span>
        <div className="flex items-center gap-5">
          {['Privacy Policy', 'Terms of Service', 'Support'].map((link) => (
            <button key={link} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors">
              {link}
            </button>
          ))}
        </div>
      </footer>

    </div>
  )
}
