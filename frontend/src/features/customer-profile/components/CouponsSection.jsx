import { useState } from 'react'

const COUPONS_DATA = [
  {
    id: 1, code: 'ELITE10', status: 'active',
    label: 'Giảm 10% toàn đơn hàng',
    desc: 'Áp dụng cho tất cả sản phẩm, tối đa 500.000đ',
    exp: '30/06/2026', minOrder: 1000000,
    type: 'percent', value: 10,
    color: 'from-[#E8420A] to-orange-700', badge: 'bg-orange-100 text-[#E8420A]',
  },
  {
    id: 2, code: 'FREESHIP', status: 'active',
    label: 'Miễn phí vận chuyển',
    desc: 'Áp dụng cho đơn hàng từ 200.000đ trở lên',
    exp: '15/06/2026', minOrder: 200000,
    type: 'ship', value: 0,
    color: 'from-green-500 to-emerald-600', badge: 'bg-green-100 text-green-700',
  },
  {
    id: 3, code: 'DOUBLE2X', status: 'active',
    label: 'Tích điểm x2 cuối tuần',
    desc: 'Nhân đôi điểm thưởng cho mọi đơn hàng thứ 7 & CN',
    exp: '30/06/2026', minOrder: 0,
    type: 'points', value: 2,
    color: 'from-purple-500 to-violet-600', badge: 'bg-purple-100 text-purple-700',
  },
  {
    id: 4, code: 'BDAY500', status: 'active',
    label: 'Quà sinh nhật — giảm 500.000đ',
    desc: 'Áp dụng cho đơn hàng từ 2.000.000đ, dùng 1 lần',
    exp: '01/07/2026', minOrder: 2000000,
    type: 'flat', value: 500000,
    color: 'from-rose-500 to-pink-600', badge: 'bg-rose-100 text-rose-700',
  },
  {
    id: 5, code: 'SAVE20OLD', status: 'used',
    label: 'Giảm 20% đơn đầu tiên',
    desc: 'Đã sử dụng cho đơn #ORD-2502000087',
    exp: '28/02/2025', minOrder: 500000,
    type: 'percent', value: 20,
    color: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-500',
  },
  {
    id: 6, code: 'FLASH15', status: 'expired',
    label: 'Flash Sale — giảm 15%',
    desc: 'Chương trình khuyến mãi cuối năm 2024',
    exp: '31/12/2024', minOrder: 3000000,
    type: 'percent', value: 15,
    color: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-500',
  },
]

export default function CouponsSection() {
  const [tab, setTab]       = useState('active')
  const [copied, setCopied] = useState(null)

  const filtered = tab === 'all' ? COUPONS_DATA : COUPONS_DATA.filter(c => c.status === tab)

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(code)
    setTimeout(() => setCopied(null), 1800)
  }

  const valueLabel = (c) => {
    if (c.type === 'percent') return `Giảm ${c.value}%`
    if (c.type === 'flat')    return `Giảm ${c.value.toLocaleString('vi-VN')}đ`
    if (c.type === 'ship')    return 'Miễn ship'
    if (c.type === 'points')  return `x${c.value} điểm`
    return ''
  }

  return (
    <div className="space-y-5 text-gray-800">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Mã còn hiệu lực', value: COUPONS_DATA.filter(c => c.status === 'active').length,  color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Mã đã sử dụng',   value: COUPONS_DATA.filter(c => c.status === 'used').length,    color: 'bg-gray-50 border-gray-200 text-gray-600'   },
          { label: 'Mã hết hạn',       value: COUPONS_DATA.filter(c => c.status === 'expired').length, color: 'bg-gray-50 border-gray-200 text-gray-500'   },
        ].map((s, i) => (
          <div key={i} className={`rounded border px-5 py-4 text-center ${s.color}`}>
            <p className="text-3xl font-black">{s.value}</p>
            <p className="text-xs font-semibold mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon list */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 px-2 pt-2 gap-1">
          {[
            { id: 'active',  label: 'Còn hiệu lực' },
            { id: 'used',    label: 'Đã dùng'       },
            { id: 'expired', label: 'Hết hạn'        },
            { id: 'all',     label: 'Tất cả'          },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap bg-transparent cursor-pointer ${
                tab === t.id
                  ? 'border-[#E8420A] text-[#E8420A]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {t.id === 'all' ? COUPONS_DATA.length : COUPONS_DATA.filter(c => c.status === t.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-sm font-medium">Không có mã giảm giá nào</p>
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 gap-4">
            {filtered.map(coupon => {
              const isInactive = coupon.status !== 'active'
              return (
                <div
                  key={coupon.id}
                  className={`rounded overflow-hidden border transition-shadow ${
                    isInactive ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:shadow-md'
                  }`}
                >
                  <div className="flex">
                    <div className={`bg-gradient-to-b ${coupon.color} w-3 shrink-0 ${isInactive ? 'opacity-40' : ''}`} />
                    <div className="flex-1 flex items-stretch">
                      <div className="flex-1 px-5 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-black px-2.5 py-1 rounded ${coupon.badge}`}>
                            {valueLabel(coupon)}
                          </span>
                          {coupon.status === 'used'    && <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Đã dùng</span>}
                          {coupon.status === 'expired' && <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded">Hết hạn</span>}
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-snug">{coupon.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{coupon.desc}</p>
                        <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-400">
                          {coupon.minOrder > 0 && (
                            <span>Đơn tối thiểu: <span className="font-semibold text-gray-600">{coupon.minOrder.toLocaleString('vi-VN')}đ</span></span>
                          )}
                          <span>HSD: <span className="font-semibold text-gray-600">{coupon.exp}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-full w-px border-l border-dashed border-gray-200 mx-1" />
                        <div className="px-5 py-4 flex flex-col items-center justify-center gap-2.5 min-w-[120px]">
                          <span className="font-mono text-sm font-black text-gray-800 tracking-widest">{coupon.code}</span>
                          {!isInactive ? (
                            <button
                              onClick={() => handleCopy(coupon.code)}
                              className={`text-xs font-bold px-4 py-1.5 rounded transition-all border-none cursor-pointer ${
                                copied === coupon.code
                                  ? 'bg-green-500 text-white'
                                  : 'bg-[#E8420A] hover:bg-[#c93808] text-white'
                              }`}
                            >
                              {copied === coupon.code ? '✓ Đã sao chép' : 'Sao chép'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Không khả dụng</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'active' && filtered.length > 0 && (
          <div className="px-5 pb-5">
            <p className="text-xs text-gray-400 text-center bg-gray-50 rounded py-3">
              Mã giảm giá sẽ được áp dụng tự động hoặc nhập thủ công tại trang <span className="font-semibold">Xác nhận đặt hàng</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
