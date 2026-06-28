import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useNav } from '../hooks/useNav'
import StoreNavbar from '../components/StoreNavbar'
import { apiFetch } from '../services/api'
import { getToken } from '../context/AuthContext'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

/* ─── Invoice Modal Content ─── */
function InvoiceDocument({ orderId, invoice, onClose }) {// hiển thị nội dung hóa đơn trong modal
  const downloadPdf = async () => {
    try {
      const token = getToken()
      const res = await fetch(`/api/customer/invoices/order/${orderId}/pdf`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (!res.ok) throw new Error("Lỗi tải PDF")
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${orderId}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      alert("Không thể tải PDF hóa đơn: " + e.message)
    }
  }

  const items = invoice.items || []

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-auto text-gray-800">

        {/* Modal top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Hóa đơn điện tử
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={downloadPdf} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer bg-white border-none">
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
                {[
                  ['Mã hóa đơn', invoice.id ? invoice.id.substring(0, 13).toUpperCase() : 'N/A'],
                  ['Mã đơn hàng', orderId ? orderId.substring(0, 13).toUpperCase() : 'N/A'],
                  ['Ngày xuất', invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString('vi-VN') : 'N/A']
                ].map(([l, v]) => (
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
              <p className="text-[14px] font-bold text-gray-900">{invoice.customerName || 'Khách hàng'}</p>
              <p className="text-[13px] text-gray-600 mt-0.5">{invoice.customerPhone || 'N/A'}</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Thanh toán: {invoice.paymentMethod || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Địa chỉ giao hàng</p>
              <p className="text-[13px] text-gray-700">{invoice.shippingAddress || 'N/A'}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="mb-4">
            <div className="grid grid-cols-[2rem_1fr_4rem_7rem_7rem] pb-2.5 border-b border-gray-200">
              {['#', 'Sản phẩm', 'SL', 'Đơn giá', 'Thành tiền'].map(h => (
                <span key={h} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider last:text-right">{h}</span>
              ))}
            </div>
            {items.map((item, i) => (
              <div key={i} className={`grid grid-cols-[2rem_1fr_4rem_7rem_7rem] py-3.5 ${i < items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className="text-[12px] text-gray-400 font-medium">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-[13px] font-bold text-gray-900">{item.productName}</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">{item.variantName}</p>
                  {item.bundleServices && item.bundleServices.map((b, bi) => (
                    <p key={bi} className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>+ {b}</p>
                  ))}
                </div>
                <span className="text-[13px] text-gray-700 text-center">{item.quantity}</span>
                <span className="text-[13px] text-gray-700 text-right">{fmt(item.unitPrice)}</span>
                <span className="text-[13px] font-bold text-gray-900 text-right">{fmt(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Tạm tính</span>
                <span className="font-semibold text-gray-700">{fmt(invoice.originalAmount)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-600">Khấu trừ giảm giá</span>
                  <span className="font-bold text-green-600">−{fmt(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className="font-bold text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">VAT (10%)</span>
                <span className="font-semibold text-gray-600">+{fmt(invoice.vatAmount)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between items-end">
                <div>
                  <span className="text-[14px] font-bold text-gray-800">Tổng cộng</span>
                  <p className="text-[11px] text-gray-400">Đã bao gồm VAT</p>
                </div>
                <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>{fmt(invoice.finalAmount)}</span>
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
export default function InvoicePage() { // hiển thị trang thông báo đặt hàng thành công và chi tiết hóa đơn
  const onNavigate = useNav()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showInvoice, setShowInvoice] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const loadInvoice = async () => {
      if (!orderId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const data = await apiFetch(`/api/customer/invoices/order/${orderId}`)
        setInvoice(data)
        setVisible(true)
      } catch (e) {
        console.error("Lỗi tải hóa đơn:", e)
      } finally {
        setLoading(false)
      }
    }
    loadInvoice()
  }, [orderId])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <StoreNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-gray-500">Không tìm thấy thông tin đơn hàng này</p>
          <button onClick={() => onNavigate('home')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Về trang chủ</button>
        </div>
      </div>
    )
  }

  const itemsCount = (invoice.items || []).reduce((s, p) => s + p.quantity, 0)
  const totalSavings = invoice.discountAmount || 0

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
      <StoreNavbar />

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl text-gray-800">

          {/* ── Success hero ── */}
          <div className={`flex flex-col items-center text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
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
                <p className="text-white text-xl font-black mt-0.5">{orderId ? orderId.substring(0, 13).toUpperCase() : 'N/A'}</p>
              </div>
              <div className="text-right">
                <p className="text-green-100 text-[12px]">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
                <span className="inline-block mt-1 bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                  Đã xác nhận
                </span>
              </div>
            </div>

            {/* Payment result */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              {[
                { label: 'Tổng thanh toán', value: fmt(invoice.finalAmount), highlight: true },
                { label: 'Phương thức', value: invoice.paymentMethod || 'N/A' },
                { label: 'Khấu trừ tiết kiệm', value: fmt(totalSavings), green: true },
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
                <p className="text-[14px] font-semibold text-gray-800">{invoice.customerName || 'Khách hàng'} · {invoice.customerPhone || 'N/A'}</p>
                <p className="text-[13px] text-gray-500 mt-0.5">{invoice.shippingAddress || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* ── Items summary ── */}
          <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="px-6 py-4 border-b border-gray-50">
              <p className="text-[13px] font-bold text-gray-700">Sản phẩm đã đặt ({itemsCount} sản phẩm)</p>
            </div>
            <div className="divide-y divide-gray-50">
              {(invoice.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-14 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                    <img src={`https://placehold.co/80x70/EEF1F9/96A3BC?text=${encodeURIComponent(item.productName || 'Product')}`} alt={item.productName} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{item.variantName} · SL: {item.quantity}</p>
                    {item.bundleServices && item.bundleServices.length > 0 && (
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--accent)' }}>{item.bundleServices.join(', ')}</p>
                    )}
                  </div>
                  <p className="text-[14px] font-bold text-gray-800 shrink-0">{fmt(item.totalPrice)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-[450ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <button
              onClick={() => setShowInvoice(true)}
              className="flex-1 flex items-center justify-center gap-2 font-bold text-[14px] py-3.5 rounded-xl transition-all cursor-pointer bg-white"
              style={{ border: '2px solid var(--accent)', color: 'var(--accent)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Xem hóa đơn chi tiết
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold text-[14px] py-3.5 rounded-xl transition-all cursor-pointer border-none"
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
            <span className="hover:underline cursor-pointer font-bold animate-none" style={{ color: 'var(--accent)' }}>Liên hệ hỗ trợ</span>
            {' '}· Hotline: <span className="font-semibold text-gray-600">1800 1234</span>
          </p>
        </div>
      </div>

      {/* Invoice modal */}
      {showInvoice && <InvoiceDocument orderId={orderId} invoice={invoice} onClose={() => setShowInvoice(false)} />}
    </div>
  )
}
