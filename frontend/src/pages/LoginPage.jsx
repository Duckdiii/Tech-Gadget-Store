import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../context/AuthContext'
import logo from '../assets/logo.png'

const DEMO_ACCOUNTS = [
  { role: 'customer', label: 'Khách hàng', desc: 'Mua sắm & đơn hàng' },
  { role: 'manager',  label: 'Quản lý',    desc: 'Dashboard & báo cáo' },
  { role: 'staff',    label: 'Nhân viên',  desc: 'Kho & vận hành' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [showPass, setShowPass] = useState(false)

  const fillDemo = (role) => { setSelectedRole(role); setError('') }

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Vui lòng nhập email và mật khẩu.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (!res.ok) {
        setError(res.status === 401 ? 'Sai email hoặc mật khẩu.' : `Lỗi server (${res.status}).`)
        return
      }
      const data = await res.json()
      const role = data.role.toLowerCase()
      login({ role, name: data.fullName, email: data.email }, data.token)
      navigate(ROLE_LANDING[role] ?? '/', { replace: true })
    } catch {
      setError('Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div
      className="flex-1 flex min-h-screen"
      style={{ backgroundColor: 'var(--ink)' }}
    >
      {/* ── Left panel — brand ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 w-[46%] shrink-0"
        style={{ backgroundColor: '#0A0C11', borderRight: '1px solid var(--b1)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span
            className="text-[15px] font-bold"
            style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}
          >
            TechStore
          </span>
        </div>

        {/* Main message */}
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Nền tảng công nghệ hàng đầu
          </p>
          <h1
            className="text-[2.8rem] font-extrabold leading-[1.1] mb-6"
            style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}
          >
            Công nghệ<br />
            <span style={{ color: 'var(--accent)' }}>đỉnh cao</span><br />
            trong tầm tay.
          </h1>
          <p className="text-[14px] leading-7" style={{ color: 'var(--t3)' }}>
            Hàng chính hãng · Giao nhanh 2h · Bảo hành chu đáo.<br />
            Hơn 50.000 sản phẩm từ 200+ thương hiệu toàn cầu.
          </p>

          {/* Stats row */}
          <div
            className="mt-10 grid grid-cols-3 gap-0"
            style={{ borderTop: '1px solid var(--b1)', paddingTop: '24px' }}
          >
            {[['50K+', 'Sản phẩm'], ['200+', 'Thương hiệu'], ['2H', 'Giao hàng']].map(([v, l]) => (
              <div key={l}>
                <p className="text-[22px] font-extrabold" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>{v}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <p className="text-[11px]" style={{ color: 'var(--t3)' }}>
          © 2024 TechStore. Mọi quyền được bảo lưu.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div
          className="w-full max-w-[400px]"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-[15px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>TechStore</span>
          </div>

          <h2
            className="text-[24px] font-bold mb-1"
            style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}
          >
            Đăng nhập
          </h2>
          <p className="text-[13px] mb-8" style={{ color: 'var(--t3)' }}>
            Chưa có tài khoản?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-semibold transition-colors"
              style={{ color: 'var(--accent)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-h)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              Đăng ký ngay
            </button>
          </p>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--t3)' }}>
              Loại tài khoản
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => fillDemo(acc.role)}
                  className="flex flex-col items-start p-3 transition-all"
                  style={{
                    borderRadius: '4px',
                    border: selectedRole === acc.role ? '1px solid var(--accent)' : '1px solid var(--b2)',
                    backgroundColor: selectedRole === acc.role ? 'var(--accent-dim)' : 'var(--s1)',
                  }}
                >
                  <span
                    className="text-[12px] font-bold mb-0.5"
                    style={{ color: selectedRole === acc.role ? 'var(--accent)' : 'var(--t1)' }}
                  >
                    {acc.label}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{acc.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--b1)', marginBottom: '24px' }} />

          {/* Email */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Email</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                className="field-dark w-full pl-10 pr-4 py-3 text-[13px]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Mật khẩu</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--t3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="field-dark w-full pl-10 pr-11 py-3 text-[13px]"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--t3)' }}
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
              className="mb-4 flex items-center gap-2 px-3 py-2.5"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px' }}
            >
              <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--err)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-[12px]" style={{ color: 'var(--err)' }}>{error}</span>
            </div>
          )}

          {/* Forgot */}
          <div className="flex justify-end mb-5">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-[12px] font-semibold transition-colors"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full text-white font-bold py-3.5 text-[13px] tracking-wide transition-colors disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Đang đăng nhập...
              </span>
            ) : 'Đăng nhập'}
          </button>

          {/* Support */}
          <div className="mt-6 flex justify-center">
            <button
              className="flex items-center gap-1.5 text-[11px] transition-colors"
              style={{ color: 'var(--t3)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--t2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Liên hệ hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
