import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'

export default function PortalLoginPage() {
  const navigate = useNavigate()
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    showPass,
    setShowPass,
    handleLogin,
  } = useLogin({ allowedRoles: ['manager', 'staff'] })

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12 min-h-screen"
      style={{ backgroundColor: 'var(--ink)' }}
    >
      <div
        className="bg-white p-8 sm:p-10 w-full max-w-[440px] shadow-2xl animate-slide-up"
        style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>TECHSTORE PORTAL</span>
        </div>

        <h2 className="text-[22px] font-black text-center text-gray-900 mb-1" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
          Đăng nhập hệ thống
        </h2>
        <p className="text-[12.5px] text-center text-gray-400 mb-8">
          Khu vực dành riêng cho nhân viên và quản lý
        </p>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-[12px] font-bold mb-1.5 text-gray-700">Email công việc</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="work@techstore.vn"
              className="field-light w-full pl-10 pr-4 py-3 text-[13px]"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mb-5">
          <label className="block text-[12px] font-bold mb-1.5 text-gray-700">Mật khẩu</label>
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              className="field-light w-full pl-10 pr-11 py-3 text-[13px]"
            />
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer border-none bg-transparent"
            >
              {showPass ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 flex items-center gap-2 px-3 py-2.5"
            style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}
          >
            <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[12px] text-red-600 font-medium">{error}</span>
          </div>
        )}

        {/* Forgot Password Link */}
        <div className="flex justify-end mb-5">
          <button
            onClick={() => navigate('/forgot-password', { state: { isPortal: true } })}
            className="text-[12px] font-bold text-gray-500 hover:text-[#E8420A] cursor-pointer transition-colors border-none bg-transparent"
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full text-white font-extrabold py-3.5 text-[13px] tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 border-none"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang xác thực...
            </span>
          ) : 'Đăng nhập hệ thống'}
        </button>

        {/* Info notice */}
        <p className="text-center text-[11px] text-gray-400 mt-6 leading-relaxed">
          Bằng việc đăng nhập, bạn đồng ý với các chính sách bảo mật nội bộ và quy định vận hành của TechStore.
        </p>
      </div>
    </div>
  )
}
