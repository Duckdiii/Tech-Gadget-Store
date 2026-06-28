import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

function SectionCard({ step, title, icon, children }) { // hiển thị một thẻ section với tiêu đề, biểu tượng và nội dung con
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

function ProductsSection({ items }) { // hiển thị danh sách sản phẩm trong đơn hàng, với khả năng mở rộng để xem tất cả sản phẩm
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? items : items.slice(0, 2)
  return (
    <SectionCard step="1" title="Sản phẩm đặt mua" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
    }>
      <div className="space-y-4">
        {shown.map((p, i) => (
          <div key={p.cartItemId}>
            <div className="flex items-start gap-4">
              <div className="w-16 h-14 flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: '8px' }}>
                <img src={`https://placehold.co/80x70/EEF1F9/96A3BC?text=${encodeURIComponent(p.productName || 'Product')}`} alt={p.productName} className="w-full h-full object-contain p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>TechStore</span>
                    <p className="text-[13.5px] font-bold leading-snug mt-0.5" style={{ color: 'var(--t1)' }}>{p.productName}</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{p.variantName}</p>
                    {p.bundleServices && p.bundleServices.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.bundleServices.map((b, bi) => (
                          <span key={bi} className="text-[10px] font-bold px-2 py-0.5"
                            style={{ color: 'var(--accent)', backgroundColor: 'rgba(232,66,10,0.06)', border: '1px solid rgba(232,66,10,0.15)', borderRadius: '4px' }}>
                            + {b.name} · {fmt(b.price)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[14.5px] font-bold" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(p.unitPrice)}</p>
                    <p className="text-[11px] mt-0.5 font-semibold" style={{ color: 'var(--t3)' }}>SL: {p.quantity}</p>
                  </div>
                </div>
              </div>
            </div>
            {i < shown.length - 1 && <div className="mt-4" style={{ borderTop: '1px solid var(--b1)' }} />}
          </div>
        ))}
      </div>
      {items.length > 2 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-4 w-full text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer" style={{ color: 'var(--accent)', border: 'none', backgroundColor: 'transparent' }}>
          {expanded ? 'Thu gọn' : `Xem thêm ${items.length - 2} sản phẩm`}
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
      )}
    </SectionCard>
  )
}

function AddressSection({ addresses, selected, onSelect }) { // hiển thị danh sách địa chỉ giao hàng, cho phép chọn một địa chỉ
  return (
    <SectionCard step="2" title="Địa chỉ giao hàng" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    }>
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <p className="text-xs text-gray-500 py-2">Bạn chưa có địa chỉ giao hàng nào. Vui lòng thêm địa chỉ mới.</p>
        ) : (
          addresses.map(addr => (
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
                  <span className="text-[13.5px] font-extrabold" style={{ color: 'var(--t1)' }}>Người nhận</span>
                </div>
                <p className="text-[12.5px] mt-1.5 font-medium" style={{ color: 'var(--t2)' }}>{addr.street}</p>
                <p className="text-[11.5px] mt-0.5" style={{ color: 'var(--t3)' }}>{`${addr.ward}, ${addr.district}, ${addr.province}`}</p>
              </div>
              {selected === addr.id && <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </label>
          ))
        )}
      </div>
    </SectionCard>
  )
}

function PaymentSection({ methods, selected, onSelect }) {
  // Map color styling for visual cues
  const getMethodColor = (name) => {
    const lower = name.toLowerCase()
    if (lower.includes('momo')) return '#be185d'
    if (lower.includes('vnpay')) return '#1d4ed8'
    return '#475569'
  }

  return (
    <SectionCard step="3" title="Phương thức thanh toán" icon={
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    }>
      <div className="space-y-3">
        {methods.map(m => (
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
                <span className="text-[13.5px] font-extrabold" style={{ color: 'var(--t1)' }}>{m.name}</span>
                {m.serviceFee > 0 && <span className="text-[10px] font-bold px-2 py-0.5 text-white" style={{ backgroundColor: 'var(--err)', borderRadius: '4px' }}>Phí +{fmt(m.serviceFee)}</span>}
              </div>
              <p className="text-[11.5px] mt-1" style={{ color: 'var(--t3)' }}>{m.description}</p>
            </div>
            <div className="w-12 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 px-1 text-center" style={{ backgroundColor: getMethodColor(m.name) }}>
              {m.type}
            </div>
          </label>
        ))}
      </div>
    </SectionCard>
  )
}

function OrderSummaryCard({ summary, onOrderSubmit, submitting }) {
  if (!summary) return null

  return (
    <div className="sticky top-6 overflow-hidden text-white" style={{ backgroundColor: 'var(--ink)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
      <div className="px-6 py-4.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-[15px] font-extrabold uppercase tracking-wide" style={{ fontFamily: 'Be Vietnam Pro, sans-serif' }}>Chi tiết thanh toán</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2 text-[12.5px]">
          <div className="flex justify-between">
            <span style={{ color: 'var(--t2)' }}>Tổng tiền hàng</span>
            <span style={{ color: 'var(--t1)' }}>{fmt(summary.subtotal)}</span>
          </div>
          {summary.discount > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--ok)' }}>Khuyến mãi & Hội viên ({summary.membershipTier})</span>
              <span className="font-bold" style={{ color: 'var(--ok)' }}>−{fmt(summary.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: 'var(--t2)' }}>Thuế VAT (10%)</span>
            <span style={{ color: 'var(--t1)' }}>{fmt(summary.vat)}</span>
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
          <p className="text-right text-3xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Be Vietnam Pro, sans-serif' }}>{fmt(summary.total)}</p>
        </div>

        <button
          onClick={onOrderSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 text-white font-extrabold py-4 px-6 text-sm transition-all duration-200 cursor-pointer border-none disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent-h), var(--accent))', borderRadius: '10px', boxShadow: '0 4px 12px rgba(232,66,10,0.2)' }}
        >
          {submitting ? 'Đang xử lý...' : 'Xác nhận Đặt hàng'}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </button>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const onNavigate = useNav()
  const location = useLocation()
  const cartItemIds = location.state?.cartItemIds || []

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [summary, setSummary] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState(null)
  const [paymentMethodId, setPaymentMethodId] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (cartItemIds.length === 0) {
        onNavigate('cart')
        return
      }

      try {
        setLoading(true)
        const summaryData = await apiFetch(`/api/customer/payment/checkout-summary?cartItemIds=${cartItemIds.join(',')}`)
        setSummary(summaryData)

        if (summaryData.availablePaymentMethods && summaryData.availablePaymentMethods.length > 0) {
          setPaymentMethodId(summaryData.availablePaymentMethods[0].id)
        }

        const addressData = await apiFetch('/api/customer/addresses')
        setAddresses(addressData)
        if (addressData && addressData.length > 0) {
          setAddressId(addressData[0].id)
        }
      } catch (e) {
        console.error("Lỗi tải thông tin thanh toán:", e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleOrderSubmit = async () => {
    if (!addressId) {
      alert("Vui lòng chọn địa chỉ giao nhận hàng")
      return
    }
    if (!paymentMethodId) {
      alert("Vui lòng chọn phương thức thanh toán")
      return
    }

    setSubmitting(true)
    try {
      const confirmData = await apiFetch('/api/customer/payment/confirm', {
        method: 'POST',
        body: JSON.stringify({
          cartItemIds: cartItemIds,
          addressId: addressId,
          paymentMethodId: paymentMethodId,
          orderInfo: `Thanh toan mua san pham tai TechStore`,
          clientIp: '127.0.0.1'
        })
      })

      if (confirmData.status === 'SUCCESS') {
        onNavigate('invoice', { search: `?orderId=${confirmData.orderId}&success=true` })
      } else if (confirmData.status === 'PENDING' && confirmData.redirectUrl) {
        // Online payment gateway redirect
        window.location.href = confirmData.redirectUrl
      } else {
        alert(confirmData.message || "Đặt hàng thất bại")
      }
    } catch (e) {
      console.error("Lỗi xác nhận đơn hàng:", e)
      alert("Đã xảy ra lỗi khi xử lý đơn hàng")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
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
            {summary && <ProductsSection items={summary.items} />}
            <AddressSection addresses={addresses} selected={addressId} onSelect={setAddressId} />
            {summary && (
              <PaymentSection
                methods={summary.availablePaymentMethods}
                selected={paymentMethodId}
                onSelect={setPaymentMethodId}
              />
            )}
          </div>

          <div className="w-[360px] shrink-0">
            <OrderSummaryCard
              summary={summary}
              onOrderSubmit={handleOrderSubmit}
              submitting={submitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
