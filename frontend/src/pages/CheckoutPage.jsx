import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const ADDRESSES = [
  { id: 1, name: 'Nguyễn Văn A', phone: '090 123 4567', line1: 'Tòa nhà Bitexco, Số 2 Hải Triều', line2: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', isDefault: true },
  { id: 2, name: 'Nguyễn Văn A (Công ty)', phone: '090 123 4567', line1: 'Khu Công Nghệ Cao, Đường D1', line2: 'Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh', isDefault: false },
]

const PAYMENT_METHODS = [
  { id: 'momo',  label: 'Ví MoMo',               desc: 'Thanh toán qua ví điện tử MoMo',          bonus: 0,      color: 'bg-pink-600' },
  { id: 'vnpay', label: 'VNPAY',                  desc: 'Ưu đãi giảm thêm 500.000đ khi dùng VNPAY', bonus: 500000, color: 'bg-blue-600' },
  { id: 'cod',   label: 'Tiền mặt khi nhận hàng', desc: 'Thanh toán khi nhận được hàng',           bonus: 0,      color: 'bg-gray-200' },
]

const ORDER_ITEMS = [
  { id: 1, brand: 'Apple', name: 'MacBook Pro 14" M3 Pro 2023', variant: 'Space Black | 18GB RAM | 512GB SSD', price: 49990000, originalPrice: 54990000, qty: 1, image: 'https://placehold.co/80x70/f1f5f9/374151?text=MacBook', bundles: [{ label: 'Dán màn hình từ tính', price: 450000 }] },
  { id: 2, brand: 'Apple', name: 'iPhone 15 Pro Max', variant: 'Titan Tự Nhiên | 256GB', price: 29490000, originalPrice: 32990000, qty: 2, image: 'https://placehold.co/80x70/f1f5f9/374151?text=iPhone', bundles: [{ label: 'Bảo hành VIP (Lỗi đổi mới)', price: 1200000 }] },
]

const VALID_CODES = { TECH10: 0.1, VNPAY500: 500000, SAVE5: 0.05 }
const VAT_RATE = 0.1

function fmt(n) { return n.toLocaleString('vi-VN') + ' đ' }

function SectionCard({ step, title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[13px] font-bold flex items-center justify-center shrink-0">{step}</div>
        <span className="text-blue-500">{icon}</span>
        <h2 className="text-[15px] font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ProductsSection() {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? ORDER_ITEMS : ORDER_ITEMS.slice(0, 2)
  return (
    <SectionCard step="1" title="Sản phẩm đặt mua" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    }>
      <div className="space-y-4">
        {shown.map((p, i) => (
          <div key={p.id}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{p.brand}</span>
                    <p className="text-[14px] font-semibold text-gray-900 leading-snug mt-0.5">{p.name}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{p.variant}</p>
                    {p.bundles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.bundles.map((b, bi) => (
                          <span key={bi} className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                            + {b.label} · {fmt(b.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-bold text-blue-600">{fmt(p.price)}</p>
                    {p.originalPrice && <p className="text-[12px] text-gray-400 line-through">{fmt(p.originalPrice)}</p>}
                    <p className="text-[12px] text-gray-500 mt-0.5">SL: {p.qty}</p>
                  </div>
                </div>
              </div>
            </div>
            {i < shown.length - 1 && <div className="border-t border-gray-50 mt-4" />}
          </div>
        ))}
      </div>
      {ORDER_ITEMS.length > 2 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-4 w-full text-[13px] text-blue-600 font-medium flex items-center justify-center gap-1">
          {expanded ? 'Thu gọn' : `Xem thêm ${ORDER_ITEMS.length - 2} sản phẩm`}
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      )}
    </SectionCard>
  )
}

function AddressSection({ selected, onSelect }) {
  return (
    <SectionCard step="2" title="Địa chỉ giao hàng" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }>
      <div className="space-y-3">
        {ADDRESSES.map(addr => (
          <label key={addr.id} onClick={() => onSelect(addr.id)} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === addr.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected === addr.id ? 'border-blue-600' : 'border-gray-300'}`}>
              {selected === addr.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold text-gray-800">{addr.name}</span>
                <span className="text-[13px] text-gray-400">· {addr.phone}</span>
                {addr.isDefault && <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-semibold">Mặc định</span>}
              </div>
              <p className="text-[13px] text-gray-600">{addr.line1}</p>
              <p className="text-[13px] text-gray-500">{addr.line2}</p>
            </div>
            {selected === addr.id && <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
          </label>
        ))}
        <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-[13px] font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Thêm địa chỉ mới
        </button>
      </div>
    </SectionCard>
  )
}

function PromoSection({ applied, code, onCodeChange, onApply, onRemove, discount }) {
  return (
    <SectionCard step="3" title="Mã khuyến mãi" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    }>
      {applied ? (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-bold text-green-700">Mã <span className="uppercase">{code}</span> đã áp dụng</p>
              <p className="text-[12px] text-green-600">Giảm {fmt(discount)}</p>
            </div>
          </div>
          <button onClick={onRemove} className="text-[12px] text-gray-400 hover:text-red-500 font-medium">Xoá</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="text" value={code} onChange={e => onCodeChange(e.target.value.toUpperCase())} placeholder="Nhập mã khuyến mãi (VD: TECH10)" className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-[14px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 uppercase font-mono tracking-widest" />
          <button onClick={onApply} disabled={!code.trim()} className="px-5 py-2.5 rounded-xl text-[13px] font-bold shrink-0 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed enabled:bg-blue-600 enabled:text-white enabled:hover:bg-blue-700 enabled:cursor-pointer transition-all">Áp dụng</button>
        </div>
      )}
    </SectionCard>
  )
}

function PaymentSection({ selected, onSelect }) {
  return (
    <SectionCard step="4" title="Phương thức thanh toán" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    }>
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => (
          <label key={m.id} onClick={() => onSelect(m.id)} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === m.id ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === m.id ? 'border-blue-600' : 'border-gray-300'}`}>
              {selected === m.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
            </div>
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
              <span className={`font-black text-[11px] text-center leading-tight ${m.id === 'cod' ? 'text-gray-500' : 'text-white'}`}>
                {m.id === 'momo' ? 'Momo' : m.id === 'vnpay' ? 'VN\nPAY' : '₫'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-gray-800">{m.label}</p>
              <p className={`text-[12px] mt-0.5 ${m.id === 'vnpay' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>{m.desc}</p>
            </div>
            {selected === m.id && <svg className="w-5 h-5 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

/* ── Inline price summary ── */
function PriceSummary({ paymentMethod, promoDiscount, promoCode }) {
  const subtotal      = ORDER_ITEMS.reduce((s, p) => s + p.price * p.qty, 0)
  const originalTotal = ORDER_ITEMS.reduce((s, p) => s + (p.originalPrice ?? p.price) * p.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee    = ORDER_ITEMS.reduce((s, p) => s + p.bundles.reduce((bs, b) => bs + b.price, 0) * p.qty, 0)
  const pm            = PAYMENT_METHODS.find(m => m.id === paymentMethod)
  const methodBonus   = pm?.bonus ?? 0
  const beforeVat     = subtotal + serviceFee - promoDiscount - methodBonus
  const vat           = Math.round(beforeVat * VAT_RATE)
  const total         = beforeVat + vat
  const totalSavings  = productSavings + promoDiscount + methodBonus

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-[15px] font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        Tóm tắt thanh toán
      </h3>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[13px]">
          <span className="text-gray-500">Tạm tính sản phẩm</span>
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
            <span className="text-gray-500">Dịch vụ kèm theo</span>
            <span className="font-semibold text-orange-500">+{fmt(serviceFee)}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="text-green-600">Mã <span className="font-bold uppercase">{promoCode}</span></span>
            <span className="font-bold text-green-600">−{fmt(promoDiscount)}</span>
          </div>
        )}
        {methodBonus > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="text-blue-600 font-medium">Ưu đãi {pm?.label}</span>
            <span className="font-bold text-blue-600">−{fmt(methodBonus)}</span>
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
      </div>

      <div className="border-t-2 border-dashed border-gray-100 my-4" />

      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-bold text-gray-700">Tổng thanh toán</p>
          <p className="text-[11px] text-gray-400">Đã bao gồm VAT</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-black text-blue-700 leading-none">{fmt(total)}</p>
          {totalSavings > 0 && (
            <p className="text-[12px] font-bold text-green-600 mt-1">Tiết kiệm {fmt(totalSavings)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const onNavigate = useNav()
  const [selectedAddress, setSelectedAddress] = useState(1)
  const [selectedPayment, setSelectedPayment]  = useState('vnpay')
  const [promoCode,       setPromoCode]        = useState('')
  const [promoApplied,    setPromoApplied]     = useState(false)
  const [promoError,      setPromoError]       = useState('')

  const subtotal    = ORDER_ITEMS.reduce((s, p) => s + p.price * p.qty, 0)
  const rawDiscount = VALID_CODES[promoCode] ?? null
  const promoDiscount = promoApplied && rawDiscount !== null
    ? (rawDiscount < 1 ? Math.round(subtotal * rawDiscount) : rawDiscount) : 0

  const handleApplyPromo = () => {
    if (VALID_CODES[promoCode] !== undefined) { setPromoApplied(true); setPromoError('') }
    else setPromoError('Mã không hợp lệ hoặc đã hết hạn')
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <StoreNavbar />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Xác nhận đơn hàng</h1>
            <p className="text-sm text-gray-400 mt-1">Kiểm tra thông tin trước khi hoàn tất</p>
          </div>
          <button onClick={() => onNavigate('cart')} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại giỏ hàng
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Giỏ hàng', 'Xác nhận', 'Hoàn tất'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${i === 1 ? 'bg-blue-600 text-white' : i < 1 ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
                <span className={`text-[13px] font-semibold ${i === 1 ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < 2 && <div className={`w-10 h-[2px] ${i < 1 ? 'bg-gray-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <ProductsSection />
          <AddressSection selected={selectedAddress} onSelect={setSelectedAddress} />
          <div>
            <PromoSection
              applied={promoApplied} code={promoCode}
              onCodeChange={c => { setPromoCode(c); setPromoApplied(false); setPromoError('') }}
              onApply={handleApplyPromo}
              onRemove={() => { setPromoApplied(false); setPromoCode('') }}
              discount={promoDiscount}
            />
            {promoError && (
              <p className="text-[13px] text-red-500 font-medium mt-2 flex items-center gap-1.5 px-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {promoError}
              </p>
            )}
          </div>
          <PaymentSection selected={selectedPayment} onSelect={setSelectedPayment} />

          {/* Price summary */}
          <PriceSummary paymentMethod={selectedPayment} promoDiscount={promoDiscount} promoCode={promoCode} />

          {/* Confirm button – only CTA */}
          <button
            onClick={() => onNavigate('invoice')}
            className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[.98] text-white font-bold text-[16px] py-4 rounded-2xl transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Xác nhận đặt hàng
          </button>

          <p className="text-[12px] text-gray-400 text-center pb-4">
            Bằng việc đặt hàng, bạn đồng ý với{' '}
            <span className="text-blue-500 hover:underline cursor-pointer">Điều khoản dịch vụ</span>
            {' '}và{' '}
            <span className="text-blue-500 hover:underline cursor-pointer">Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  )
}
