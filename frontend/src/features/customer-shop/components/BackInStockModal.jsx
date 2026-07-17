import { useState, useEffect } from 'react'

export default function BackInStockModal({ product, onClose }) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [notifyByEmail, setNotifyByEmail] = useState(true)
  const [notifyByPhone, setNotifyByPhone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill user email from localStorage profile if available
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user_profile')
      if (storedUser) {
        const user = JSON.parse(storedUser)
        if (user.email) setEmail(user.email)
        if (user.phone) setPhone(user.phone)
      }
    } catch (e) {
      console.warn('Could not read user profile from local storage:', e)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validations
    if (notifyByEmail && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      setError('Vui lòng nhập Email hợp lệ.')
      return
    }
    if (notifyByPhone && (!phone || !/^[0-9]{9,11}$/.test(phone))) {
      setError('Vui lòng nhập Số điện thoại hợp lệ (9 - 11 chữ số).')
      return
    }
    if (!notifyByEmail && !notifyByPhone) {
      setError('Vui lòng chọn ít nhất một kênh nhận thông báo.')
      return
    }

    setLoading(true)
    
    // Simulate API request to backend
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] border border-slate-200 w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-450 hover:text-slate-700 transition-all border-none bg-transparent cursor-pointer text-lg font-bold"
        >
          ×
        </button>

        {!success ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <svg className="w-4 h-4 animate-swing" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Nhận thông báo khi có hàng lại</h3>
                <p className="text-[10px] text-slate-450 mt-0.5">Sản phẩm: {product.name}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
              Chúng tôi sẽ tự động gửi email hoặc tin nhắn SMS cho bạn ngay khi sản phẩm này được nhập kho trở lại.
            </p>

            {error && (
              <div className="text-[10.5px] font-bold text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                ⚠️ {error}
              </div>
            )}

            {/* Subscriptions Options */}
            <div className="flex flex-col gap-3.5 bg-slate-50 p-4.5 rounded-xl border border-slate-100">
              {/* Option: Email */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifyByEmail} 
                    onChange={e => setNotifyByEmail(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[var(--accent)] rounded cursor-pointer"
                  />
                  Gửi thông báo qua Email
                </label>
                {notifyByEmail && (
                  <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email của bạn..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E8420A] bg-white transition-colors font-medium text-slate-800"
                    required
                  />
                )}
              </div>

              {/* Option: SMS */}
              <div className="flex flex-col gap-1.5 border-t border-slate-150 pt-3.5 mt-1">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={notifyByPhone} 
                    onChange={e => setNotifyByPhone(e.target.checked)}
                    className="w-3.5 h-3.5 accent-[var(--accent)] rounded cursor-pointer"
                  />
                  Gửi thông báo qua SMS (Số điện thoại)
                </label>
                {notifyByPhone && (
                  <input 
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại của bạn (ví dụ: 0912345678)..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#E8420A] bg-white transition-colors font-medium text-slate-800"
                    required
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-250 transition-colors border-none cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#E8420A] text-white text-xs font-extrabold rounded-xl hover:bg-[#ff551c] transition-colors border-none cursor-pointer flex items-center gap-1.5 shadow-md shadow-orange-500/10 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang đăng ký
                  </>
                ) : (
                  'Đăng ký nhận tin'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl font-bold animate-bounce shadow-inner border border-emerald-100">
              ✓
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">Đăng ký thành công!</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Hệ thống đã ghi nhận yêu cầu của bạn. Chúng tôi sẽ thông báo ngay khi <strong>{product.name}</strong> có hàng trở lại tại cửa hàng.
            </p>
            <button 
              onClick={onClose}
              className="mt-2 px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors border-none cursor-pointer shadow-md"
            >
              Hoàn tất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
