
function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

export function SectionCard({ step, title, icon, children }) {
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

export function ProductsSection({ items }) {
  return (
    <SectionCard step="1" title="Sản phẩm mua" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}>
      <div className="divide-y divide-slate-100">
        {items && items.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--t1)' }}>{item.productName}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--t3)' }}>{item.variantName} x{item.quantity}</p>
              {item.bundleServices && item.bundleServices.map((b, bi) => (
                <p key={bi} className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>+ {b.name} ({fmt(b.price)})</p>
              ))}
            </div>
            <span className="text-sm font-bold text-right shrink-0 pr-1" style={{ color: 'var(--t2)' }}>{fmt(item.totalPrice)}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export function AddressSection({ addresses, selected, onSelect }) {
  return (
    <SectionCard step="2" title="Địa chỉ giao hàng" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}>
      {addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} onClick={() => onSelect(addr.id)} className="p-4 relative transition-all duration-200 cursor-pointer flex flex-col justify-between"
              style={{
                border: selected === addr.id ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
                backgroundColor: selected === addr.id ? 'transparent' : 'var(--card)',
                borderRadius: '12px'
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black" style={{ color: selected === addr.id ? 'var(--accent)' : 'var(--t2)' }}>{addr.name}</span>
                  {addr.isDefault && <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full text-white bg-slate-400">Mặc định</span>}
                </div>
                <p className="text-[11.5px] mt-1" style={{ color: 'var(--t3)' }}>{addr.phone}</p>
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--t2)' }}>{addr.street}, {addr.ward}, {addr.district}, {addr.province}</p>
              </div>
              {selected === addr.id && (
                <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: 'var(--accent)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-sm" style={{ color: 'var(--t3)' }}>Chưa có địa chỉ nào được thiết lập.</p>
        </div>
      )}
    </SectionCard>
  )
}

export function PaymentSection({ methods, selected, onSelect }) {
  return (
    <SectionCard step="3" title="Phương thức thanh toán" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}>
      <div className="space-y-2.5">
        {methods && methods.map(method => (
          <label key={method.id} onClick={() => onSelect(method.id)}
            className="flex items-center justify-between p-4 cursor-pointer transition-colors"
            style={{
              border: selected === method.id ? '2px solid var(--accent)' : '1.5px solid var(--b1)',
              borderRadius: '12px',
              backgroundColor: selected === method.id ? 'var(--s1)' : 'transparent'
            }}
          >
            <div className="flex items-center gap-3">
              <input type="radio" checked={selected === method.id} onChange={() => {}} className="w-4 h-4 cursor-pointer accent-[var(--accent)]" />
              <div>
                <p className="text-xs font-extrabold" style={{ color: selected === method.id ? 'var(--accent)' : 'var(--t1)' }}>{method.name}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--t3)' }}>{method.description || 'Thanh toán trực tuyến an toàn'}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

export function OrderSummaryCard({ summary, onOrderSubmit, submitting }) {
  if (!summary) return null

  return (
    <div className="sticky top-6 overflow-hidden" style={{ backgroundColor: 'var(--ink)', borderRadius: '16px', border: '1px solid var(--b1)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div className="px-6 py-4.5" style={{ borderBottom: '1px solid var(--b1)' }}>
        <h2 className="text-[15px] font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Be Vietnam Pro, sans-serif', color: 'var(--t1)' }}>Tóm tắt đơn hàng</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--t2)' }}>Tổng tiền hàng:</span>
          <span className="font-semibold" style={{ color: 'var(--t1)' }}>{fmt(summary.totalPrice)}</span>
        </div>
        {summary.discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--ok)' }}>Khấu trừ giảm giá:</span>
            <span className="font-extrabold" style={{ color: 'var(--ok)' }}>−{fmt(summary.discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--t2)' }}>Thuế (VAT 10%):</span>
          <span className="font-semibold" style={{ color: 'var(--t1)' }}>{fmt(summary.vatAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: 'var(--t2)' }}>Phí vận chuyển:</span>
          <span className="font-bold" style={{ color: 'var(--ok)' }}>Miễn phí</span>
        </div>

        <div style={{ borderTop: '1px dashed var(--b2)', margin: '6px 0' }} />

        <div>
          <span className="text-xs font-semibold" style={{ color: 'var(--t2)' }}>Tổng thanh toán</span>
          <p className="text-[28px] font-black mt-1" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(summary.totalAmount)}</p>
        </div>

        <button
          onClick={onOrderSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 text-white font-extrabold text-[14px] py-4 transition-all duration-200 cursor-pointer border-none disabled:opacity-50 mt-4"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '12px', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          {!submitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>}
        </button>
      </div>
    </div>
  )
}
