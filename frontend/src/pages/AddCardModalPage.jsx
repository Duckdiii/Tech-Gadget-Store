import { useState } from 'react'
import { useNav } from '../hooks/useNav'

const CARD_GRADIENT = {
  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
}

const fmtCard = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 16)
  return d.match(/.{1,4}/g)?.join(' ') || d
}

const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

export default function AddCardModalPage() {
  const onNavigate = useNav()
  const [cardNum,   setCardNum]   = useState('')
  const [holder,    setHolder]    = useState('')
  const [expiry,    setExpiry]    = useState('')
  const [cvv,       setCvv]       = useState('')
  const [isDefault, setIsDefault] = useState(false)

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10 bg-gray-400">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Thêm Thẻ Mới</h2>
          <button onClick={() => onNavigate('paymentMethods')} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 cursor-pointer text-xl leading-none font-light transition-colors">
            ×
          </button>
        </div>
        <div className="border-t border-gray-200" />

        {/* ── Form body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* ── Credit card preview ── */}
          <div className="rounded-2xl px-5 pt-5 pb-5 relative" style={CARD_GRADIENT}>
            {/* Top row: contactless icon + VISA */}
            <div className="flex items-start justify-between mb-6">
              <div className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center bg-white/10">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white">
                  <circle cx="4.5" cy="12" r="1.5" fill="white" stroke="none" />
                  <path strokeLinecap="round" strokeWidth={1.8} d="M8 8.5a5.5 5.5 0 010 7" />
                  <path strokeLinecap="round" strokeWidth={1.8} d="M11 6a9 9 0 010 12" />
                </svg>
              </div>
              <span className="text-white font-black italic text-2xl tracking-widest select-none">VISA</span>
            </div>

            {/* Card number dots */}
            <div className="flex items-center gap-5 mb-5">
              {[0, 1, 2, 3].map((g) => (
                <div key={g} className="flex gap-1.5">
                  {[0, 1, 2, 3].map((d) => (
                    <div key={d} className="w-2 h-2 rounded-full bg-white/90" />
                  ))}
                </div>
              ))}
            </div>

            {/* Holder + Expiry */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Tên chủ thẻ</p>
                <p className="text-sm font-bold text-white uppercase tracking-wider leading-tight">
                  {holder || 'TÊN CHỦ THẺ'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Hết hạn</p>
                <p className="text-sm font-bold text-white leading-tight">
                  {expiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Số thẻ ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Số thẻ</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
              <input
                type="text"
                value={cardNum}
                onChange={(e) => setCardNum(fmtCard(e.target.value))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] font-mono transition"
              />
              {/* Card brand icons */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide">VISA</span>
                <div className="relative" style={{ width: '28px', height: '18px' }}>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-orange-400 opacity-90" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Tên chủ thẻ ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên chủ thẻ</label>
            <input
              type="text"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              placeholder="NGUYEN VAN A"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] uppercase tracking-wider transition"
            />
          </div>

          {/* ── Ngày hết hạn + CVV/CVC ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày hết hạn</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(fmtExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] text-center font-mono transition"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                CVV/CVC
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E8420A]/30 focus:border-[#E8420A] text-center font-mono transition"
              />
            </div>
          </div>

          {/* ── Default checkbox ── */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[#E8420A] cursor-pointer"
            />
            <span className="text-sm text-gray-700">Đặt làm phương thức thanh toán mặc định</span>
          </label>

        </div>

        {/* ── Footer ── */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button onClick={() => onNavigate('paymentMethods')} className="text-gray-600 hover:text-gray-800 font-bold text-sm cursor-pointer transition-colors px-3 py-1.5">
            Hủy
          </button>
          <button onClick={() => onNavigate('paymentMethods')} className="flex items-center gap-2 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Thêm thẻ
          </button>
        </div>

      </div>
    </div>
  )
}
