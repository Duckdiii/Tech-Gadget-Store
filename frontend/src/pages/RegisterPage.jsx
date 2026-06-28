import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    setErrors(err => ({ ...err, [field]: '' }))
    setServerError('')
  }

  const validate = () => {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên.'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu.'
    else if (form.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự.'
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || null,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      if (!res.ok) {
        setServerError(res.status === 409 ? 'Email này đã được sử dụng.' : `Đăng ký thất bại (${res.status}).`)
        return
      }
      const data = await res.json()
      login({ role: 'customer', name: data.fullName, email: data.email }, data.token)
      navigate('/', { replace: true })
    } catch {
      setServerError('Không kết nối được server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: 'var(--page)' }}
    >
      <div
        className="bg-white p-8 sm:p-10 w-full max-w-[440px] shadow-sm animate-slide-up"
        style={{ border: '1.5px solid var(--cb)', borderRadius: '16px' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-7 h-7 flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="text-[15px] font-bold text-gray-900" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>TechStore</span>
        </div>

        <h2 className="text-[24px] font-bold text-center text-gray-900 mb-1" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>
          Tạo tài khoản
        </h2>
        <p className="text-[13px] text-center text-gray-500 mb-8">
          Đã có tài khoản?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-bold transition-colors cursor-pointer"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
          >
            Đăng nhập
          </button>
        </p>

        {/* Server error */}
        {serverError && (
          <div
            className="mb-4 flex items-center gap-2 px-3 py-2.5"
            style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}
          >
            <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-[12px] text-red-600 font-medium">{serverError}</span>
          </div>
        )}

        {/* Full name */}
        <Field label="Họ và tên *" error={errors.fullName}>
          <input type="text" value={form.fullName} onChange={set('fullName')} onKeyDown={handleKeyDown} placeholder="Nguyễn Văn A" className={fieldCls(errors.fullName)} />
        </Field>

        {/* Phone */}
        <Field label="Số điện thoại" error={errors.phone}>
          <input type="tel" value={form.phone} onChange={set('phone')} onKeyDown={handleKeyDown} placeholder="0901 234 567" className={fieldCls(errors.phone)} />
        </Field>

        {/* Email */}
        <Field label="Email *" error={errors.email}>
          <input type="email" value={form.email} onChange={set('email')} onKeyDown={handleKeyDown} placeholder="your@email.com" className={fieldCls(errors.email)} />
        </Field>

        {/* Password */}
        <Field label="Mật khẩu *" error={errors.password}>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} onKeyDown={handleKeyDown}
              placeholder="Tối thiểu 6 ký tự"
              className={fieldCls(errors.password) + ' pr-10'}
            />
            <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPass
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
          </div>
        </Field>

        {/* Confirm */}
        <Field label="Xác nhận mật khẩu *" error={errors.confirm}>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} onKeyDown={handleKeyDown}
              placeholder="Nhập lại mật khẩu"
              className={fieldCls(errors.confirm) + ' pr-10'}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showConfirm
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                }
              </svg>
            </button>
          </div>
        </Field>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 w-full text-white font-bold py-3.5 text-[13px] tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Đang đăng ký...
            </span>
          ) : 'Đăng ký'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>{label}</label>
      {children}
      {error && <p className="text-[11px] mt-1" style={{ color: 'var(--err)' }}>{error}</p>}
    </div>
  )
}

function fieldCls(error) {
  return `field-dark w-full px-3.5 py-3 text-[13px]${error ? ' field-error' : ''}`
}
