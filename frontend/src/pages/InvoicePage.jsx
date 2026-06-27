import { useState, useEffect } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const ORDER = {
  code:        'ORD-2024-8832',
  invoiceCode: 'INV-2024-0892',
  date:        '24/10/2024 · 14:32',
  paymentMethod: 'VNPAY',
  address: {
    name:  'Nguyễn Văn A',
    phone: '090 123 4567',
    line1: 'Tòa nhà Bitexco, Số 2 Hải Triều',
    line2: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  },
  items: [
    { id: 1, brand: 'Apple', name: 'MacBook Pro 14" M3 Pro 2023', variant: 'Space Black | 18GB RAM | 512GB SSD', price: 49990000, originalPrice: 54990000, qty: 1, image: 'https://placehold.co/80x70/f1f5f9/374151?text=MacBook', bundles: [{ label: 'Dán màn hình từ tính', price: 450000 }] },
    { id: 2, brand: 'Apple', name: 'iPhone 15 Pro Max', variant: 'Titan Tự Nhiên | 256GB', price: 29490000, originalPrice: 32990000, qty: 2, image: 'https://placehold.co/80x70/f1f5f9/374151?text=iPhone', bundles: [{ label: 'Bảo hành VIP (Lỗi đổi mới)', price: 1200000 }] },
  ],
  promoCode:      'VNPAY500',
  promoDiscount:   500000,
  methodBonus:     500000,
  vatRate:         0.1,
}

function fmt(n) { return n.toLocaleString('vi-VN') + ' đ' }

/* ─── Tính tiền ─── */
function calcTotals() {
  const subtotal      = ORDER.items.reduce((s, p) => s + p.price * p.qty, 0)
  const originalTotal = ORDER.items.reduce((s, p) => s + (p.originalPrice ?? p.price) * p.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee    = ORDER.items.reduce((s, p) => s + p.bundles.reduce((bs, b) => bs + b.price, 0) * p.qty, 0)
  const beforeVat     = subtotal + serviceFee - ORDER.promoDiscount - ORDER.methodBonus
  const vat           = Math.round(beforeVat * ORDER.vatRate)
  const total         = beforeVat + vat
  const totalSavings  = productSavings + ORDER.promoDiscount + ORDER.methodBonus
  return { subtotal, productSavings, serviceFee, beforeVat, vat, total, totalSavings }
}

/* ─── Invoice Modal Content ─── */
function InvoiceDocument({ onClose }) {
  const { subtotal, productSavings, serviceFee, vat, total } = calcTotals()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto">

        {/* Modal top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Hóa đơn điện tử
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              In
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Invoice body */}
        <div className="px-8 py-6">

          {/* Header: company + invoice meta */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" /></svg>
                </div>
                <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>TechStore</span>
              </div>
              <div className="text-[13px] text-gray-500 space-y-0.5">
                <p>123 Nguyễn Văn Linh, Quận 7, TP. HCM</p>
                <p>MST: 0123456789</p>
                <p>Hotline: 1800 1234</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-gray-900 tracking-wide">HÓA ĐƠN BÁN HÀNG</p>
              <div className="mt-3 space-y-1.5">
                {[['Mã hóa đơn', ORDER.invoiceCode], ['Mã đơn hàng', ORDER.code], ['Ngày lập', ORDER.date]].map(([l, v]) => (
                  <div key={l} className="flex items-center justify-end gap-4">
                    <span className="text-[12px] text-gray-500">{l}:</span>
                    <span className="text-[13px] font-bold text-gray-800 min-w-[130px] text-right">{v}</span>
                  </div>
                ))}
                <div className="flex items-center justify-end gap-4">
                  <span className="text-[12px] text-gray-500">Trạng thái:</span>
                  <span className="text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">Đã thanh toán</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mb-5" />

          {/* Customer + Shipping */}
          <div className="grid grid-cols-2 gap-6 bg-gray-50 rounded-xl px-5 py-4 mb-6">
            <div>
              <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Thông tin khách hàng</p>
              <p className="text-[14px] font-bold text-gray-900">{ORDER.address.name}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">{ORDER.address.phone}</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Thanh toán: {ORDER.paymentMethod}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Địa chỉ giao hàng</p>
              <p className="text-[13px] text-gray-700">{ORDER.address.line1}</p>
              <p className="text-[13px] text-gray-600">{ORDER.address.line2}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-4">
            <div className="grid grid-cols-[2rem_1fr_4rem_7rem_7rem] pb-2.5 border-b border-gray-200">
              {['#', 'Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền'].map(h => (
                <span key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider last:text-right">{h}</span>
              ))}
            </div>
            {ORDER.items.map((item, i) => {
              const bundleFee = item.bundles.reduce((s, b) => s + b.price, 0)
              const lineTotal = (item.price + bundleFee) * item.qty
              return (
                <div key={item.id} className={`grid grid-cols-[2rem_1fr_4rem_7rem_7rem] py-3.5 ${i < ORDER.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-[12px] text-gray-400 font-medium">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900">{item.name}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{item.variant}</p>
                    {item.bundles.map((b, bi) => (
                      <p key={bi} className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>+ {b.label} · {fmt(b.price)}</p>
                    ))}
                  </div>
                  <span className="text-[13px] text-gray-700 text-center">{item.qty}</span>
                  <span className="text-[13px] text-gray-700 text-right">{fmt(item.price)}</span>
                  <span className="text-[13px] font-bold text-gray-900 text-right">{fmt(lineTotal)}</span>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-semibold text-gray-700">{fmt(subtotal)}</span>
              </div>
              {productSavings > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">Giảm giá sản phẩm</span>
                  <span className="font-bold text-green-600">−{fmt(productSavings)}</span>
                </div>
              )}
              {serviceFee > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-500">Dịch vụ kèm</span>
                  <span className="font-semibold text-orange-500">+{fmt(serviceFee)}</span>
                </div>
              )}
              {ORDER.promoDiscount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">Mã {ORDER.promoCode}</span>
                  <span className="font-bold text-green-600">−{fmt(ORDER.promoDiscount)}</span>
                </div>
              )}
              {ORDER.methodBonus > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span style={{ color: 'var(--accent)' }}>Ưu đãi {ORDER.paymentMethod}</span>
                  <span className="font-bold" style={{ color: 'var(--accent)' }}>−{fmt(ORDER.methodBonus)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-bold text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">VAT (10%)</span>
                <span className="font-semibold text-gray-600">+{fmt(vat)}</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-end">
                <div>
                  <span className="text-[14px] font-bold text-gray-800">Tổng cộng</span>
                  <p className="text-[11px] text-gray-400">Đã bao gồm VAT</p>
                </div>
                <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice footer */}
        <div className="border-t border-gray-100 px-8 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-between">
          <p className="text-[12px] text-gray-400">Cảm ơn bạn đã mua sắm tại TechStore!</p>
          <p className="text-[12px] text-gray-400">support@techstore.vn · 1800 1234</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Order Success Page ─── */
export default function InvoicePage() {
  const onNavigate = useNav()
  const [showInvoice, setShowInvoice] = useState(false)
  const [visible, setVisible] = useState(false)
  const { total, totalSavings } = calcTotals()

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <StoreNavbar />

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {/* ── Success hero ── */}
          <div className={`flex flex-col items-center text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Animated checkmark circle */}
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-2">Đặt hàng thành công!</h1>
            <p className="text-gray-500 text-[15px] leading-relaxed max-w-md">
              Đơn hàng của bạn đã được xác nhận và đang được xử lý. Chúng tôi sẽ thông báo khi hàng được giao.
            </p>
          </div>

          {/* ── Order info card ── */}
          <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4 transition-all duration-700 delay-150 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* Order code banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-green-100 text-[12px] font-semibold uppercase tracking-wider">Mã đơn hàng</p>
                <p className="text-white text-xl font-black mt-0.5">{ORDER.code}</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-[12px]">{ORDER.date}</p>
                <span className="inline-block mt-1 bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  Đã xác nhận
                </span>
              </div>
            </div>

            {/* Payment result */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'Tổng thanh toán', value: fmt(total), highlight: true },
                { label: 'Phương thức', value: ORDER.paymentMethod },
                { label: 'Tiết kiệm được', value: fmt(totalSavings), green: true },
              ].map(({ label, value, highlight, green }) => (
                <div key={label} className="px-5 py-4 text-center">
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-[15px] font-black ${highlight ? 'text-[#E8420A]' : green ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Delivery address */}
            <div className="px-6 py-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent-dim)' }}>
                <svg className="w-4 h-4" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1">Địa chỉ giao hàng</p>
                <p className="text-[14px] font-semibold text-gray-800">{ORDER.address.name} · {ORDER.address.phone}</p>
                <p className="text-[13px] text-gray-500 mt-0.5">{ORDER.address.line1}</p>
                <p className="text-[13px] text-gray-400">{ORDER.address.line2}</p>
              </div>
            </div>
          </div>

          {/* ── Items summary ── */}
          <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="px-6 py-4 border-b border-gray-50">
              <p className="text-[13px] font-bold text-gray-700">Sản phẩm đã đặt ({ORDER.items.reduce((s, p) => s + p.qty, 0)} sản phẩm)</p>
            </div>
            <div className="divide-y divide-gray-50">
              {ORDER.items.map(item => {
                const bundleFee = item.bundles.reduce((s, b) => s + b.price, 0)
                return (
                  <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-14 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{item.variant} · SL: {item.qty}</p>
                      {item.bundles.length > 0 && (
                        <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>{item.bundles.map(b => b.label).join(', ')}</p>
                      )}
                    </div>
                    <p className="text-[14px] font-bold text-gray-800 shrink-0">{fmt((item.price + bundleFee) * item.qty)}</p>
                  </div>
                )
              })}
            </div>
          </div>
 
          {/* ── Action buttons ── */}
          <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-[450ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button
              onClick={() => setShowInvoice(true)}
              className="flex-1 flex items-center justify-center gap-2 font-bold text-[14px] py-3.5 rounded-xl transition-all cursor-pointer"
              style={{ border: '2px solid var(--accent)', color: 'var(--accent)', backgroundColor: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-dim)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Xem hóa đơn
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-[14px] py-3.5 rounded-xl transition-all cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232,66,10,0.18)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              Về trang chủ
            </button>
          </div>

          <p className="text-center text-[12px] text-gray-400 mt-5">
            Có vấn đề về đơn hàng?{' '}
            <span className="hover:underline cursor-pointer font-bold" style={{ color: 'var(--accent)' }}>Liên hệ hỗ trợ</span>
            {' '}· Hotline: <span className="font-semibold text-gray-600">1800 1234</span>
          </p>
        </div>
      </div>

      {/* Invoice modal */}
      {showInvoice && <InvoiceDocument onClose={() => setShowInvoice(false)} />}
    </div>
  )
}
