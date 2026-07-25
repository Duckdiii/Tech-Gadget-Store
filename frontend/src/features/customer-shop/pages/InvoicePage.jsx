import StoreNavbar from '../../../components/StoreNavbar'
import { useInvoice } from '../hooks/useInvoice'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

import InvoiceDocument from '../components/InvoiceDocument'

import { useState } from 'react'
import { getToken } from '../../../utils/authToken'
import { shopService } from '../services/shopService'

/* ─── Order Result Page ─── */
export default function InvoicePage() { // hiển thị trang thông báo đặt hàng/thanh toán thành công/thất bại và chi tiết hóa đơn
  const {
    orderId,
    invoice,
    showInvoice,
    setShowInvoice,
    visible,
    onNavigate,
    loading,
    success,
  } = useInvoice()

  const [retrying, setRetrying] = useState(false)

  const downloadPdf = async () => {
    try {
      const token = getToken()
      const res = await fetch(`/api/customer/invoices/order/${orderId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${orderId.substring(0, 8)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Không tải được file PDF: ' + e.message)
    }
  }

  const handleRetryPayment = async () => {
    setRetrying(true)
    try {
      const isMomo = invoice.paymentMethod?.toLowerCase().includes('momo')
      const endpoint = isMomo ? '/api/payment/momo/create' : '/api/payment/vnpay/create'
      
      const payload = {
        orderId: orderId,
        amount: invoice.finalAmount,
        orderInfo: `Thanh toán lại đơn hàng #${orderId.substring(0, 8).toUpperCase()}`
      }
      
      const res = await shopService.retryPayment(endpoint, payload)
      const redirectUrl = res.payUrl || res.paymentUrl
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        alert('Không tạo được liên kết thanh toán mới')
      }
    } catch (e) {
      console.error('Lỗi thanh toán lại:', e)
      alert('Không thể kết nối thanh toán lại: ' + (e.response?.data?.message || e.message))
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-dvh">
        <StoreNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 min-h-dvh">
        <StoreNavbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-lg font-bold text-gray-500">Không tìm thấy thông tin đơn hàng này</p>
          <button aria-label="Thao tác" type="button" onClick={() => onNavigate('home')} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-lg">Về trang chủ</button>
        </div>
      </div>
    )
  }

  const itemsCount = (invoice.items || []).reduce((s, p) => s + p.quantity, 0)
  const totalSavings = invoice.discountAmount || 0

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-dvh">
      <StoreNavbar />

      <div className="flex-1 flex items-start justify-center px-6 py-10">
        <div className="w-full max-w-2xl text-gray-800">

          {/* ── Success/Failure hero ── */}
          {success ? (
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
          ) : (
            <div className={`flex flex-col items-center text-center mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-full bg-rose-100 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-black text-rose-600 mb-2">Thanh toán thất bại!</h1>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-md">
                Đã xảy ra sự cố trong quá trình giao dịch qua cổng thanh toán trực tuyến. Đơn hàng của bạn đã được lưu ở trạng thái <strong>Chờ thanh toán</strong>.
              </p>
            </div>
          )}

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
                <p className="text-lg font-black mt-1" style={{ color: 'var(--accent)' }}>{fmt(invoice.finalAmount)}</p>
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
                <p className="font-semibold text-gray-700 mt-1">
                  {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString('vi-VN') : invoice.createdAt ? new Date(invoice.createdAt).toLocaleString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Số lượng</p>
                <p className="font-semibold text-gray-700 mt-1">{itemsCount} sản phẩm</p>
              </div>
            </div>

            {/* Savings notice banner (Only show on success) */}
            {success && totalSavings > 0 && (
              <div className="bg-[#E8420A]/5 border-t border-b border-[#E8420A]/10 px-7 py-3 flex items-center gap-2 text-xs font-bold text-[#E8420A]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                Bạn đã tiết kiệm được {fmt(totalSavings)} cho đơn hàng này!
              </div>
            )}

            {/* Warning notice banner (Only show on failure) */}
            {!success && (
              <div className="bg-rose-50 border-t border-b border-rose-100 px-7 py-3 flex items-center gap-2 text-xs font-bold text-rose-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Đơn hàng chưa được thanh toán. Vui lòng thử thanh toán lại bên dưới.
              </div>
            )}

            {/* Actions bar inside card */}
            <div className="px-7 py-4 bg-slate-50/50 flex items-center justify-end">
              <button aria-label="Thao tác" type="button" onClick={() => onNavigate('myOrders')} className="text-xs font-bold px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer bg-white transition-colors">
                Quản lý đơn hàng
              </button>
            </div>
          </div>

          {/* ── Main actions ── */}
          {success ? (
            <div className="space-y-6">
              <div className="flex gap-4">
                <button aria-label="Thao tác" type="button" onClick={() => setShowInvoice(true)} className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Xem hóa đơn
                </button>
                <button aria-label="Thao tác" type="button" onClick={downloadPdf} className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  In hóa đơn
                </button>
                <button aria-label="Thao tác" type="button" onClick={() => onNavigate('home')} className="flex-1 text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Về Trang Chủ
                </button>
              </div>
              
              <div className="flex justify-center gap-6 text-xs font-semibold text-slate-500">
                <button aria-label="Thao tác" type="button" onClick={() => onNavigate('myOrders')} className="hover:text-slate-800 cursor-pointer underline bg-transparent border-none">
                  Quản lý đơn hàng của tôi
                </button>
                <span>•</span>
                <button aria-label="Thao tác" type="button" onClick={() => onNavigate('list')} className="hover:text-slate-800 cursor-pointer underline bg-transparent border-none">
                  Tiếp tục mua sắm sản phẩm khác
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <button aria-label="Thao tác" type="button" onClick={() => onNavigate('home')} className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer">
                Về trang chủ
              </button>
              <button aria-label="Quay lại" type="button" onClick={handleRetryPayment} disabled={retrying} className="flex-[2] text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--accent)', boxShadow: '0 4px 12px rgba(232, 66, 10, 0.18)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
              >
                {retrying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Đang kết nối cổng thanh toán...
                  </>
                ) : (
                  `Thử thanh toán lại (${invoice.paymentMethod || 'Online'})`
                )}
              </button>
            </div>
          )}

        </div>
      </div>

      {showInvoice && <InvoiceDocument orderId={orderId} invoice={invoice} onClose={() => setShowInvoice(false)} />}
    </div>
  )
}
