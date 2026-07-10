import { useNav } from '../../../hooks/useNav'
import StoreNavbar from '../../../components/StoreNavbar'
import { getToken } from '../../../context/AuthContext'
import { useInvoice } from '../hooks/useInvoice'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

/* ─── Invoice Modal Content ─── */
function InvoiceDocument({ orderId, invoice, onClose }) { // hiển thị nội dung hóa đơn trong modal
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

  const items = invoice.items || []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-fade-in">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <span className="text-sm font-bold text-slate-800">Chi tiết hóa đơn mua hàng</span>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-500 hover:text-slate-800 border-none bg-transparent">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-6 space-y-6 flex-1 text-gray-800">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>TECHSTORE</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">HÓA ĐƠN</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">#{orderId.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Khách hàng</p>
              <p className="font-bold text-slate-800">{invoice.customerName}</p>
              <p className="text-slate-500 mt-1">{invoice.customerPhone}</p>
              <p className="text-slate-500">{invoice.customerEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Thông tin đơn hàng</p>
              <p className="text-slate-600">Ngày xuất: <span className="font-semibold text-slate-800">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
              <p className="text-slate-600 mt-0.5">Thanh toán: <span className="font-semibold text-slate-800">{invoice.paymentMethod || 'N/A'}</span></p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-150 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_60px_110px_110px] bg-slate-50 px-4 py-2.5 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Sản phẩm</span>
              <span className="text-center">SL</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-right">Thành tiền</span>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[1fr_60px_110px_110px] px-4 py-3.5 items-center text-sm">
                  <div className="flex flex-col pr-2">
                    <span className="font-semibold text-slate-800">{item.productName}</span>
                    {item.variantInfo && <span className="text-[11px] text-slate-400 mt-0.5">{item.variantInfo}</span>}
                  </div>
                  <span className="text-center font-medium text-slate-500">{item.quantity}</span>
                  <span className="text-right font-medium text-slate-600">{fmt(item.unitPrice)}</span>
                  <span className="text-right font-bold text-slate-800">{fmt(item.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary pricing */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Tạm tính:</span>
                <span className="font-semibold">{fmt(invoice.subTotal)}</span>
              </div>
              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá:</span>
                  <span className="font-semibold">-{fmt(invoice.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Thuế (VAT 10%):</span>
                <span className="font-semibold">{fmt(invoice.vatAmount)}</span>
              </div>
              <div className="border-t border-slate-150 my-2" />
              <div className="flex justify-between text-base font-extrabold text-slate-900">
                <span>Tổng cộng:</span>
                <span style={{ color: 'var(--accent)' }}>{fmt(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
          <button onClick={onClose} className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer">
            Đóng
          </button>
          <button onClick={downloadPdf} className="flex items-center gap-1.5 text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'var(--accent)', boxShadow: '0 2px 8px rgba(232, 66, 10, 0.15)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-d)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Tải PDF
          </button>
        </div>
      </div>
    </div>
  )
}

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
