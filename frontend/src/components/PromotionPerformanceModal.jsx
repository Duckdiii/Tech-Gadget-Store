import { useState, useEffect } from 'react'
import { getPromotionPerformance } from '../services/promotionService'

const STATUS_CONFIG = {
  ACTIVE:   { label: 'Đang chạy',    bg: 'bg-green-100',  text: 'text-green-700'  },
  UPCOMING: { label: 'Sắp diễn ra',  bg: 'bg-yellow-100', text: 'text-yellow-600' },
  ENDED:    { label: 'Kết thúc',     bg: 'bg-gray-100',   text: 'text-gray-500'   },
}

function formatCurrency(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('vi-VN') + ' đ'
}

function formatDateTime(val) {
  if (!val) return '—'
  if (Array.isArray(val)) {
    const [y, mo, d, h = 0, m = 0] = val
    return `${String(d).padStart(2,'0')}/${String(mo).padStart(2,'0')}/${y} ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }
  const dt = new Date(val)
  return dt.toLocaleString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function PromotionPerformanceModal({ isOpen, promotionId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !promotionId) return
    setData(null)
    setError('')
    setLoading(true)
    getPromotionPerformance(promotionId)
      .then(setData)
      .catch((err) => setError(err.message || 'Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [isOpen, promotionId])

  if (!isOpen) return null

  const st = data ? (STATUS_CONFIG[data.status] ?? STATUS_CONFIG.ENDED) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#E8420A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h2 className="text-base font-bold text-gray-900">Hiệu suất khuyến mãi</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-400 text-sm">
              Đang tải dữ liệu...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-5">
              {/* Promotion info */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{data.name}</p>
                  <p className="text-sm text-gray-500 font-mono mt-0.5">{data.code}</p>
                </div>
                {st && (
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold ${st.bg} ${st.text}`}>
                    {st.label}
                  </span>
                )}
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Giảm giá</p>
                  <p className="font-bold text-gray-900">{data.discountPercent}%</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Số sản phẩm</p>
                  <p className="font-bold text-gray-900">{data.productCount}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Bắt đầu</p>
                  <p className="font-semibold text-gray-800 text-xs">{formatDateTime(data.startAt)}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500 mb-1">Kết thúc</p>
                  <p className="font-semibold text-gray-800 text-xs">{formatDateTime(data.endAt)}</p>
                </div>
              </div>

              {/* KPI */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Số đơn hàng (ước tính)</span>
                  <span className="text-sm font-bold text-gray-900">{data.orderCount.toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Doanh thu từ KM (ước tính)</span>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(data.estimatedRevenue)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-sm font-semibold text-[#E8420A]">Tiền giảm ước tính</span>
                  <span className="text-sm font-bold text-[#E8420A]">{formatCurrency(data.estimatedDiscountAmount)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 italic">
                * Số liệu được tính dựa trên đơn hàng chứa sản phẩm trong chiến dịch, không phải doanh thu thực tế có áp mã.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
