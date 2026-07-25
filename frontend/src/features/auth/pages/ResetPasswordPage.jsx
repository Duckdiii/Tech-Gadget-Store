import { useNav } from '../../../hooks/useNav'
import { useResetPassword } from '../hooks/useResetPassword'
import PasswordInput from '../components/PasswordInput'

export default function ResetPasswordPage() {
  const onNavigate = useNav()
  const {
    token,
    newPwd,
    setNewPwd,
    confirmPwd,
    setConfirmPwd,
    error,
    setError,
    success,
    loading,
    handleSubmit,
  } = useResetPassword()

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#eef0f8' }}>

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Card with thick blue top border */}
        <div
          className="bg-white rounded-2xl w-full max-w-[420px]"
          style={{ border: '1.5px solid #e5e7eb', borderTop: '4px solid var(--accent)' }}
        >
          <div className="px-10 py-9">

            {/* Titles */}
            <div className="text-center mb-7">
              <h1 className="text-[2.6rem] font-black leading-tight mb-2" style={{ color: 'var(--accent)' }}>TechStore</h1>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Đặt lại mật khẩu</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Vui lòng thiết lập mật khẩu mới cho tài<br />khoản của bạn.
              </p>
            </div>

            {/* Status messages */}
            {!token && (
              <div className="text-amber-700 text-sm text-center mb-4 font-medium bg-amber-50 p-3 rounded-xl border border-amber-100">
                Lưu ý: Không tìm thấy mã xác thực. Vui lòng sử dụng liên kết khôi phục từ email của bạn.
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm text-center mb-4 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 text-sm text-center mb-4 font-medium bg-green-50 p-2.5 rounded-xl border border-green-100">
                Cập nhật mật khẩu thành công! Đang chuyển hướng...
              </div>
            )}

            {/* New password */}
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu mới</span>
              <PasswordInput
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setError('') }}
                disabled={loading || success}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            {/* Confirm password */}
            <div className="mb-4">
              <span className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu mới</span>
              <PasswordInput
                value={confirmPwd}
                onChange={(e) => { setConfirmPwd(e.target.value); setError('') }}
                disabled={loading || success}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3.5 mb-5" style={{ backgroundColor: 'var(--accent-dim)' }}>
              <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600 leading-relaxed">
                Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ cái và chữ số.
              </p>
            </div>

            {/* Submit button */}
            <button aria-label="Cập nhật mật khẩu" type="button"
              onClick={handleSubmit}
              disabled={loading || success || !token}
              className="w-full text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer mb-5 tracking-wide disabled:opacity-50 border-none"
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
              onMouseEnter={e => !(loading || success || !token) && (e.currentTarget.style.backgroundColor = 'var(--accent-d)')}
              onMouseLeave={e => !(loading || success || !token) && (e.currentTarget.style.backgroundColor = 'var(--accent)')}
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>

            {/* Back to login */}
            <div className="flex justify-center">
              <button aria-label="Quay lại Đăng nhập" type="button" onClick={() => onNavigate('login')}
                className="flex items-center gap-1.5 text-sm font-bold cursor-pointer transition-colors bg-transparent border-none"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
              >
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
            <button aria-label={link} type="button" key={link} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors bg-transparent border-none">
              {link}
            </button>
          ))}
        </div>
      </footer>

    </div>
  )
}
