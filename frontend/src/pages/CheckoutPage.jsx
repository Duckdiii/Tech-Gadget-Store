import { useState } from 'react'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'

const ADDRESSES = [
  { id: 1, name: 'Nguyễn Văn A', phone: '090 123 4567', line1: 'Tòa nhà Bitexco, Số 2 Hải Triều', line2: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh', isDefault: true },
  { id: 2, name: 'Nguyễn Văn A (Công ty)', phone: '090 123 4567', line1: 'Khu Công Nghệ Cao, Đường D1', line2: 'Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh', isDefault: false },
]

const PAYMENT_METHODS = [
  { id: 'momo',  label: 'Ví MoMo',               desc: 'Thanh toán qua ví điện tử MoMo',            bonus: 0,      color: '#be185d' },
  { id: 'vnpay', label: 'VNPAY',                  desc: 'Ưu đãi giảm thêm 500.000đ khi dùng VNPAY', bonus: 500000, color: '#1d4ed8' },
  { id: 'cod',   label: 'Tiền mặt khi nhận hàng', desc: 'Thanh toán khi nhận được hàng',             bonus: 0,      color: '#6b7280' },
]

const ORDER_ITEMS = [
  { id: 1, brand: 'Apple', name: 'MacBook Pro 14" M3 Pro 2023', variant: 'Space Black | 18GB RAM | 512GB SSD', price: 49990000, originalPrice: 54990000, qty: 1, image: 'https://placehold.co/80x70/EEF1F9/96A3BC?text=MacBook', bundles: [{ label: 'Dán màn hình từ tính', price: 450000 }] },
  { id: 2, brand: 'Apple', name: 'iPhone 15 Pro Max', variant: 'Titan Tự Nhiên | 256GB', price: 29490000, originalPrice: 32990000, qty: 2, image: 'https://placehold.co/80x70/EEF1F9/96A3BC?text=iPhone', bundles: [{ label: 'Bảo hành VIP (Lỗi đổi mới)', price: 1200000 }] },
]

const VALID_CODES = { TECH10: 0.1, VNPAY500: 500000, SAVE5: 0.05 }
const VAT_RATE = 0.1

function fmt(n) { return n.toLocaleString('vi-VN') + ' đ' }

function SectionCard({ step, title, icon, children }) {
  return (
    <div className="overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--cb)', backgroundColor: 'var(--page)' }}>
        <div className="w-7 h-7 flex items-center justify-center text-white text-[13px] font-bold shrink-0" style={{ backgroundColor: 'var(--accent)', borderRadius: '3px' }}>{step}</div>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h2 className="text-[15px] font-bold" style={{ color: 'var(--ct1)', fontFamily: 'Syne, sans-serif' }}>{title}</h2>
      </div>
      <div className="p-5">{children}</div>
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
              <div className="w-16 h-14 flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--page)', border: '1px solid var(--cb)', borderRadius: '3px' }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{p.brand}</span>
                    <p className="text-[14px] font-semibold leading-snug mt-0.5" style={{ color: 'var(--ct1)' }}>{p.name}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--ct3)' }}>{p.variant}</p>
                    {p.bundles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.bundles.map((b, bi) => (
                          <span key={bi} className="text-[11px] font-medium px-2 py-0.5"
                            style={{ color: 'var(--accent)', backgroundColor: 'rgba(232,66,10,0.07)', border: '1px solid rgba(232,66,10,0.2)', borderRadius: '2px' }}>
                            + {b.label} · {fmt(b.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-bold" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(p.price)}</p>
                    {p.originalPrice && <p className="text-[12px] line-through" style={{ color: 'var(--ct3)' }}>{fmt(p.originalPrice)}</p>}
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--ct3)' }}>SL: {p.qty}</p>
                  </div>
                </div>
              </div>
            </div>
            {i < shown.length - 1 && <div className="mt-4" style={{ borderTop: '1px solid var(--cb)' }} />}
          </div>
        ))}
      </div>
      {ORDER_ITEMS.length > 2 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-4 w-full text-[13px] font-medium flex items-center justify-center gap-1 transition-colors" style={{ color: 'var(--accent)' }}>
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
          <label key={addr.id} onClick={() => onSelect(addr.id)}
            className="flex items-start gap-3 p-4 cursor-pointer transition-all"
            style={{
              border: selected === addr.id ? '2px solid var(--accent)' : '1px solid var(--cb)',
              backgroundColor: selected === addr.id ? 'rgba(232,66,10,0.04)' : 'var(--card)',
              borderRadius: '4px',
            }}
            onMouseEnter={e => { if (selected !== addr.id) e.currentTarget.style.borderColor = '#c8d0e4' }}
            onMouseLeave={e => { if (selected !== addr.id) e.currentTarget.style.borderColor = 'var(--cb)' }}
          >
            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors`}
              style={{ borderColor: selected === addr.id ? 'var(--accent)' : 'var(--cb)' }}>
              {selected === addr.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[14px] font-semibold" style={{ color: 'var(--ct1)' }}>{addr.name}</span>
                <span className="text-[13px]" style={{ color: 'var(--ct3)' }}>· {addr.phone}</span>
                {addr.isDefault && <span className="text-[11px] font-semibold px-2 py-0.5" style={{ color: 'var(--accent)', backgroundColor: 'rgba(232,66,10,0.07)', border: '1px solid rgba(232,66,10,0.2)', borderRadius: '2px' }}>Mặc định</span>}
              </div>
              <p className="text-[13px]" style={{ color: 'var(--ct2)' }}>{addr.line1}</p>
              <p className="text-[13px]" style={{ color: 'var(--ct3)' }}>{addr.line2}</p>
            </div>
            {selected === addr.id && <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
          </label>
        ))}
        <button className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-medium transition-colors"
          style={{ border: '2px dashed var(--cb)', borderRadius: '4px', color: 'var(--ct3)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--cb)'; e.currentTarget.style.color = 'var(--ct3)' }}
        >
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
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '4px' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: 'var(--ok)', borderRadius: '3px' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-[13px] font-bold" style={{ color: '#15803d' }}>Mã <span className="uppercase">{code}</span> đã áp dụng</p>
              <p className="text-[12px]" style={{ color: '#166534' }}>Giảm {fmt(discount)}</p>
            </div>
          </div>
          <button onClick={onRemove} className="text-[12px] font-medium transition-colors" style={{ color: 'var(--ct3)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--err)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct3)'}
          >Xoá</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="text" value={code} onChange={e => onCodeChange(e.target.value.toUpperCase())}
            placeholder="Nhập mã khuyến mãi (VD: TECH10)"
            className="field-light flex-1 px-4 py-2.5 text-[14px] font-mono tracking-widest uppercase"
          />
          <button onClick={onApply} disabled={!code.trim()}
            className="px-5 py-2.5 text-[13px] font-bold shrink-0 transition-colors"
            style={{ backgroundColor: code.trim() ? 'var(--accent)' : 'var(--page)', color: code.trim() ? 'white' : 'var(--ct3)', borderRadius: '4px', border: code.trim() ? 'none' : '1px solid var(--cb)', cursor: code.trim() ? 'pointer' : 'not-allowed' }}
            onMouseEnter={e => { if (code.trim()) e.currentTarget.style.backgroundColor = 'var(--accent-d)' }}
            onMouseLeave={e => { if (code.trim()) e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >Áp dụng</button>
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
          <label key={m.id} onClick={() => onSelect(m.id)}
            className="flex items-center gap-4 p-4 cursor-pointer transition-all"
            style={{
              border: selected === m.id ? '2px solid var(--accent)' : '1px solid var(--cb)',
              backgroundColor: selected === m.id ? 'rgba(232,66,10,0.04)' : 'var(--card)',
              borderRadius: '4px',
            }}
            onMouseEnter={e => { if (selected !== m.id) e.currentTarget.style.borderColor = '#c8d0e4' }}
            onMouseLeave={e => { if (selected !== m.id) e.currentTarget.style.borderColor = 'var(--cb)' }}
          >
            <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
              style={{ borderColor: selected === m.id ? 'var(--accent)' : 'var(--cb)' }}>
              {selected === m.id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />}
            </div>
            <div className="w-10 h-10 flex items-center justify-center shrink-0 text-white font-black text-[11px] text-center leading-tight"
              style={{ backgroundColor: m.color, borderRadius: '3px' }}>
              {m.id === 'momo' ? 'Momo' : m.id === 'vnpay' ? 'VN\nPAY' : '₫'}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold" style={{ color: 'var(--ct1)' }}>{m.label}</p>
              <p className="text-[12px] mt-0.5" style={{ color: m.bonus > 0 ? 'var(--ok)' : 'var(--ct3)', fontWeight: m.bonus > 0 ? '600' : '400' }}>{m.desc}</p>
            </div>
            {selected === m.id && <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

function PriceSummary({ paymentMethod, promoDiscount, promoCode }) {
  const subtotal = ORDER_ITEMS.reduce((s, p) => s + p.price * p.qty, 0)
  const originalTotal = ORDER_ITEMS.reduce((s, p) => s + (p.originalPrice ?? p.price) * p.qty, 0)
  const productSavings = originalTotal - subtotal
  const serviceFee = ORDER_ITEMS.reduce((s, p) => s + p.bundles.reduce((bs, b) => bs + b.price, 0) * p.qty, 0)
  const pm = PAYMENT_METHODS.find(m => m.id === paymentMethod)
  const methodBonus = pm?.bonus ?? 0
  const beforeVat = subtotal + serviceFee - promoDiscount - methodBonus
  const vat = Math.round(beforeVat * VAT_RATE)
  const total = beforeVat + vat
  const totalSavings = productSavings + promoDiscount + methodBonus

  return (
    <div className="overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--cb)', borderRadius: '4px' }}>
      {/* Dark summary header */}
      <div className="px-5 py-4 text-white" style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }}>
        <div className="flex items-center gap-2">
          <div className="w-[2px] h-5" style={{ backgroundColor: 'var(--accent)' }} />
          <h3 className="text-[15px] font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Tóm tắt thanh toán</h3>
        </div>
      </div>

      <div className="p-5 space-y-2.5">
        <div className="flex justify-between text-[13px]">
          <span style={{ color: 'var(--ct2)' }}>Tạm tính sản phẩm</span>
          <span className="font-semibold" style={{ color: 'var(--ct1)' }}>{fmt(subtotal)}</span>
        </div>
        {productSavings > 0 && (
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--ok)' }}>Giảm giá sản phẩm</span>
            <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(productSavings)}</span>
          </div>
        )}
        {serviceFee > 0 && (
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--ct2)' }}>Dịch vụ kèm theo</span>
            <span className="font-semibold" style={{ color: 'var(--accent)' }}>+{fmt(serviceFee)}</span>
          </div>
        )}
        {promoDiscount > 0 && (
          <div className="flex justify-between text-[13px]">
            <span style={{ color: 'var(--ok)' }}>Mã <span className="font-bold uppercase">{promoCode}</span></span>
            <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(promoDiscount)}</span>
          </div>
        )}
        {methodBonus > 0 && (
          <div className="flex justify-between text-[13px]">
            <span className="font-medium" style={{ color: 'var(--ok)' }}>Ưu đãi {pm?.label}</span>
            <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(methodBonus)}</span>
          </div>
        )}
        <div className="flex justify-between text-[13px]">
          <span style={{ color: 'var(--ct2)' }}>Phí vận chuyển</span>
          <span className="font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span style={{ color: 'var(--ct2)' }}>VAT (10%)</span>
          <span className="font-semibold" style={{ color: 'var(--ct2)' }}>+{fmt(vat)}</span>
        </div>
      </div>

      <div style={{ borderTop: '2px dashed var(--cb)', margin: '0 20px' }} />

      <div className="flex items-end justify-between px-5 py-4">
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--ct1)' }}>Tổng thanh toán</p>
          <p className="text-[11px]" style={{ color: 'var(--ct3)' }}>Đã bao gồm VAT</p>
        </div>
        <div className="text-right">
          <p className="text-[28px] font-black leading-none" style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>{fmt(total)}</p>
          {totalSavings > 0 && <p className="text-[12px] font-bold mt-1" style={{ color: 'var(--ok)' }}>Tiết kiệm {fmt(totalSavings)}</p>}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const onNavigate = useNav()
  const [selectedAddress, setSelectedAddress] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('vnpay')
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState('')

  const subtotal = ORDER_ITEMS.reduce((s, p) => s + p.price * p.qty, 0)
  const rawDiscount = VALID_CODES[promoCode] ?? null
  const promoDiscount = promoApplied && rawDiscount !== null
    ? (rawDiscount < 1 ? Math.round(subtotal * rawDiscount) : rawDiscount) : 0

  const handleApplyPromo = () => {
    if (VALID_CODES[promoCode] !== undefined) { setPromoApplied(true); setPromoError('') }
    else setPromoError('Mã không hợp lệ hoặc đã hết hạn')
  }

  return (
    <div className="flex-1 min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      {/* Dark header */}
      <div style={{ backgroundColor: 'var(--ink)', borderBottom: '1px solid var(--b1)' }} className="py-5">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--accent)' }}>Bước cuối</p>
          <h1 className="text-[18px] font-bold" style={{ color: 'var(--t1)', fontFamily: 'Syne, sans-serif' }}>Xác nhận đơn hàng</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Back + progress */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigate('cart')} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: 'var(--ct2)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ct1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ct2)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Quay lại giỏ hàng
          </button>
          {/* Progress */}
          <div className="flex items-center gap-2">
            {['Giỏ hàng', 'Xác nhận', 'Hoàn tất'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 flex items-center justify-center text-[12px] font-bold"
                    style={{ backgroundColor: i === 1 ? 'var(--accent)' : i < 1 ? 'var(--ct3)' : 'var(--cb)', color: i <= 1 ? 'white' : 'var(--ct3)', borderRadius: '3px' }}>
                    {i + 1}
                  </div>
                  <span className="text-[13px] font-semibold" style={{ color: i === 1 ? 'var(--accent)' : 'var(--ct3)' }}>{s}</span>
                </div>
                {i < 2 && <div className="w-8 h-[2px]" style={{ backgroundColor: 'var(--cb)' }} />}
              </div>
            ))}
          </div>
        </div>

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
              <p className="text-[13px] font-medium mt-2 flex items-center gap-1.5 px-1" style={{ color: 'var(--err)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {promoError}
              </p>
            )}
          </div>
          <PaymentSection selected={selectedPayment} onSelect={setSelectedPayment} />
          <PriceSummary paymentMethod={selectedPayment} promoDiscount={promoDiscount} promoCode={promoCode} />

          {/* Confirm CTA */}
          <button
            onClick={() => onNavigate('invoice')}
            className="w-full text-white font-bold text-[16px] py-4 transition-colors flex items-center justify-center gap-2.5"
            style={{ backgroundColor: 'var(--accent)', borderRadius: '4px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Xác nhận đặt hàng
          </button>

          <p className="text-[12px] text-center pb-4" style={{ color: 'var(--ct3)' }}>
            Bằng việc đặt hàng, bạn đồng ý với{' '}
            <span className="cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>Điều khoản dịch vụ</span>
            {' '}và{' '}
            <span className="cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  )
}
