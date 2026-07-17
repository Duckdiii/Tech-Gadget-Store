import { useManagerPaymentLogs } from '../hooks/useManagerPaymentLogs'
import PayIcon from './PayIcon'
import TxnDetailModal from './TxnDetailModal'

function fmt(n) {
  return (n || 0).toLocaleString('vi-VN') + ' đ'
}

const PAY_STATUS = {
  SUCCESS:  { label: 'Thành công', bg: 'bg-green-100',  text: 'text-green-700',  icon: '✓' },
  FAILED:   { label: 'Thất bại',   bg: 'bg-red-100',    text: 'text-red-600',    icon: '✕' },
  REFUNDED: { label: 'Hoàn tiền',  bg: 'bg-purple-100', text: 'text-purple-700', icon: '↩' },
  PENDING:  { label: 'Chờ xử lý',  bg: 'bg-amber-100',  text: 'text-amber-700',  icon: '…' },
}

const METHOD_COLOR = {
  MOMO:    { bg: 'bg-pink-50',   icon: 'text-pink-600'   },
  VNPAY:   { bg: 'bg-blue-50',   icon: 'text-blue-600'   },
  COD:     { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
  DEFAULT: { bg: 'bg-gray-50',   icon: 'text-gray-600'   },
}

export default function PaymentLogTab() {
  const {
    loading,
    search,
    setSearch,
    selected,
    setSelected,
    filtered,
  } = useManagerPaymentLogs()

  return (
    <>
      <div className="flex items-center justify-between mb-5 text-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhật ký thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Tìm thấy {filtered.length} giao dịch thanh toán trực tuyến và COD
          </p>
        </div>
      </div>

      {/* Search filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Mã GD, mã đơn, khách hàng..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8420A] bg-white text-gray-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 bg-white rounded border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: 'var(--accent)' }}></div>
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 overflow-hidden text-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[950px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Mã giao dịch', 'Ngày thanh toán', 'Khách hàng', 'Phương thức', 'Mã đơn hàng', 'Số tiền', 'Trạng thái', 'Chi tiết'].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide ${i >= 5 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">Không tìm thấy giao dịch nào</td>
                  </tr>
                ) : (
                  filtered.map(log => {
                    const ps = PAY_STATUS[log.status] || PAY_STATUS.PENDING
                    const pmType = (log.paymentMethodType || 'DEFAULT').toUpperCase()
                    const mc = METHOD_COLOR[pmType] || METHOD_COLOR.DEFAULT
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/60 transition-colors group">
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-semibold text-gray-700">{log.id.substring(0, 10).toUpperCase()}</span>
                        </td>
                        <td className="px-4 py-4 text-left">
                          <p className="text-gray-800 font-medium">{log.timestamp ? new Date(log.timestamp).toLocaleDateString('vi-VN') : 'N/A'}</p>
                          <p className="text-xs text-gray-400">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString('vi-VN') : ''}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800">{log.customerName || 'Vãng lai'}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded ${mc.bg}`}>
                            <span className={mc.icon}><PayIcon type={log.paymentMethodType} cls="w-3.5 h-3.5" /></span>
                            <span className="text-xs font-semibold text-gray-700">{log.paymentMethod}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono font-semibold text-[#E8420A]">{log.orderId ? log.orderId.substring(0, 10).toUpperCase() : 'N/A'}</span>
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-gray-800">{fmt(log.amount)}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${ps.bg} ${ps.text}`}>{ps.label}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button onClick={() => setSelected(log)} className="transition-opacity text-xs font-semibold text-[#E8420A] hover:text-[#C4350A] px-3 py-1.5 rounded hover:bg-orange-50 cursor-pointer whitespace-nowrap border-none bg-transparent">
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <TxnDetailModal txn={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
