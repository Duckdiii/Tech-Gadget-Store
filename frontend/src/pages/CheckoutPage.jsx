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
  { id: 'cod',   label: 'Tiền mặt khi nhận hàng', desc: 'Thanh toán khi nhận được hàng',             bonus: 0,      color: '#475569' },
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
    <div className="overflow-hidden" style={{ backgroundColor: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.02)' }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--b1)', backgroundColor: 'var(--s1)' }}>
        <div className="w-8 h-8 flex items-center justify-center text-white text-[13px] font-black shrink-0" style={{ backgroundColor: 'var(--accent)', borderRadius: '8px' }}>{step}</div>
        <span style={{ color: 'var(--accent)' }}>{icon}</span>
        <h2 className="text-[14.5px] font-black" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{title}</h2>
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
              <div className="w-16 h-14 flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '8px' }}>
                <img src={p.image} alt={p.name} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>{p.brand}</span>
                    <p className="text-[13.5px] font-bold leading-snug mt-0.5" style={{ color: 'var(--t1)' }}>{p.name}</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{p.variant}</p>
                    {p.bundles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.bundles.map((b, bi) => (
                          <span key={bi} className="text-[10px] font-bold px-2 py-0.5"
                            style={{ color: 'var(--accent)', backgroundColor: 'rgba(232,66,10,0.06)', border: '1px solid rgba(232,66,10,0.15)', borderRadius: '4px' }}>
                            + {b.label} · {fmt(b.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14.5px] font-bold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(p.price)}</p>
                    {p.originalPrice && <p className="text-[11px] line-through" style={{ color: 'var(--t3)' }}>{fmt(p.originalPrice)}</p>}
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: 'var(--t3)' }}>SL: {p.qty}</p>
                  </div>
                </div>
              </div>
            </div>
            {i < shown.length - 1 && <div className="mt-4" style={{ borderTop: '1px solid var(--b1)' }} />}
          </div>
        ))}
      </div>
      {ORDER_ITEMS.length > 2 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-4 w-full text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer" style={{ color: 'var(--accent)', border: 'none', backgroundColor: 'transparent' }}>
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
            className="flex items-start gap-3.5 p-4 cursor-pointer transition-all"
            style={{
              backgroundColor: selected === addr.id ? 'rgba(232,66,10,0.03)' : 'var(--card)',
              border: selected === addr.id ? '2px solid var(--accent)' : '1px solid var(--b1)',
              borderRadius: '12px',
            }}
          >
            <div className="pt-0.5">
              <input type="radio" name="address" checked={selected === addr.id} readOnly className="w-4 h-4 accent-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13.5px] font-extrabold" style={{ color: 'var(--t1)' }}>{addr.name}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>{addr.phone}</span>
                {addr.isDefault && <span className="text-[10px] font-bold px-2 py-0.5" style={{ color: 'var(--accent)', backgroundColor: 'rgba(232,66,10,0.06)', border: '1px solid rgba(232,66,10,0.15)', borderRadius: '4px' }}>Mặc định</span>}
              </div>
              <p className="text-[12.5px] mt-1.5 font-medium" style={{ color: 'var(--t2)' }}>{addr.line1}</p>
              <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{addr.line2}</p>
            </div>
            {selected === addr.id && <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </label>
        ))}
        <button
          className="w-full py-3.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-transparent"
          style={{ border: '2px dashed var(--b1)', borderRadius: '12px', color: 'var(--t3)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b1)'; e.currentTarget.style.color = 'var(--t3)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Thêm địa chỉ giao nhận mới
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
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: 'var(--ok)', borderRadius: '8px' }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-[12.5px] font-bold" style={{ color: '#15803d' }}>Mã <span className="uppercase">{code}</span> đã áp dụng thành công</p>
              <p className="text-[11.5px] font-medium" style={{ color: '#166534' }}>Giảm trừ {fmt(discount)}</p>
            </div>
          </div>
          <button onClick={onRemove} className="text-xs font-bold cursor-pointer transition-opacity hover:opacity-75 bg-transparent border-none" style={{ color: 'var(--err)' }}>Gỡ bỏ</button>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <input
            type="text"
            placeholder="Nhập mã KM (Ví dụ: TECH10, VNPAY500, SAVE5)"
            value={code}
            onChange={e => onCodeChange(e.target.value.toUpperCase())}
            className="flex-1 px-3 py-2.5 text-[12px] uppercase rounded-lg border border-[var(--b1)] focus:outline-none focus:border-[var(--accent)] bg-[var(--s1)]"
          />
          <button
            onClick={onApply}
            className="px-5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer border-none"
            style={{ backgroundColor: 'var(--t1)', borderRadius: '8px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--t1)'}
          >
            Áp dụng
          </button>
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
            className="flex items-center gap-3.5 p-4 cursor-pointer transition-all"
            style={{
              backgroundColor: selected === m.id ? 'rgba(232,66,10,0.03)' : 'var(--card)',
              border: selected === m.id ? '2px solid var(--accent)' : '1px solid var(--b1)',
              borderRadius: '12px',
            }}
          >
            <div>
              <input type="radio" name="payment" checked={selected === m.id} readOnly className="w-4 h-4 accent-[var(--accent)]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-extrabold" style={{ color: 'var(--t1)' }}>{m.label}</span>
                {m.bonus > 0 && <span className="text-[10px] font-bold px-2 py-0.5 text-white" style={{ backgroundColor: '#10b981', borderRadius: '4px' }}>Giảm {fmt(m.bonus)}</span>}
              </div>
              <p className="text-[11.5px] mt-1" style={{ color: 'var(--t3)' }}>{m.desc}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0" style={{ backgroundColor: m.color }}>
              {m.id.toUpperCase()}
            </div>
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

function OrderSummaryCard({ items, discount, paymentMethod, appliedCode, onOrderSubmit }) {
  const productSubtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const serviceFee = items.reduce((s, i) => s + i.bundles.reduce((bs, b) => bs + b.price, 0) * i.qty, 0)
  const subtotal = productSubtotal + serviceFee

  const methodBonus = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.bonus ?? 0
  const totalDiscount = discount + methodBonus

  const vat = Math.round((subtotal - totalDiscount) * VAT_RATE)
  const grandTotal = Math.max(0, subtotal - totalDiscount + vat)

  return (
    <div className="sticky top-6 overflow-hidden text-white" style={{ backgroundColor: 'var(--ink)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
      <div className="px-6 py-4.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-[15px] font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>Chi tiết thanh toán</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2 text-[12.5px]">
          <div className="flex justify-between">
            <span style={{ color: 'var(--t2)' }}>Tạm tính sản phẩm</span>
            <span style={{ color: 'var(--t1)' }}>{fmt(productSubtotal)}</span>
          </div>
          {serviceFee > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--t2)' }}>Dịch vụ kèm theo</span>
              <span style={{ color: 'var(--t1)' }}>{fmt(serviceFee)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--ok)' }}>Khuyến mãi ({appliedCode})</span>
              <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(discount)}</span>
            </div>
          )}
          {methodBonus > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--ok)' }}>Ưu đãi thanh toán</span>
              <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(methodBonus)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: 'var(--t2)' }}>Thuế VAT (10%)</span>
            <span style={{ color: 'var(--t1)' }}>{fmt(vat)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--t2)' }}>Phí vận chuyển</span>
            <span className="font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.12)', margin: '6px 0' }} />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold" style={{ color: 'var(--t2)' }}>Tổng tiền thanh toán</span>
            <span className="text-[11px]" style={{ color: 'var(--t3)' }}>(Đã bao gồm VAT)</span>
          </div>
          <p className="text-right text-3xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(grandTotal)}</p>
          {totalDiscount > 0 && (
            <p className="text-right text-[11px] font-bold mt-1" style={{ color: 'var(--ok)' }}>Tiết kiệm tổng cộng {fmt(totalDiscount)}</p>
          )}
        </div>

        <button
          onClick={onOrderSubmit}
          className="w-full flex items-center justify-center gap-2 text-white font-extrabold py-4 px-6 text-sm transition-all duration-200 cursor-pointer border-none"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.2)' }}
        >
          Xác nhận Đặt hàng
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const onNavigate = useNav()
  const [addressId, setAddressId] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('momo')
  const [promoCode, setPromoCode] = useState('')
  const [appliedCode, setAppliedCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [codeError, setCodeError] = useState('')

  const handleApplyPromo = () => {
    setCodeError('')
    if (!promoCode.trim()) return
    const rate = VALID_CODES[promoCode.trim()]
    if (rate === undefined) {
      setCodeError('Mã khuyến mãi không hợp lệ.')
      return
    }

    const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0)
    if (rate < 1) {
      setDiscount(Math.round(subtotal * rate))
    } else {
      setDiscount(rate)
    }
    setAppliedCode(promoCode.trim())
  }

  const handleRemovePromo = () => {
    setAppliedCode('')
    setDiscount(0)
    setPromoCode('')
    setCodeError('')
  }

  const handleOrderSubmit = () => {
    onNavigate('invoice')
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ backgroundColor: 'var(--page)' }}>
      <StoreNavbar />

      <div className="max-w-screen-2xl mx-auto w-full px-8 py-8">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-black" style={{ color: 'var(--t1)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>Thanh toán đơn hàng</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--t3)' }}>Vui lòng hoàn tất thông tin giao nhận hàng</p>
        </div>

        <div className="flex gap-7 items-start">
          <div className="flex-1 space-y-6 min-w-0">
            <ProductsSection />
            <AddressSection selected={addressId} onSelect={setAddressId} />
            <PromoSection
              applied={!!appliedCode}
              code={promoCode}
              onCodeChange={setPromoCode}
              onApply={handleApplyPromo}
              onRemove={handleRemovePromo}
              discount={discount}
            />
            {codeError && (
              <p className="text-xs font-semibold px-4 py-2" style={{ color: 'var(--err)', backgroundColor: 'rgba(239,68,68,0.04)', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.15)' }}>
                {codeError}
              </p>
            )}
            <PaymentSection selected={paymentMethod} onSelect={setPaymentMethod} />
          </div>

          <div className="w-[360px] shrink-0">
            <OrderSummaryCard
              items={ORDER_ITEMS}
              discount={discount}
              paymentMethod={paymentMethod}
              appliedCode={appliedCode}
              onOrderSubmit={handleOrderSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
