import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, ROLE_LANDING } from '../context/AuthContext'
import logo from '../assets/logo.png'

const DEMO_ACCOUNTS = [
  {
    role: 'customer',
    label: 'Khách hàng',
    desc: 'Mua sắm, giỏ hàng, đơn hàng',
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: 'manager',
    label: 'Quản lý',
    desc: 'Khách hàng, khuyến mãi, báo cáo',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    role: 'staff',
    label: 'Nhân viên kho',
    desc: 'Tồn kho, nhập hàng, đơn hàng',
    badgeClass: 'bg-teal-100 text-teal-700 border-teal-200',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const fillDemo = (role) => {
    setSelectedRole(role)
    setError('')
  }

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      if (!res.ok) {
        const msg = res.status === 401 ? 'Sai email hoặc mật khẩu.' : `Lỗi server (${res.status}).`
        setError(msg)
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-10"
      style={{ backgroundColor: '#eef0f8' }}
    >
      {/* ── Card ── */}
      <div className="bg-white shadow-lg px-10 py-9 w-full max-w-[440px]" style={{ borderRadius: '6px' }}>

        {/* Logo */}
        <div className="flex justify-center mb-5">
          <img src={logo} alt="TechStore" className="h-24 w-auto" />
        </div>
        <p className="text-sm text-gray-500 text-center mb-6">Đăng nhập để tiếp tục</p>

        {/* ── Role hint selector ── */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">Loại tài khoản</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                onClick={() => fillDemo(acc.role)}
                className={`flex flex-col items-center gap-1.5 p-3 border-2 transition-all cursor-pointer ${
                  selectedRole === acc.role
                    ? `${acc.badgeClass} border-current`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {acc.icon}
                <span className="text-xs font-semibold leading-tight text-center">{acc.label}</span>
                <span className="text-[10px] leading-tight text-center opacity-70">{acc.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100 mb-5" />

        {/* Email field */}
        <div className="mb-4">
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
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition"
              style={{ borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="••••••"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-500 transition"
              style={{ borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2.5" style={{ borderRadius: '4px' }}>
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {/* Forgot password */}
        <div className="flex justify-end mb-5">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-sm font-semibold hover:underline cursor-pointer transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            Quên mật khẩu?
          </button>
        </div>

        {/* Login button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full text-white font-bold py-3.5 text-sm transition-all cursor-pointer tracking-wide disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-6 text-sm text-gray-500">
        <button className="flex items-center gap-1.5 hover:text-gray-700 cursor-pointer transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
              d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Liên hệ hỗ trợ
        </button>
      </div>
    </div>
  )
}
