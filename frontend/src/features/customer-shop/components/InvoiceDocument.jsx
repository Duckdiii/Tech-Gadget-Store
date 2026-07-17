import { getToken } from '../../../utils/authToken'

function fmt(n) { return (n || 0).toLocaleString('vi-VN') + ' đ' }

export default function InvoiceDocument({ orderId, invoice, onClose }) {
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
              <p className="text-slate-600">Ngày xuất: <span className="font-semibold text-slate-800">{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString('vi-VN') : invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span></p>
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
                <span className="font-semibold">{fmt(invoice.originalAmount)}</span>
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
                <span style={{ color: 'var(--accent)' }}>{fmt(invoice.finalAmount)}</span>
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
