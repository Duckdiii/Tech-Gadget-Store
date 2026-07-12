import PayIcon from './PayIcon'

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

export default function TxnDetailModal({ txn, onClose }) {
  const ps = PAY_STATUS[txn.status] || PAY_STATUS.PENDING
  const pmType = (txn.paymentMethodType || 'DEFAULT').toUpperCase()
  const mc = METHOD_COLOR[pmType] || METHOD_COLOR.DEFAULT

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 text-gray-800">
        <div className="bg-white rounded shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
          {/* Status header banner */}
          <div className={`px-6 pt-6 pb-5 ${txn.status === 'SUCCESS' ? 'bg-green-50' : txn.status === 'FAILED' ? 'bg-red-50' : txn.status === 'REFUNDED' ? 'bg-purple-50' : 'bg-amber-50'}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl font-bold ${txn.status === 'SUCCESS' ? 'bg-green-500 text-white' : txn.status === 'FAILED' ? 'bg-red-500 text-white' : txn.status === 'REFUNDED' ? 'bg-purple-500 text-white' : 'bg-amber-400 text-white'}`}>
                  {ps.icon}
                </div>
                <div>
                  <p className={`text-base font-bold ${ps.text}`}>{ps.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{txn.timestamp ? new Date(txn.timestamp).toLocaleString('vi-VN') : ''}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-black/10 rounded cursor-pointer border-none bg-transparent">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-gray-900">{fmt(txn.amount)}</p>
              <p className="text-xs text-gray-400 mt-0.5 font-mono">ID: {txn.id}</p>
            </div>
            {txn.failureReason && (
              <div className="mt-3 bg-red-100 border border-red-200 rounded px-3 py-2 text-xs text-red-600 font-medium">
                ⚠ Lý do lỗi: {txn.failureReason}
              </div>
            )}
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Customer metadata */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Khách hàng</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Họ và tên</span>
                  <span className="font-semibold text-gray-800">{txn.customerName || 'Vãng lai'}</span>
                </div>
                {txn.customerPhone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Số điện thoại</span>
                    <span className="font-semibold text-gray-800">{txn.customerPhone}</span>
                  </div>
                )}
                {txn.customerEmail && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email</span>
                    <span className="font-semibold text-gray-800">{txn.customerEmail}</span>
                  </div>
                )}
              </div>
            </section>

            <div className="border-t border-gray-100" />

            {/* Payment logs details */}
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Phương thức thanh toán</p>
              <div className={`flex items-center gap-3 p-3 rounded mb-3 ${mc.bg}`}>
                <span className={mc.icon}><PayIcon type={txn.paymentMethodType} cls="w-5 h-5" /></span>
                <span className="text-sm font-semibold text-gray-800">{txn.paymentMethod}</span>
              </div>
              {txn.metadata && (
                <div className="space-y-2.5 bg-gray-50 p-3 rounded">
                  {Object.entries(txn.metadata).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-xs font-mono">
                      <span className="text-gray-400">{key}</span>
                      <span className="text-gray-700 truncate max-w-[260px]">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
