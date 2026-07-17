import { useState, useEffect } from 'react'
import { apiFetch } from '../../../services/api'
import { getToken } from '../../../utils/authToken'
import PayIcon from './PayIcon'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + ' đ'
}

export default function OrderDetailModal({ orderId, onClose }) {
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiFetch(`/api/customer/invoices/order/${orderId}`)
        setInvoice(data)
      } catch (err) {
        console.error('Lỗi tải chi tiết đơn hàng:', err)
        setError(err.message || 'Không thể tải thông tin đơn hàng này.')
      } finally {
        setLoading(false)
      }
    }
    if (orderId) {
      loadInvoice()
    }
  }, [orderId])

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const token = getToken()
      const res = await fetch(`/api/customer/invoices/order/${orderId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) throw new Error('Không thể xuất file PDF')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Invoice-${orderId.substring(0, 8).toUpperCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Không tải được file PDF: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 text-gray-800">
        <div className="bg-white rounded shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Chi tiết Đơn hàng #{orderId.substring(0, 8).toUpperCase()}</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {orderId}</p>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded cursor-pointer border-none bg-transparent transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 min-h-[300px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
                <p className="text-xs text-gray-400 mt-3">Đang tải chi tiết đơn hàng...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">⚠</div>
                <p className="text-sm text-red-600 font-medium">{error}</p>
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold cursor-pointer">Đóng</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">
                {/* Left section: Ordered items */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sản phẩm đã mua</h3>
                  <div className="border border-gray-100 rounded overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_110px_110px] bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-400 border-b border-gray-100">
                      <span>SẢN PHẨM</span>
                      <span className="text-center">SL</span>
                      <span className="text-right">ĐƠN GIÁ</span>
                      <span className="text-right">THÀNH TIỀN</span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-[350px] overflow-y-auto">
                      {invoice.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_80px_110px_110px] px-4 py-3 text-sm items-center hover:bg-gray-50/50">
                          <div>
                            <p className="font-semibold text-gray-800">{item.productName}</p>
                            {item.variantName && (
                              <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                            )}
                            {item.bundleServices && item.bundleServices.length > 0 && (
                              <div className="mt-1 space-y-0.5">
                                {item.bundleServices.map((bundle, bidx) => (
                                  <p key={bidx} className="text-[10px] font-semibold text-blue-600">+ {bundle}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          <span className="text-center font-medium text-gray-600">{item.quantity}</span>
                          <span className="text-right text-gray-700">{fmt(item.unitPrice)}</span>
                          <span className="text-right font-semibold text-gray-800">{fmt(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right section: Info & Summary */}
                <div className="space-y-5">
                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded p-4 border border-gray-200/40 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thông tin giao hàng</h3>
                    <div className="text-sm space-y-2">
                      <div>
                        <p className="text-xs text-gray-400">Người nhận</p>
                        <p className="font-bold text-gray-800">{invoice.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Số điện thoại</p>
                        <p className="font-semibold text-gray-800">{invoice.customerPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Địa chỉ giao hàng</p>
                        <p className="text-gray-700 leading-snug">{invoice.shippingAddress || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gray-50 rounded p-4 border border-gray-200/40 space-y-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phương thức thanh toán</h3>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <PayIcon type={invoice.paymentMethod} />
                      <span>{invoice.paymentMethod || 'Chưa cập nhật'}</span>
                    </div>
                  </div>

                  {/* Billing totals */}
                  <div className="bg-white rounded p-4 border border-gray-200 space-y-2.5">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Chi tiết thanh toán</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tạm tính</span>
                      <span className="font-semibold text-gray-800">{fmt(invoice.originalAmount)}</span>
                    </div>
                    {invoice.discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá thành viên</span>
                        <span>- {fmt(invoice.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Thuế VAT (10%)</span>
                      <span className="font-semibold text-gray-800">+ {fmt(invoice.vatAmount)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                      <span className="text-lg font-black text-[#E8420A]">{fmt(invoice.finalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
            <button onClick={onClose} className="px-5 py-2 border border-gray-200 hover:bg-gray-100 rounded text-sm font-semibold text-gray-600 cursor-pointer transition-colors bg-white">
              Đóng
            </button>
            {!loading && !error && (
              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 bg-[#E8420A] hover:bg-[#C4350A] disabled:opacity-60 text-white rounded text-sm font-semibold cursor-pointer transition-colors"
              >
                {downloading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang tạo file...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Tải Hóa đơn PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
