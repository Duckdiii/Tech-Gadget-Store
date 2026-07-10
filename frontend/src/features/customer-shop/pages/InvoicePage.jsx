import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import { getToken } from '../../../context/AuthContext'
import { useInvoice } from '../hooks/useInvoice'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

import InvoiceDocument from '../components/InvoiceDocument'

/* ─── Order Success Page ─── */
export default function InvoicePage() { // hiển thị trang thông báo đặt hàng thành công và chi tiết hóa đơn
  const {
    orderId,
    invoice,
    showInvoice,
    setShowInvoice,
    visible,
    onNavigate,
    loading,
  } = useInvoice()

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
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-6">
            {/* Header info */}
            <div className="flex items-center justify-between px-7 py-5 bg-slate-50 border-b border-gray-150">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">MÃ ĐƠN HÀNG</p>
                <p className="text-base font-extrabold text-slate-800 mt-1">#{orderId.substring(0, 12).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">TỔNG THANH TOÁN</p>
                <p className="text-lg font-black mt-1" style={{ color: 'var(--accent)' }}>{fmt(invoice.totalAmount)}</p>
              </div>
            </div>

            {/* Meta rows */}
            <div className="px-7 py-5 grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Phương thức</p>
                <p className="font-bold text-gray-700 mt-1">{invoice.paymentMethod || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Thời gian đặt</p>
                <p className="font-semibold text-gray-700 mt-1">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleString('vi-VN') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Số lượng</p>
                <p className="font-semibold text-gray-700 mt-1">{itemsCount} sản phẩm</p>
              </div>
            </div>

            {/* Savings notice banner */}
            {totalSavings > 0 && (
              <div className="bg-[#E8420A]/5 border-t border-b border-[#E8420A]/10 px-7 py-3 flex items-center gap-2 text-xs font-bold text-[#E8420A]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                Bạn đã tiết kiệm được {fmt(totalSavings)} cho đơn hàng này!
              </div>
            )}

            {/* Actions bar inside card */}
            <div className="px-7 py-4 bg-slate-50/50 flex items-center justify-between">
              <button onClick={() => setShowInvoice(true)} className="text-xs font-bold px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer bg-white transition-colors">
                Xem hóa đơn chi tiết
              </button>
              <button onClick={() => onNavigate('myOrders')} className="text-xs font-bold px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer bg-white transition-colors">
                Quản lý đơn hàng
              </button>
            </div>
          </div>

          {/* ── Main store actions ── */}
          <div className="flex gap-4">
            <button onClick={() => onNavigate('home')} className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer">
              Quay lại trang chủ
            </button>
            <button onClick={() => onNavigate('list')} className="flex-1 text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 cursor-pointer"
              style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              Tiếp tục mua sắm
            </button>
          </div>

        </div>
      </div>

      {showInvoice && <InvoiceDocument orderId={orderId} invoice={invoice} onClose={() => setShowInvoice(false)} />}
    </div>
  )
}
